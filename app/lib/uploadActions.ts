"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { saveUploadedFile } from "@/app/lib/uploads";
import { extractTransactions } from "@/app/lib/extract";

const VALID_KINDS = new Set(["receipt", "screenshot", "file"]);

export async function processUploadedFile(formData: FormData) {
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File)) {
    throw new Error("파일이 없습니다.");
  }
  if (typeof kind !== "string" || !VALID_KINDS.has(kind)) {
    throw new Error("잘못된 등록 방식입니다.");
  }

  const filePath = await saveUploadedFile(file);
  const transactions = await extractTransactions(file);

  let created = 0;
  let duplicate = 0;

  // 이미지 1장 안에 여러 거래가 있을 수 있으므로 각 거래를 독립적으로 중복 판정한다.
  // 한 건이 중복이거나 저장 중 오류가 나도 나머지 거래 처리는 계속한다.
  for (const extracted of transactions) {
    try {
      // 중복 판정: 날짜 + 사용처 + 금액이 모두 동일하면 같은 거래로 본다.
      const existing = await prisma.transaction.findFirst({
        where: {
          merchantName: extracted.merchantName,
          occurredOn: extracted.occurredOn,
          amount: extracted.amount,
        },
      });

      if (existing) {
        // 새 transaction을 만들지 않고 기존 거래의 source로만 추가한다.
        await prisma.source.create({
          data: {
            transactionId: existing.id,
            kind,
            filePath,
          },
        });
        duplicate += 1;
        continue;
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId: "local",
          occurredOn: extracted.occurredOn,
          merchantName: extracted.merchantName,
          amount: extracted.amount,
        },
      });

      await prisma.source.create({
        data: {
          transactionId: transaction.id,
          kind,
          filePath,
        },
      });

      // 품목은 이 거래의 세부내역일 뿐이므로 거래 총액(amount)과는 별개로,
      // 새로 만든 transaction에만 연결해 저장한다. 별도 거래로 만들거나
      // 월 지출 합계에 다시 더해지지 않는다 (summary.ts는 Transaction.amount만 집계).
      if (extracted.lineItems.length > 0) {
        await prisma.lineItem.createMany({
          data: extracted.lineItems.map((lineItem) => ({
            transactionId: transaction.id,
            name: lineItem.name,
            amount: lineItem.amount,
          })),
        });
      }

      created += 1;
    } catch (error) {
      console.error("거래 저장 중 오류가 발생해 해당 항목을 건너뜁니다:", extracted, error);
    }
  }

  revalidatePath("/");
  revalidatePath("/monthly");
  revalidatePath("/history");

  return {
    recognized: transactions.length,
    created,
    duplicate,
  };
}

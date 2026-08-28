"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

function parseTransactionId(id: string) {
  const transactionId = Number(id);
  if (!Number.isInteger(transactionId)) {
    throw new Error("잘못된 거래 ID입니다.");
  }
  return transactionId;
}

// 수정 가능한 항목은 상호명 / 결제 날짜 / 시간 / 총 결제금액뿐이다.
// 원본 이미지(sources)와 품목(line_items)은 그대로 둔다.
export async function updateTransaction(id: string, formData: FormData) {
  const transactionId = parseTransactionId(id);

  const occurredOnRaw = formData.get("occurredOn");
  const occurredTimeRaw = formData.get("occurredTime");
  const merchantNameRaw = formData.get("merchantName");
  const amountRaw = formData.get("amount");

  const occurredOnStr =
    typeof occurredOnRaw === "string" ? occurredOnRaw : "";
  const occurredTime =
    typeof occurredTimeRaw === "string" && occurredTimeRaw
      ? occurredTimeRaw
      : null;
  const merchantName =
    typeof merchantNameRaw === "string" ? merchantNameRaw.trim() : "";
  const amount =
    typeof amountRaw === "string" ? Number.parseInt(amountRaw, 10) : NaN;

  if (
    !occurredOnStr ||
    !merchantName ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error("날짜, 상호명, 금액을 올바르게 입력해 주세요.");
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      occurredOn: new Date(`${occurredOnStr}T00:00:00`),
      occurredTime,
      merchantName,
      amount,
    },
  });

  revalidatePath("/");
  revalidatePath("/monthly");
  revalidatePath("/history");
  revalidatePath(`/history/${transactionId}`);

  redirect(`/history/${transactionId}`);
}

// sources/line_items는 transactions에 ON DELETE RESTRICT로 걸려 있어
// 자식 행을 먼저 지운 뒤에야 거래를 지울 수 있다. 하나의 트랜잭션으로 묶어
// 중간에 실패해도 일부만 지워지지 않도록 한다.
export async function deleteTransaction(id: string) {
  const transactionId = parseTransactionId(id);

  await prisma.$transaction([
    prisma.lineItem.deleteMany({ where: { transactionId } }),
    prisma.source.deleteMany({ where: { transactionId } }),
    prisma.transaction.delete({ where: { id: transactionId } }),
  ]);

  revalidatePath("/");
  revalidatePath("/monthly");
  revalidatePath("/history");

  redirect("/history");
}

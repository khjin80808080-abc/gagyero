"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { saveUploadedFile } from "@/app/lib/uploads";
import { extractReceiptData } from "@/app/lib/extract";

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
  const extracted = await extractReceiptData(file);

  const transaction = await prisma.transaction.create({
    data: {
      userId: "local",
      occurredOn: extracted.occurredOn,
      occurredTime: extracted.occurredTime,
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

  revalidatePath("/");
  revalidatePath("/monthly");
  revalidatePath("/history");

  return {
    merchantName: extracted.merchantName,
    amount: extracted.amount,
  };
}

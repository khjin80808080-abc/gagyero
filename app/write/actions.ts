"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

export async function createManualTransaction(formData: FormData) {
  const occurredOnRaw = formData.get("occurredOn");
  const occurredTimeRaw = formData.get("occurredTime");
  const merchantNameRaw = formData.get("merchantName");
  const amountRaw = formData.get("amount");
  const memoRaw = formData.get("memo");

  const occurredOnStr =
    typeof occurredOnRaw === "string" && occurredOnRaw
      ? occurredOnRaw
      : new Date().toISOString().slice(0, 10);
  const occurredTime =
    typeof occurredTimeRaw === "string" && occurredTimeRaw
      ? occurredTimeRaw
      : null;
  const merchantName =
    typeof merchantNameRaw === "string" ? merchantNameRaw.trim() : "";
  const amount =
    typeof amountRaw === "string" ? Number.parseInt(amountRaw, 10) : NaN;
  const memo =
    typeof memoRaw === "string" && memoRaw.trim() ? memoRaw.trim() : null;

  if (!merchantName || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("사용처와 금액을 올바르게 입력해 주세요.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: "local",
      occurredOn: new Date(`${occurredOnStr}T00:00:00`),
      occurredTime,
      merchantName,
      amount,
      memo,
    },
  });

  await prisma.source.create({
    data: {
      transactionId: transaction.id,
      kind: "manual",
    },
  });

  revalidatePath("/");
  revalidatePath("/monthly");
  revalidatePath("/history");

  redirect("/history");
}

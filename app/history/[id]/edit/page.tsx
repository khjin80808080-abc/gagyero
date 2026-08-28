import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { updateTransaction } from "@/app/history/[id]/actions";

export const dynamic = "force-dynamic";

// occurredOn은 로컬 날짜로 생성되므로 로컬 getter로 포맷해 하루 밀림을 피한다.
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function EditTransaction({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transactionId = Number(id);

  if (!Number.isInteger(transactionId)) {
    notFound();
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col bg-white px-5 pt-8 pb-10 text-neutral-900">
      <Link href={`/history/${transaction.id}`} className="text-sm text-neutral-400">
        &lt; 취소
      </Link>

      <h1 className="mt-4 text-xl font-bold">거래 수정</h1>

      <form
        action={updateTransaction.bind(null, id)}
        className="mt-6 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="occurredOn"
            className="text-xs font-medium text-neutral-500"
          >
            날짜
          </label>
          <input
            id="occurredOn"
            name="occurredOn"
            type="date"
            defaultValue={toDateInputValue(transaction.occurredOn)}
            required
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="occurredTime"
            className="text-xs font-medium text-neutral-500"
          >
            시간 (선택)
          </label>
          <input
            id="occurredTime"
            name="occurredTime"
            type="time"
            defaultValue={transaction.occurredTime ?? ""}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="merchantName"
            className="text-xs font-medium text-neutral-500"
          >
            사용처
          </label>
          <input
            id="merchantName"
            name="merchantName"
            type="text"
            defaultValue={transaction.merchantName}
            required
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="amount"
            className="text-xs font-medium text-neutral-500"
          >
            금액
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            defaultValue={transaction.amount}
            required
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="mt-2 flex gap-3">
          <Link
            href={`/history/${transaction.id}`}
            className="flex-1 rounded-2xl border border-neutral-200 py-3 text-center text-sm font-semibold text-neutral-700 active:bg-neutral-100"
          >
            취소
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white active:bg-neutral-800"
          >
            저장
          </button>
        </div>
      </form>
    </main>
  );
}

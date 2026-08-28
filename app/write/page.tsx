import Link from "next/link";
import { createManualTransaction } from "@/app/write/actions";

export default function WritePage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex flex-1 flex-col bg-white px-5 pt-8 pb-10 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-400">
        ← 취소
      </Link>

      <h1 className="mt-4 text-xl font-bold">글쓰기로 등록</h1>

      <form
        action={createManualTransaction}
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
            defaultValue={today}
            required
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
            required
            placeholder="예: 스타벅스"
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
            required
            placeholder="0"
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="memo"
            className="text-xs font-medium text-neutral-500"
          >
            메모 (선택)
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={3}
            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white active:bg-neutral-800"
        >
          저장
        </button>
      </form>
    </main>
  );
}

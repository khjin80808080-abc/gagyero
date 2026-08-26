import { getCurrentMonthTotal } from "@/app/lib/summary";
import InputGrid from "@/app/components/InputGrid";

export const dynamic = "force-dynamic";

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default async function Home() {
  const total = await getCurrentMonthTotal();

  return (
    <main
      className="relative flex flex-1 flex-col overflow-hidden px-5 pt-8 pb-10 text-white"
      style={{
        background:
          "linear-gradient(160deg, #33127a 0%, #7c3aed 32%, #c026d3 62%, #fb923c 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-orange-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl"
      />

      <span className="relative text-lg font-bold tracking-tight">가계Ro</span>

      <div className="mt-7">
        <h1 className="text-[26px] font-bold leading-snug">자료 몰아넣기</h1>
        <p className="mt-2 text-sm text-white/80">
          영수증·캡처·파일을 넣으면 AI가 자동 분류·정리해요
        </p>
      </div>

      <span className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
        ✨ 나도 쓸 수 있는 AI 가계부
      </span>

      <InputGrid />

      <div className="mt-6 rounded-2xl bg-white/95 px-4 py-4 shadow-sm">
        <p className="text-xs text-neutral-500">이번 달 지출</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">
          {formatWon(total)}
        </p>
      </div>
    </main>
  );
}

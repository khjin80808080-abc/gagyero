const TOTAL_SPENT = 1284300;
const LAST_MONTH_SAME_PERIOD = 1151900;

const TOP_MERCHANTS = [
  { name: "쿠팡", amount: 158900 },
  { name: "이마트", amount: 143200 },
  { name: "배달의민족", amount: 96500 },
  { name: "스타벅스", amount: 84000 },
  { name: "GS25", amount: 62300 },
] as const;

const BIG_EXPENSES = [
  { name: "이마트", date: "8월 12일", amount: 210000 },
  { name: "쿠팡", date: "8월 3일", amount: 158900 },
  { name: "배달의민족", date: "8월 19일", amount: 96500 },
  { name: "스타벅스", date: "8월 22일", amount: 84000 },
  { name: "GS25", date: "8월 7일", amount: 62300 },
] as const;

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default function Monthly() {
  const diff = TOTAL_SPENT - LAST_MONTH_SAME_PERIOD;
  const diffLabel = diff >= 0 ? "더" : "적게";

  return (
    <main className="flex flex-1 flex-col bg-white text-neutral-900">
      <section
        className="rounded-b-[32px] px-5 pt-8 pb-8 text-white"
        style={{
          background:
            "linear-gradient(160deg, #33127a 0%, #7c3aed 32%, #c026d3 62%, #fb923c 100%)",
        }}
      >
        <h1 className="text-lg font-bold">이번 달</h1>
        <p className="mt-4 text-4xl font-extrabold tracking-tight">
          {formatWon(TOTAL_SPENT)}
        </p>
        <p className="mt-2 text-sm text-white/85">
          지난달 같은 기간보다 {formatWon(Math.abs(diff))} {diffLabel} 사용
        </p>
      </section>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-neutral-500">
          많이 사용한 곳
        </h2>
        <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
          {TOP_MERCHANTS.map((merchant, index) => (
            <div
              key={merchant.name}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{merchant.name}</span>
              </div>
              <span className="text-sm font-semibold">
                {formatWon(merchant.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6 pb-8">
        <h2 className="text-sm font-semibold text-neutral-500">큰 지출</h2>
        <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
          {BIG_EXPENSES.map((expense, index) => (
            <div
              key={`${expense.name}-${expense.date}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{expense.name}</p>
                  <p className="text-xs text-neutral-400">{expense.date}</p>
                </div>
              </div>
              <span className="text-sm font-semibold">
                {formatWon(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import {
  getCurrentMonthTotal,
  getLastMonthSamePeriodTotal,
  getTopMerchantsThisMonth,
  getTopExpensesThisMonth,
} from "@/app/lib/summary";

export const dynamic = "force-dynamic";

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default async function Monthly() {
  const [totalSpent, lastMonthSamePeriod, topMerchants, topExpenses] =
    await Promise.all([
      getCurrentMonthTotal(),
      getLastMonthSamePeriodTotal(),
      getTopMerchantsThisMonth(5),
      getTopExpensesThisMonth(5),
    ]);
  const diff = totalSpent - lastMonthSamePeriod;
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
          {formatWon(totalSpent)}
        </p>
        <p className="mt-2 text-sm text-white/85">
          지난달 같은 기간보다 {formatWon(Math.abs(diff))} {diffLabel} 사용
        </p>
      </section>

      <section className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-neutral-500">
          많이 사용한 곳
        </h2>
        {topMerchants.length === 0 ? (
          <p className="mt-3 py-8 text-center text-sm text-neutral-400">
            아직 기록이 없어요
          </p>
        ) : (
          <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
            {topMerchants.map((merchant, index) => (
              <div
                key={merchant.merchantName}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {merchant.merchantName}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {merchant.count}건
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatWon(merchant.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pt-6 pb-8">
        <h2 className="text-sm font-semibold text-neutral-500">큰 지출</h2>
        {topExpenses.length === 0 ? (
          <p className="mt-3 py-8 text-center text-sm text-neutral-400">
            아직 기록이 없어요
          </p>
        ) : (
          <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
            {topExpenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {expense.merchantName}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(expense.occurredOn)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatWon(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

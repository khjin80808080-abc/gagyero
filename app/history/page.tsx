const HISTORY = [
  {
    date: "8월 22일",
    items: [
      { time: "09:12", merchant: "스타벅스 강남점", amount: 4500, icon: "🧾" },
      { time: "13:40", merchant: "GS25", amount: 3200, icon: "🧾" },
      { time: "19:05", merchant: "배달의민족", amount: 24000, icon: "🎤" },
    ],
  },
  {
    date: "8월 21일",
    items: [
      { time: "11:02", merchant: "쿠팡", amount: 158900, icon: "📁" },
      { time: "20:31", merchant: "이마트", amount: 84300, icon: "🧾" },
    ],
  },
  {
    date: "8월 19일",
    items: [
      { time: "08:47", merchant: "스타벅스 강남점", amount: 5100, icon: "🧾" },
      { time: "12:15", merchant: "김밥천국", amount: 8000, icon: "✍️" },
      { time: "18:22", merchant: "다이소", amount: 12300, icon: "🖼️" },
    ],
  },
] as const;

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export default function History() {
  return (
    <main className="flex flex-1 flex-col bg-white text-neutral-900">
      <section
        className="rounded-b-[32px] px-5 pt-8 pb-6 text-white"
        style={{
          background:
            "linear-gradient(160deg, #33127a 0%, #7c3aed 32%, #c026d3 62%, #fb923c 100%)",
        }}
      >
        <h1 className="text-lg font-bold">내역</h1>
      </section>

      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        {HISTORY.map((group) => (
          <section key={group.date}>
            <h2 className="text-sm font-semibold text-neutral-500">
              {group.date}
            </h2>
            <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
              {group.items.map((item) => (
                <div
                  key={`${group.date}-${item.time}-${item.merchant}`}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-base">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.merchant}</p>
                      <p className="text-xs text-neutral-400">{item.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatWon(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

const KIND_ICON: Record<string, string> = {
  receipt: "🧾",
  voice: "🎤",
  manual: "✍️",
  screenshot: "🖼️",
  file: "📁",
};

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatDateHeading(date: Date) {
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

export default async function History() {
  const transactions = await prisma.transaction.findMany({
    orderBy: [{ occurredOn: "desc" }, { id: "desc" }],
    include: { sources: true },
  });

  const groups: { dateKey: string; heading: string; items: typeof transactions }[] = [];
  for (const transaction of transactions) {
    const dateKey = transaction.occurredOn.toISOString().slice(0, 10);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateKey === dateKey) {
      lastGroup.items.push(transaction);
    } else {
      groups.push({
        dateKey,
        heading: formatDateHeading(transaction.occurredOn),
        items: [transaction],
      });
    }
  }

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
        {groups.length === 0 && (
          <p className="pt-8 text-center text-sm text-neutral-400">
            아직 등록된 기록이 없습니다.
          </p>
        )}

        {groups.map((group) => (
          <section key={group.dateKey}>
            <h2 className="text-sm font-semibold text-neutral-500">
              {group.heading}
            </h2>
            <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-base">
                      {KIND_ICON[item.sources[0]?.kind ?? "manual"] ?? "✍️"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {item.merchantName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {item.occurredTime ?? "시간 미상"}
                      </p>
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

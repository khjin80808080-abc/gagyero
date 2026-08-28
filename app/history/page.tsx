import Link from "next/link";
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

// occurredOn은 로컬 날짜(YYYY-MM-DDT00:00:00)로 생성되므로, toISOString()의
// UTC 변환으로 날짜가 하루 밀리는 것을 피하기 위해 로컬 getter로 포맷한다.
function formatDateHeading(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export default async function History() {
  const transactions = await prisma.transaction.findMany({
    orderBy: [{ occurredOn: "desc" }, { id: "desc" }],
    include: { sources: true },
  });

  const groups: {
    dateKey: string;
    heading: string;
    year: number;
    items: typeof transactions;
  }[] = [];
  for (const transaction of transactions) {
    const date = transaction.occurredOn;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateKey === dateKey) {
      lastGroup.items.push(transaction);
    } else {
      groups.push({
        dateKey,
        heading: formatDateHeading(date),
        year: date.getFullYear(),
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

        {groups.map((group, index) => {
          const isNewYear = index === 0 || groups[index - 1].year !== group.year;
          return (
            <section
              key={group.dateKey}
              className={
                isNewYear && index > 0
                  ? "border-t border-neutral-100 pt-6"
                  : undefined
              }
            >
              <h3 className="text-sm font-semibold text-neutral-500">
                {group.heading}
              </h3>
              <div className="mt-3 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/history/${item.id}`}
                    className="flex items-center justify-between px-4 py-3 active:bg-neutral-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-base">
                        {KIND_ICON[item.sources[0]?.kind ?? "manual"] ?? "✍️"}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {item.merchantName}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatWon(item.amount)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

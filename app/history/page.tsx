import { prisma } from "@/app/lib/prisma";
import HistoryCalendar from "@/app/components/HistoryCalendar";
import HistoryList from "@/app/components/HistoryList";

export const dynamic = "force-dynamic";

export default async function History() {
  const transactions = await prisma.transaction.findMany({
    orderBy: [{ occurredOn: "desc" }, { id: "desc" }],
    include: { sources: true },
  });

  const calendarTransactions = transactions.map((transaction) => {
    const date = transaction.occurredOn;
    return {
      id: transaction.id,
      merchantName: transaction.merchantName,
      amount: transaction.amount,
      occurredTime: transaction.occurredTime,
      dateKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    };
  });

  const historyItems = transactions.map((transaction) => {
    const date = transaction.occurredOn;
    return {
      id: transaction.id,
      merchantName: transaction.merchantName,
      amount: transaction.amount,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dateKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      kind: transaction.sources[0]?.kind ?? "manual",
    };
  });

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

      <HistoryCalendar transactions={calendarTransactions} />

      <HistoryList items={historyItems} />
    </main>
  );
}

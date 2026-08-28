import { prisma } from "@/app/lib/prisma";

function getCurrentMonthRange() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { monthStart, nextMonthStart };
}

export async function getCurrentMonthTotal() {
  const { monthStart, nextMonthStart } = getCurrentMonthRange();

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { occurredOn: { gte: monthStart, lt: nextMonthStart } },
  });

  return result._sum.amount ?? 0;
}

// 지난달 전체(1일~말일)의 합계. 지난달에 거래가 하나도 없으면 null을
// 반환해, 화면에서 "0원과 비교"가 아니라 "거래 없음"으로 구분해 보여줄 수
// 있게 한다.
export async function getLastMonthTotal() {
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      occurredOn: { gte: lastMonthStart, lt: lastMonthEnd },
    },
  });

  return result._sum.amount;
}

export async function getTopMerchantsThisMonth(limit: number) {
  const { monthStart, nextMonthStart } = getCurrentMonthRange();

  const grouped = await prisma.transaction.groupBy({
    by: ["merchantName"],
    where: { occurredOn: { gte: monthStart, lt: nextMonthStart } },
    _sum: { amount: true },
    _count: { _all: true },
  });

  return grouped
    .map((group) => ({
      merchantName: group.merchantName,
      totalAmount: group._sum.amount ?? 0,
      count: group._count._all,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

export async function getTopExpensesThisMonth(limit: number) {
  const { monthStart, nextMonthStart } = getCurrentMonthRange();

  return prisma.transaction.findMany({
    where: { occurredOn: { gte: monthStart, lt: nextMonthStart } },
    orderBy: { amount: "desc" },
    take: limit,
  });
}

import { prisma } from "@/app/lib/prisma";

export async function getCurrentMonthTotal() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { occurredOn: { gte: monthStart, lt: nextMonthStart } },
  });

  return result._sum.amount ?? 0;
}

export async function getLastMonthSamePeriodTotal() {
  const now = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthSamePeriodEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate() + 1,
  );

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      occurredOn: { gte: lastMonthStart, lt: lastMonthSamePeriodEnd },
    },
  });

  return result._sum.amount ?? 0;
}

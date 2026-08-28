"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface CalendarTransaction {
  id: number;
  merchantName: string;
  amount: number;
  occurredTime: string | null;
  dateKey: string; // "YYYY-MM-DD", 로컬 날짜 기준
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function dateKeyFor(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function HistoryCalendar({
  transactions,
}: {
  transactions: CalendarTransaction[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const transaction of transactions) set.add(transaction.dateKey);
    return set;
  }, [transactions]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function goToMonth(delta: number) {
    setSelectedDateKey(null);
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const selectedTransactions = selectedDateKey
    ? transactions.filter((t) => t.dateKey === selectedDateKey)
    : [];

  return (
    <section className="px-5 pt-6">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          aria-label="이전 달"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 active:bg-neutral-100"
        >
          &lt;
        </button>
        <p className="text-sm font-semibold text-neutral-900">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          aria-label="다음 달"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 active:bg-neutral-100"
        >
          &gt;
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-xs text-neutral-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} />;
          }
          const key = dateKeyFor(year, month, day);
          const hasTransaction = markedDates.has(key);
          const isSelected = selectedDateKey === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedDateKey(isSelected ? null : key)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-full text-sm ${
                isSelected
                  ? "bg-violet-600 text-white"
                  : "text-neutral-800 active:bg-neutral-100"
              }`}
            >
              <span>{day}</span>
              <span
                className={`h-1 w-1 rounded-full ${
                  hasTransaction
                    ? isSelected
                      ? "bg-white"
                      : "bg-violet-600"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {selectedDateKey && (
        <div className="mt-4 divide-y divide-neutral-100 rounded-2xl bg-neutral-50 shadow-sm">
          {selectedTransactions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-400">
              이 날짜에 등록된 거래가 없습니다.
            </p>
          ) : (
            selectedTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/history/${transaction.id}`}
                className="flex items-center justify-between px-4 py-3 active:bg-neutral-100"
              >
                <div>
                  <p className="text-sm font-medium">
                    {transaction.merchantName}
                  </p>
                  {transaction.occurredTime && (
                    <p className="text-xs text-neutral-400">
                      {transaction.occurredTime}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold">
                  {formatWon(transaction.amount)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </section>
  );
}

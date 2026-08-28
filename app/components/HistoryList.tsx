"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface HistoryListItem {
  id: number;
  merchantName: string;
  amount: number;
  year: number;
  month: number; // 1-12
  day: number;
  dateKey: string; // "YYYY-MM-DD", 로컬 날짜 기준
  kind: string;
}

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

function formatDateHeading(item: HistoryListItem) {
  return `${item.year}년 ${item.month}월 ${item.day}일`;
}

// 상호명 부분 일치 또는 날짜 검색("2017", "2017.06"/"2017-06", "2017.06.02"/"2017-06-02")만 지원한다.
function matchesSearch(item: HistoryListItem, rawQuery: string) {
  const query = rawQuery.trim();
  if (!query) return true;

  if (item.merchantName.toLowerCase().includes(query.toLowerCase())) {
    return true;
  }

  const dateMatch = query.match(
    /^(\d{4})(?:[.-](\d{1,2}))?(?:[.-](\d{1,2}))?$/,
  );
  if (dateMatch) {
    const [, yearStr, monthStr, dayStr] = dateMatch;
    if (Number(yearStr) !== item.year) return false;
    if (monthStr && Number(monthStr) !== item.month) return false;
    if (dayStr && Number(dayStr) !== item.day) return false;
    return true;
  }

  return false;
}

export default function HistoryList({ items }: { items: HistoryListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => items.filter((item) => matchesSearch(item, query)),
    [items, query],
  );

  const groups = useMemo(() => {
    const list: {
      dateKey: string;
      year: number;
      items: HistoryListItem[];
    }[] = [];
    for (const item of filtered) {
      const last = list[list.length - 1];
      if (last && last.dateKey === item.dateKey) {
        last.items.push(item);
      } else {
        list.push({ dateKey: item.dateKey, year: item.year, items: [item] });
      }
    }
    return list;
  }, [filtered]);

  return (
    <>
      <div className="px-5 pt-6">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="상호명 또는 날짜 검색 (예: 이마트, 2017.06)"
          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        {items.length === 0 && (
          <p className="pt-8 text-center text-sm text-neutral-400">
            아직 등록된 기록이 없습니다.
          </p>
        )}

        {items.length > 0 && groups.length === 0 && (
          <p className="pt-8 text-center text-sm text-neutral-400">
            검색 결과가 없습니다.
          </p>
        )}

        {groups.map((group, index) => {
          const isNewYear =
            index === 0 || groups[index - 1].year !== group.year;
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
                {formatDateHeading(group.items[0])}
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
                        {KIND_ICON[item.kind] ?? "✍️"}
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
    </>
  );
}

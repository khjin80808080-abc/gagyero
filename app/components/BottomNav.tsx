"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "/monthly", label: "이번달", icon: "📅" },
  { href: "/history", label: "내역", icon: "📋" },
  { href: "/ai", label: "AI", icon: "🤖" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-black/10 bg-[var(--background)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? "text-[var(--foreground)] font-semibold" : "text-black/40"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import {
  Home,
  ClipboardList,
  Sparkles,
  MessageCircle,
  User,
  Bell,
  CalendarDays,
  Award,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getActiveCandidates } from "../lib/ai";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const clientItems: NavItem[] = [
  { to: "/client/home", label: "홈", icon: Home },
  { to: "/client/requests", label: "의뢰관리", icon: ClipboardList },
  { to: "/client/matching", label: "AI 매칭", icon: Sparkles },
  { to: "/client/chat", label: "채팅", icon: MessageCircle },
  { to: "/client/me", label: "내정보", icon: User },
];

const workerItems: NavItem[] = [
  { to: "/worker/home", label: "홈", icon: Home },
  { to: "/worker/notifications", label: "알림", icon: Bell },
  { to: "/worker/schedule", label: "일정", icon: CalendarDays },
  { to: "/worker/chat", label: "채팅", icon: MessageCircle },
  { to: "/worker/me", label: "내경력", icon: Award },
];

export default function BottomNav() {
  const { role, requests, workers, matches, myWorkerId } = useApp();
  const items = role === "worker" ? workerItems : clientItems;

  const newArrivalsCount =
    role === "worker" && myWorkerId
      ? requests
          .filter((r) => r.status === "matching" || r.status === "matched")
          .filter((r) => {
            const candidates = getActiveCandidates(r, workers, matches, 5);
            if (!candidates.some((c) => c.worker.id === myWorkerId)) return false;
            const m = matches.find(
              (m) => m.requestId === r.id && m.workerId === myWorkerId
            );
            return !m || m.workerResponse === "pending";
          }).length
      : 0;

  return (
    <nav className="shrink-0 bg-white border-t border-navy-100 flex items-stretch px-1 pb-safe">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
              isActive ? "text-teal-600" : "text-navy-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                {to === "/worker/notifications" && newArrivalsCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {newArrivalsCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

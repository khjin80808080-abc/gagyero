import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export default function TopBar({
  title,
  onBack,
  showBack = true,
  right,
  transparent = false,
}: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header
      className={`shrink-0 h-14 flex items-center px-2 ${
        transparent ? "bg-transparent" : "bg-white border-b border-navy-100"
      }`}
    >
      <div className="w-10 flex items-center justify-start">
        {showBack && (
          <button
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="p-2 -ml-1 rounded-full active:bg-navy-50 text-navy-700"
            aria-label="뒤로가기"
          >
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h1 className="flex-1 text-center text-[15px] font-bold text-navy-800 truncate px-1">
        {title}
      </h1>
      <div className="w-10 flex items-center justify-end">{right}</div>
    </header>
  );
}

import { PartyPopper, MessageCircle, FileCheck2, X } from "lucide-react";

interface MatchModalProps {
  onChat: () => void;
  onTerms: () => void;
  onLater: () => void;
}

export default function MatchModal({ onChat, onTerms, onLater }: MatchModalProps) {
  return (
    <div className="absolute inset-0 z-30 bg-navy-900/55 flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full bg-white rounded-3xl p-6 text-center animate-pop-in relative">
        <button
          onClick={onLater}
          className="absolute top-3 right-3 p-1.5 text-navy-300"
          aria-label="닫기"
        >
          <X size={18} />
        </button>
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
          <PartyPopper size={30} className="text-teal-500" />
        </div>
        <h2 className="text-lg font-extrabold text-navy-800">
          서로의 조건이
          <br />
          일치했습니다.
        </h2>
        <p className="text-[13px] text-navy-400 mt-2">
          이제 업무 내용을 협의해 보세요.
        </p>

        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={onChat}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white bg-teal-500 active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={18} />
            채팅 시작
          </button>
          <button
            onClick={onTerms}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-navy-700 bg-navy-50"
          >
            <FileCheck2 size={18} />
            업무 조건 확인
          </button>
          <button onClick={onLater} className="w-full py-2 text-[13px] text-navy-300 font-semibold">
            나중에 확인
          </button>
        </div>
      </div>
    </div>
  );
}

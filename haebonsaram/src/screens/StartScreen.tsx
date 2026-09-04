import { Briefcase, HardHat, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function StartScreen() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  function goClient() {
    setRole("client");
    navigate("/client/home");
  }
  function goWorker() {
    setRole("worker");
    navigate("/worker/home");
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-navy-800 via-navy-800 to-navy-900 text-white px-6 pt-14 pb-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-1">
          <ShieldCheck size={32} className="text-teal-300" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">베테랑</h1>
          <p className="mt-1.5 text-xs text-teal-300 font-semibold">
            내 시간과 경력은 소중하니까, 나에게 맞는 일만.
          </p>
          <p className="mt-3 text-sm text-navy-200 leading-relaxed">
            일감을 찾아다니지 마세요.
            <br />
            AI가 내 경력에 맞는 일을 찾아
            <br />
            먼저 알려드립니다.
          </p>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-teal-300 text-xs font-semibold bg-white/5 px-3 py-1.5 rounded-full">
          <Sparkles size={14} />
          <span>AI는 찾고, 베테랑은 선택합니다.</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 animate-slide-up">
        <button
          onClick={goClient}
          className="w-full flex items-center gap-4 bg-white text-navy-800 rounded-2xl px-5 py-4 shadow-floating active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
            <Briefcase size={22} className="text-navy-700" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-[15px]">일을 맡기고 싶어요</p>
            <p className="text-xs text-navy-400 mt-0.5">경력자를 찾는 의뢰자</p>
          </div>
        </button>

        <button
          onClick={goWorker}
          className="w-full flex items-center gap-4 bg-teal-500 text-white rounded-2xl px-5 py-4 shadow-floating active:scale-[0.98] transition-transform"
        >
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <HardHat size={22} className="text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-[15px]">내 경력으로 일하고 싶어요</p>
            <p className="text-xs text-teal-50 mt-0.5">한 번 등록하면 검색 없이 알림만 받아요</p>
          </div>
        </button>

        <div className="flex items-center justify-center gap-1 text-[11px] text-navy-300 mt-1">
          <Star size={12} className="text-teal-300 fill-teal-300" />
          <span>AI가 전체 경력자를 분석해 5명으로 압축합니다</span>
        </div>
      </div>
    </div>
  );
}

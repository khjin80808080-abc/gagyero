import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ShieldCheck, FileText, X, CheckCircle2 } from "lucide-react";
import TopBar from "../components/TopBar";
import { useApp } from "../context/AppContext";

export default function ChatScreen() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const {
    role,
    matches,
    getRequest,
    getWorker,
    addChatMessage,
    updateTerms,
  } = useApp();

  const match = matches.find((m) => m.id === matchId);
  const [text, setText] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  const req = match ? getRequest(match.requestId) : undefined;
  const worker = match ? getWorker(match.workerId) : undefined;

  useEffect(() => {
    if (!match || seeded.current || match.messages.length > 0) return;
    seeded.current = true;
    const other = role === "worker" ? "client" : "worker";
    addChatMessage(
      match.id,
      other,
      role === "worker"
        ? "안녕하세요! 매칭되어 반갑습니다. 업무 관련해서 편하게 협의해요 :)"
        : `안녕하세요, ${worker?.name ?? ""}입니다. 업무 시간과 장소 먼저 맞춰볼까요?`
    );
  }, [match, role, worker, addChatMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [match?.messages.length]);

  if (!match || !req || !worker) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="채팅" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          대화 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    addChatMessage(match!.id, role === "worker" ? "worker" : "client", text.trim());
    setText("");
  }

  return (
    <div className="h-full flex flex-col relative">
      <TopBar
        title={role === "worker" ? req.title : worker.name}
        right={
          <button onClick={() => setShowTerms(true)} className="p-2 text-navy-500">
            <FileText size={19} />
          </button>
        }
      />

      <div className="mx-4 mt-3 flex items-center gap-2 bg-navy-50 rounded-xl px-3 py-2 text-[11.5px] text-navy-500">
        <ShieldCheck size={15} className="text-teal-600 shrink-0" />
        안전결제 예정 · 업무 조건 확정 후 안전하게 대금을 지급할 수 있어요
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-2.5">
        {match.messages.map((m) => {
          const mine = m.sender === (role === "worker" ? "worker" : "client");
          return (
            <div
              key={m.id}
              className={`max-w-[78%] flex flex-col ${mine ? "self-end items-end" : "self-start items-start"}`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  mine
                    ? "bg-teal-500 text-white rounded-br-sm"
                    : "bg-white text-navy-700 rounded-bl-sm shadow-card"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-navy-300 mt-1 px-1">{m.time}</span>
            </div>
          );
        })}
        {match.terms.confirmed && (
          <div className="self-center bg-navy-800 text-white text-[12px] font-semibold rounded-full px-3.5 py-1.5 flex items-center gap-1.5 mt-1">
            <CheckCircle2 size={13} className="text-teal-300" />
            업무 조건이 확정되었습니다
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-t border-navy-100">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full bg-navy-50 px-4 py-2.5 text-[13.5px] focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <Send size={16} />
        </button>
      </div>

      {showTerms && (
        <TermsSheet
          matchId={match.id}
          terms={match.terms}
          onClose={() => setShowTerms(false)}
          onUpdate={(t) => updateTerms(match.id, t)}
        />
      )}
    </div>
  );
}

function TermsSheet({
  terms,
  onClose,
  onUpdate,
}: {
  matchId: string;
  terms: { schedule: string; location: string; amount: string; scope: string; confirmed: boolean };
  onClose: () => void;
  onUpdate: (t: Partial<typeof terms>) => void;
}) {
  const [local, setLocal] = useState(terms);
  const fieldClass =
    "w-full rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2.5 text-[13.5px] text-navy-800 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-400";

  return (
    <div className="absolute inset-0 z-30 bg-navy-900/50 flex items-end animate-fade-in">
      <div className="w-full bg-white rounded-t-3xl p-5 pb-6 animate-slide-up max-h-[85%] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-extrabold text-navy-800">업무 조건 확인</h3>
          <button onClick={onClose} className="p-1 text-navy-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[12.5px] font-bold text-navy-600 mb-1 block">업무 일정</label>
            <input
              className={fieldClass}
              placeholder="예) 9월 5일 오후 2시 ~ 7시"
              value={local.schedule}
              onChange={(e) => setLocal((s) => ({ ...s, schedule: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-navy-600 mb-1 block">장소</label>
            <input
              className={fieldClass}
              placeholder="예) 세종시 나성동 OO식당"
              value={local.location}
              onChange={(e) => setLocal((s) => ({ ...s, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-navy-600 mb-1 block">금액</label>
            <input
              className={fieldClass}
              placeholder="예) 150,000원"
              value={local.amount}
              onChange={(e) => setLocal((s) => ({ ...s, amount: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[12.5px] font-bold text-navy-600 mb-1 block">업무 범위</label>
            <textarea
              className={`${fieldClass} min-h-[70px] resize-none`}
              placeholder="예) 재료 손질, 조리 보조, 마감 정리"
              value={local.scope}
              onChange={(e) => setLocal((s) => ({ ...s, scope: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 bg-navy-50 rounded-xl px-3.5 py-2.5 text-[11.5px] text-navy-500">
          <ShieldCheck size={15} className="text-teal-600 shrink-0" />
          확정 시 안전결제(예정) 절차 안내가 진행됩니다.
        </div>

        <button
          onClick={() => {
            onUpdate({ ...local, confirmed: true });
            onClose();
          }}
          className="mt-4 w-full rounded-2xl py-3.5 font-bold text-white bg-teal-500 active:scale-[0.98] transition-transform"
        >
          조건 확정하기
        </button>
      </div>
    </div>
  );
}

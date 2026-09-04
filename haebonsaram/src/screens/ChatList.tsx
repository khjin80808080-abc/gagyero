import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ChatList() {
  const navigate = useNavigate();
  const { role, matches, getRequest, getWorker } = useApp();
  const matched = matches.filter((m) => m.matched);

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-navy-800 mb-5">채팅</h1>

      {matched.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={22} className="text-navy-300" />
          </div>
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            아직 매칭된 채팅이 없어요.
            <br />
            {role === "worker"
              ? "추천일감에서 관심을 보내보세요."
              : "AI 매칭에서 경력자에게 관심을 보내보세요."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {matched.map((m) => {
            const req = getRequest(m.requestId);
            const worker = getWorker(m.workerId);
            if (!req || !worker) return null;
            const last = m.messages[m.messages.length - 1];
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/chat/${m.id}`)}
                className="w-full text-left bg-white rounded-2xl shadow-card p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center text-xl shrink-0">
                  {role === "worker" ? "🏬" : worker.avatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-navy-800 line-clamp-1">
                    {role === "worker" ? req.title : worker.name}
                  </p>
                  <p className="text-[12.5px] text-navy-400 line-clamp-1 mt-0.5">
                    {last ? last.text : "매칭 완료! 대화를 시작해보세요."}
                  </p>
                </div>
                {m.terms.confirmed && (
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 rounded-full px-2 py-1 shrink-0">
                    확정
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

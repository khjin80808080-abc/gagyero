import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Wallet, Gauge, ThumbsDown, Heart, BellOff } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getActiveCandidates } from "../../lib/ai";
import ScoreRing from "../../components/ScoreRing";
import MatchModal from "../../components/MatchModal";

export default function WorkerNotifications() {
  const navigate = useNavigate();
  const {
    requests,
    workers,
    matches,
    myWorkerId,
    getWorker,
    sendWorkerInterest,
    declineMatch,
    markMatchPopupSeen,
  } = useApp();
  const myWorker = myWorkerId ? getWorker(myWorkerId) : undefined;
  const active = requests.filter((r) => r.status === "matching" || r.status === "matched");
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);

  function handleInterest(requestId: string) {
    if (!myWorker) return;
    const result = sendWorkerInterest(myWorker.id, requestId);
    if (result.matched && !result.seenPopup) setMatchedMatchId(result.id);
  }

  function closeMatch(next: "chat" | "terms" | "later") {
    if (matchedMatchId) markMatchPopupSeen(matchedMatchId);
    const currentId = matchedMatchId;
    setMatchedMatchId(null);
    if (next !== "later" && currentId) navigate(`/chat/${currentId}`);
  }

  const arrivals = useMemo(() => {
    if (!myWorker) return [];
    return active
      .map((r) => {
        const candidates = getActiveCandidates(r, workers, matches, 5);
        const mine = candidates.find((c) => c.worker.id === myWorker.id);
        return mine ? { request: r, ...mine } : null;
      })
      .filter(
        (
          x
        ): x is {
          request: (typeof active)[number];
          worker: NonNullable<typeof myWorker>;
          score: number;
          reasons: string[];
        } => !!x
      )
      .filter((x) => {
        const m = matches.find((m) => m.requestId === x.request.id && m.workerId === myWorker.id);
        return !m || m.workerResponse === "pending";
      })
      .sort((a, b) => b.score - a.score);
  }, [active, workers, matches, myWorker]);

  if (!myWorker) {
    return (
      <div className="px-5 pt-6 pb-6 animate-fade-in">
        <h1 className="text-xl font-extrabold text-navy-800 mb-4">알림</h1>
        <p className="text-[13.5px] text-navy-400">
          경력 프로필을 등록하면 AI가 알림을 보내드려요.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-navy-800 mb-1">알림</h1>
      <p className="text-[13px] text-navy-400 mb-5">
        AI가 회원님의 경력과 맞는 일만 골라서 보내드려요.
      </p>

      {arrivals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <BellOff size={20} className="text-navy-300" />
          </div>
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            새로운 알림이 없어요.
            <br />
            조건에 맞는 일이 생기면 바로 알려드릴게요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {arrivals.map(({ request, score, reasons }) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-card p-4">
              <button
                onClick={() => navigate(`/jobs/${request.id}`)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 rounded-full px-2 py-0.5">
                    회원님과 {score}% 일치
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-[14.5px] text-navy-800 flex-1 line-clamp-2">
                    {request.title}
                  </p>
                  <ScoreRing score={score} size={44} />
                </div>

                <div className="mt-2.5 flex flex-col gap-1.5 text-[12.5px] text-navy-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} /> {request.startDate} · {request.workTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} /> {request.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet size={13} /> 예상 {request.budget.toLocaleString()}원
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Gauge size={13} /> 난이도 {request.difficulty}
                  </span>
                </div>

                <ul className="mt-2.5 flex flex-col gap-1">
                  {reasons.map((r, i) => (
                    <li key={i} className="text-[12.5px] text-teal-700 flex items-start gap-1.5">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </button>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => declineMatch(request.id, myWorker.id)}
                  className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-navy-500 bg-navy-50 flex items-center justify-center gap-1.5"
                >
                  <ThumbsDown size={14} />
                  이번에는 거절
                </button>
                <button
                  onClick={() => handleInterest(request.id)}
                  className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white bg-teal-500 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Heart size={14} />
                  관심 있음
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {matchedMatchId && (
        <MatchModal
          onChat={() => closeMatch("chat")}
          onTerms={() => closeMatch("terms")}
          onLater={() => closeMatch("later")}
        />
      )}
    </div>
  );
}

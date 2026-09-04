import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Star, CheckCircle2, Clock, Heart } from "lucide-react";
import TopBar from "../../components/TopBar";
import Tag from "../../components/Tag";
import ScoreRing from "../../components/ScoreRing";
import MatchModal from "../../components/MatchModal";
import { useApp } from "../../context/AppContext";
import { getActiveCandidates } from "../../lib/ai";

export default function RecommendationList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequest, workers, matches, sendClientInterest, markMatchPopupSeen } = useApp();
  const request = id ? getRequest(id) : undefined;
  const [matchedMatchId, setMatchedMatchId] = useState<string | null>(null);

  const ranked = useMemo(() => {
    if (!request) return [];
    return getActiveCandidates(request, workers, matches, 5);
  }, [request, workers, matches]);

  function handleSendInterest(workerId: string) {
    if (!request) return;
    const result = sendClientInterest(request.id, workerId);
    if (result.matched && !result.seenPopup) setMatchedMatchId(result.id);
  }

  function closeMatch(next: "chat" | "terms" | "later") {
    if (matchedMatchId) markMatchPopupSeen(matchedMatchId);
    const currentId = matchedMatchId;
    setMatchedMatchId(null);
    if (next !== "later" && currentId) navigate(`/chat/${currentId}`);
  }

  if (!request) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="AI 추천 경력자" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          의뢰 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <TopBar title="AI 추천 경력자" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        <p className="text-[13px] text-navy-400 mb-1">{request.title}</p>
        <p className="text-[15px] font-bold text-navy-800 mb-4">
          AI가 조건에 맞는 경력자 {ranked.length}명을 찾았습니다
        </p>

        <div className="flex flex-col gap-3 pb-4">
          {ranked.map(({ worker, score, reasons }) => {
            const interested = request.clientInterestWorkerIds.includes(worker.id);
            const match = matches.find(
              (m) => m.requestId === request.id && m.workerId === worker.id
            );
            const workerResponse = match?.workerResponse ?? "pending";
            return (
              <div key={worker.id} className="bg-white rounded-2xl shadow-card p-4">
                <button
                  onClick={() =>
                    navigate(`/worker/${worker.id}?requestId=${request.id}`)
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center text-2xl shrink-0">
                      {worker.avatarEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[15px] text-navy-800">
                          {worker.name}
                        </p>
                        <ScoreRing score={score} size={40} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[12.5px] text-navy-400 line-clamp-1">
                          {worker.analysis?.mainJob ?? "경력 분석 중"} ·{" "}
                          {worker.totalCareerYears}년
                        </p>
                        {workerResponse === "interested" && (
                          <Tag>경력자 응답함</Tag>
                        )}
                        {workerResponse === "pending" && (
                          <Tag tone="gray">응답 대기중</Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 mt-1.5 text-[11.5px] text-navy-400">
                        <span className="flex items-center gap-0.5">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          {worker.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <CheckCircle2 size={12} />
                          완료 {worker.completedJobs}건
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={12} />
                          {worker.distanceKm}km
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between bg-navy-50/60 rounded-xl px-3 py-2">
                    <span className="text-[12.5px] text-navy-500 flex items-center gap-1">
                      <Clock size={13} /> {worker.availableTime}
                    </span>
                    <span className="text-[12.5px] font-bold text-navy-700">
                      예상 {worker.desiredRate}
                    </span>
                  </div>

                  <ul className="mt-3 flex flex-col gap-1">
                    {reasons.map((r, i) => (
                      <li
                        key={i}
                        className="text-[12.5px] text-teal-700 flex items-start gap-1.5"
                      >
                        <span className="text-teal-500 mt-0.5">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </button>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/worker/${worker.id}?requestId=${request.id}`)
                    }
                    className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-navy-600 bg-navy-50"
                  >
                    프로필 보기
                  </button>
                  <button
                    onClick={() => handleSendInterest(worker.id)}
                    disabled={interested}
                    className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      interested
                        ? "bg-teal-50 text-teal-600"
                        : "bg-teal-500 text-white active:scale-[0.98]"
                    }`}
                  >
                    <Heart size={14} className={interested ? "fill-teal-500" : ""} />
                    {interested ? "관심 보냄" : "관심 보내기"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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

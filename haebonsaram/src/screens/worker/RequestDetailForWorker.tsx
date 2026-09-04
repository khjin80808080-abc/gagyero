import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  CalendarDays,
  Wallet,
  Gauge,
  Users,
  ShieldCheck,
  Heart,
  ThumbsDown,
} from "lucide-react";
import TopBar from "../../components/TopBar";
import Tag from "../../components/Tag";
import ScoreRing from "../../components/ScoreRing";
import MatchModal from "../../components/MatchModal";
import { useApp } from "../../context/AppContext";
import { scoreRequestForWorker } from "../../lib/ai";

export default function RequestDetailForWorker() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getRequest,
    myWorkerId,
    getWorker,
    getMatch,
    sendWorkerInterest,
    declineMatch,
    markMatchPopupSeen,
  } = useApp();

  const request = id ? getRequest(id) : undefined;
  const myWorker = myWorkerId ? getWorker(myWorkerId) : undefined;
  const [showMatch, setShowMatch] = useState(false);

  const scoring = request && myWorker ? scoreRequestForWorker(myWorker, request) : null;
  const match = request && myWorker ? getMatch(request.id, myWorker.id) : undefined;
  const responded = match && match.workerResponse !== "pending";

  function handleInterest() {
    if (!request || !myWorker) return;
    const result = sendWorkerInterest(myWorker.id, request.id);
    if (result.matched && !result.seenPopup) setShowMatch(true);
  }

  function handleDecline() {
    if (!request || !myWorker) return;
    declineMatch(request.id, myWorker.id);
    navigate(-1);
  }

  function closeMatch(next: "chat" | "terms" | "later") {
    if (match) markMatchPopupSeen(match.id);
    setShowMatch(false);
    if (next !== "later") {
      const current = match ?? (request && myWorker ? getMatch(request.id, myWorker.id) : undefined);
      if (current) navigate(`/chat/${current.id}`);
    }
  }

  if (!request) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="추천 일감" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          의뢰 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <TopBar title="추천 일감 상세정보" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {scoring && (
              <span className="inline-block text-[11px] font-bold text-teal-600 bg-teal-50 rounded-full px-2.5 py-1 mb-2">
                회원님과 {scoring.score}% 일치
              </span>
            )}
            <h1 className="text-lg font-extrabold text-navy-800 leading-snug">
              {request.title}
            </h1>
          </div>
          {scoring && <ScoreRing score={scoring.score} size={52} />}
        </div>

        {scoring && (
          <div className="mt-4 bg-teal-50 rounded-2xl p-4">
            <p className="text-[13px] font-bold text-teal-700 mb-2">AI 추천 이유</p>
            <ul className="flex flex-col gap-1.5">
              {scoring.reasons.map((r, i) => (
                <li key={i} className="text-[13px] text-teal-800 flex items-start gap-1.5">
                  <span className="mt-0.5">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 bg-white rounded-2xl shadow-card divide-y divide-navy-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <CalendarDays size={17} className="text-navy-400 shrink-0" />
            <div>
              <p className="text-[12px] text-navy-300 font-semibold">날짜와 시간</p>
              <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                {request.startDate === request.endDate
                  ? request.startDate
                  : `${request.startDate} ~ ${request.endDate}`}{" "}
                · {request.workTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <MapPin size={17} className="text-navy-400 shrink-0" />
            <div>
              <p className="text-[12px] text-navy-300 font-semibold">장소</p>
              <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                {request.location}
                {myWorker ? ` · ${myWorker.distanceKm}km` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Wallet size={17} className="text-navy-400 shrink-0" />
            <div>
              <p className="text-[12px] text-navy-300 font-semibold">예상금액</p>
              <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                {request.budget.toLocaleString()}원
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Gauge size={17} className="text-navy-400 shrink-0" />
            <div>
              <p className="text-[12px] text-navy-300 font-semibold">업무 난이도</p>
              <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">{request.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Users size={17} className="text-navy-400 shrink-0" />
            <div>
              <p className="text-[12px] text-navy-300 font-semibold">필요 인원</p>
              <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">{request.headcount}명</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[13px] font-bold text-navy-700 mb-2">업무 상세내용</p>
          <p className="text-[13.5px] text-navy-600 bg-navy-50/60 rounded-xl p-3.5 leading-relaxed whitespace-pre-line">
            {request.detail}
          </p>
        </div>

        {request.requirements && (
          <div className="mt-4">
            <p className="text-[13px] font-bold text-navy-700 mb-2">필요한 자격증·장비</p>
            <div className="flex flex-wrap gap-1.5">
              {request.requirements
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean)
                .map((r) => (
                  <Tag key={r} tone="navy">
                    {r}
                  </Tag>
                ))}
            </div>
          </div>
        )}

        {request.analysis && (
          <div className="mt-4">
            <p className="text-[13px] font-bold text-navy-700 mb-2">AI 분석 키워드</p>
            <div className="flex flex-wrap gap-1.5">
              {request.analysis.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 bg-navy-50 rounded-xl px-3.5 py-3 text-[11.5px] text-navy-500">
          <ShieldCheck size={16} className="text-teal-600 shrink-0" />
          2시간 내 응답이 없으면 다음 순위 경력자에게 자동으로 알림이 전달돼요.
        </div>
      </div>

      {myWorker && (
        <div className="shrink-0 px-5 py-4 bg-white border-t border-navy-100 flex gap-2">
          {responded ? (
            <div className="flex-1 text-center py-3 rounded-2xl bg-navy-50 text-navy-500 font-bold text-[13.5px]">
              {match?.workerResponse === "interested" ? "관심을 보냈어요" : "거절한 일감이에요"}
            </div>
          ) : (
            <>
              <button
                onClick={handleDecline}
                className="flex-1 rounded-2xl py-3.5 font-bold text-navy-500 bg-navy-50 flex items-center justify-center gap-1.5"
              >
                <ThumbsDown size={16} />
                거절
              </button>
              <button
                onClick={handleInterest}
                className="flex-[1.4] rounded-2xl py-3.5 font-bold text-white bg-teal-500 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              >
                <Heart size={16} />
                관심 있음
              </button>
            </>
          )}
        </div>
      )}

      {showMatch && (
        <MatchModal
          onChat={() => closeMatch("chat")}
          onTerms={() => closeMatch("terms")}
          onLater={() => closeMatch("later")}
        />
      )}
    </div>
  );
}

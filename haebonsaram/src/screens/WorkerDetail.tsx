import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin, Star, CheckCircle2, Heart, Wrench, Award, Image as ImageIcon } from "lucide-react";
import TopBar from "../components/TopBar";
import Tag from "../components/Tag";
import ScoreRing from "../components/ScoreRing";
import MatchModal from "../components/MatchModal";
import { useApp } from "../context/AppContext";
import { scoreWorkerForRequest } from "../lib/ai";

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const requestId = params.get("requestId");
  const navigate = useNavigate();
  const { getWorker, getRequest, sendClientInterest, getMatch, markMatchPopupSeen } =
    useApp();

  const worker = id ? getWorker(id) : undefined;
  const request = requestId ? getRequest(requestId) : undefined;
  const [showMatch, setShowMatch] = useState(false);

  const scoring = useMemo(
    () => (request && worker ? scoreWorkerForRequest(request, worker) : null),
    [request, worker]
  );

  const match = request && worker ? getMatch(request.id, worker.id) : undefined;
  const interested = !!(
    request && worker && request.clientInterestWorkerIds.includes(worker.id)
  );

  function handleInterest() {
    if (!request || !worker) return;
    const result = sendClientInterest(request.id, worker.id);
    if (result.matched && !result.seenPopup) {
      setShowMatch(true);
    }
  }

  function closeMatch(next: "chat" | "terms" | "later") {
    if (match) markMatchPopupSeen(match.id);
    setShowMatch(false);
    if (next === "chat" || next === "terms") {
      const current = match ?? (request && worker ? getMatch(request.id, worker.id) : undefined);
      if (current) navigate(`/chat/${current.id}`);
    }
  }

  if (!worker) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="경력자 프로필" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          경력자 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="경력자 상세 프로필" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center text-3xl">
            {worker.avatarEmoji}
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold text-navy-800">{worker.name}</p>
            <p className="text-[12.5px] text-navy-400 mt-0.5">
              {worker.analysis?.mainJob ?? "경력 분석 중"} · {worker.totalCareerYears}년
            </p>
            <div className="flex items-center gap-2.5 mt-1 text-[11.5px] text-navy-400">
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
          {scoring && <ScoreRing score={scoring.score} size={52} />}
        </div>

        <p className="mt-4 text-[13.5px] text-navy-600 bg-navy-50/60 rounded-xl p-3.5 leading-relaxed">
          {worker.analysis?.oneLiner ?? worker.intro}
        </p>

        {scoring && (
          <div className="mt-4 bg-teal-50 rounded-2xl p-4">
            <p className="text-[13px] font-bold text-teal-700 mb-2">
              AI가 설명하는 적합한 이유
            </p>
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

        <section className="mt-5">
          <h3 className="text-[13.5px] font-bold text-navy-700 mb-2 flex items-center gap-1.5">
            <Wrench size={15} /> 경력 요약 · 실제 수행 업무
          </h3>
          <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-2.5">
            <div>
              <p className="text-[11.5px] text-navy-300 font-semibold">이전 직장 / 활동 분야</p>
              <p className="text-[13.5px] text-navy-700 mt-0.5">{worker.previousWork}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-navy-300 font-semibold">실제 수행 업무</p>
              <p className="text-[13.5px] text-navy-700 mt-0.5">{worker.actualTasks}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-navy-300 font-semibold">강점</p>
              <p className="text-[13.5px] text-navy-700 mt-0.5">{worker.strengths}</p>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-[13.5px] font-bold text-navy-700 mb-2 flex items-center gap-1.5">
            <ImageIcon size={15} /> 포트폴리오
          </h3>
          <div className="flex flex-col gap-2">
            {worker.portfolio.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-card px-3.5 py-3 text-[13px] text-navy-600 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-300 shrink-0">
                  <ImageIcon size={14} />
                </div>
                {p}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-[13.5px] font-bold text-navy-700 mb-2 flex items-center gap-1.5">
            <Award size={15} /> 자격증
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {worker.certifications.split(",").map((c) => c.trim()).filter(Boolean).map((c) => (
              <Tag key={c} tone="navy">
                {c}
              </Tag>
            ))}
          </div>
        </section>

        {worker.reviews && worker.reviews.length > 0 && (
          <section className="mt-5">
            <h3 className="text-[13.5px] font-bold text-navy-700 mb-2">고객 평가</h3>
            <div className="flex flex-col gap-2">
              {worker.reviews.map((r, i) => (
                <div key={i} className="bg-white rounded-xl shadow-card p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-bold text-navy-700">{r.author}</p>
                    <span className="flex items-center gap-0.5 text-[12px] text-amber-500">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {r.score.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[13px] text-navy-500 mt-1">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-5 flex items-center justify-between bg-navy-800 text-white rounded-2xl px-4 py-3.5">
          <span className="text-[12.5px] text-navy-200">예상 작업금액</span>
          <span className="text-[15px] font-extrabold">{worker.desiredRate}</span>
        </div>
      </div>

      {request && (
        <div className="shrink-0 px-5 py-4 bg-white border-t border-navy-100">
          <button
            onClick={handleInterest}
            disabled={interested}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold transition-colors ${
              interested
                ? "bg-teal-50 text-teal-600"
                : "bg-teal-500 text-white active:scale-[0.98]"
            }`}
          >
            <Heart size={18} className={interested ? "fill-teal-500" : ""} />
            {interested ? "관심을 보냈어요" : "관심 보내기"}
          </button>
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

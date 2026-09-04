import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock3,
  MapPin,
  Radar,
  UserPlus,
  Wallet,
  ChevronRight,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getActiveCandidates } from "../../lib/ai";
import ScoreRing from "../../components/ScoreRing";
import Tag from "../../components/Tag";

export default function WorkerHome() {
  const navigate = useNavigate();
  const { requests, workers, matches, myWorkerId, getWorker, getRequest, setJobSeekingActive } =
    useApp();
  const myWorker = myWorkerId ? getWorker(myWorkerId) : undefined;
  const active = requests.filter((r) => r.status === "matching" || r.status === "matched");

  const newArrivals = useMemo(() => {
    if (!myWorker) return [];
    return active
      .filter((r) => {
        const candidates = getActiveCandidates(r, workers, matches, 5);
        if (!candidates.some((c) => c.worker.id === myWorker.id)) return false;
        const m = matches.find((m) => m.requestId === r.id && m.workerId === myWorker.id);
        return !m || m.workerResponse === "pending";
      })
      .map((r) => ({
        request: r,
        score: getActiveCandidates(r, workers, matches, 5).find(
          (c) => c.worker.id === myWorker.id
        )!.score,
      }));
  }, [active, workers, matches, myWorker]);

  const waitingResponses = useMemo(() => {
    if (!myWorker) return [];
    return matches
      .filter((m) => m.workerId === myWorker.id && m.workerResponse === "interested" && !m.matched)
      .map((m) => ({ match: m, request: getRequest(m.requestId) }))
      .filter((x): x is { match: (typeof matches)[number]; request: NonNullable<ReturnType<typeof getRequest>> } => !!x.request);
  }, [matches, myWorker, getRequest]);

  const inProgress = useMemo(() => {
    if (!myWorker) return [];
    return matches
      .filter((m) => m.workerId === myWorker.id && m.matched)
      .map((m) => ({ match: m, request: getRequest(m.requestId) }))
      .filter((x): x is { match: (typeof matches)[number]; request: NonNullable<ReturnType<typeof getRequest>> } => !!x.request);
  }, [matches, myWorker, getRequest]);

  if (!myWorker) {
    return (
      <div className="px-5 pt-6 pb-6 animate-fade-in">
        <p className="text-sm text-navy-400 font-medium">해본사람</p>
        <h1 className="text-xl font-extrabold text-navy-800 mt-1 leading-snug">
          일을 찾지 마세요.
          <br />
          AI가 먼저 찾아드립니다.
        </h1>
        <button
          onClick={() => navigate("/worker/profile/new")}
          className="mt-5 w-full flex items-center gap-3 bg-teal-500 text-white rounded-2xl px-4 py-4 shadow-card active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <UserPlus size={20} />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-[14px]">경력 프로필을 한 번만 등록하세요</p>
            <p className="text-[12px] text-teal-50 mt-0.5">
              이후로는 검색 없이, 맞는 일이 생기면 AI가 알려드려요
            </p>
          </div>
        </button>
      </div>
    );
  }

  const jobSeeking = myWorker.jobSeekingActive !== false;

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-navy-400 font-medium">해본사람</p>
          <h1 className="text-xl font-extrabold text-navy-800 mt-1">
            {myWorker.name}님, 안녕하세요 👋
          </h1>
        </div>
        <button
          onClick={() => setJobSeekingActive(!jobSeeking)}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-bold transition-colors ${
            jobSeeking ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-400"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${jobSeeking ? "bg-white" : "bg-navy-300"}`} />
          구직 {jobSeeking ? "ON" : "OFF"}
        </button>
      </div>

      <button
        onClick={() => navigate("/worker/me")}
        className="mt-4 w-full flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3.5"
      >
        <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
          <Clock3 size={17} className="text-navy-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[11.5px] text-navy-300 font-semibold">현재 가능한 날짜와 시간</p>
          <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">{myWorker.availableTime}</p>
        </div>
        <ChevronRight size={16} className="text-navy-300" />
      </button>

      {!jobSeeking ? (
        <div className="mt-6 bg-white rounded-2xl shadow-card p-6 text-center">
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            구직 상태가 꺼져 있어요.
            <br />
            켜두면 AI가 새 일감을 찾는 대로 알려드려요.
          </p>
        </div>
      ) : newArrivals.length === 0 ? (
        <div className="mt-6 bg-white rounded-2xl shadow-card p-7 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
            <Radar size={22} className="text-teal-600" />
          </div>
          <p className="text-[13.5px] font-bold text-navy-700">
            일감을 찾는 중입니다.
          </p>
          <p className="text-[12.5px] text-navy-400 mt-1 leading-relaxed">
            조건이 맞는 일이 생기면
            <br />
            바로 알려드릴게요.
          </p>
        </div>
      ) : (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold text-navy-800 flex items-center gap-1.5">
              <Bell size={16} className="text-teal-500" />
              새로 도착한 AI 추천 일감
              <span className="text-teal-600">{newArrivals.length}</span>
            </h2>
            <button
              onClick={() => navigate("/worker/notifications")}
              className="text-[12px] text-navy-300 font-semibold"
            >
              전체보기
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {newArrivals.slice(0, 3).map(({ request, score }) => (
              <button
                key={request.id}
                onClick={() => navigate(`/jobs/${request.id}`)}
                className="w-full text-left bg-white rounded-2xl shadow-card p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-navy-800 line-clamp-1">
                    {request.title}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1.5 text-[12px] text-navy-400">
                    <span className="flex items-center gap-0.5">
                      <MapPin size={12} /> {request.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Wallet size={12} /> {request.budget.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <ScoreRing score={score} size={40} />
              </button>
            ))}
          </div>
        </section>
      )}

      {waitingResponses.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[15px] font-bold text-navy-800 mb-3 flex items-center gap-1.5">
            <Hourglass size={16} className="text-navy-500" />
            응답 대기 중인 매칭
          </h2>
          <div className="flex flex-col gap-2.5">
            {waitingResponses.map(({ match, request }) => (
              <div key={match.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[13.5px] text-navy-800 line-clamp-1">
                    {request.title}
                  </p>
                  <Tag tone="navy">의뢰자 확인 중</Tag>
                </div>
                <p className="text-[12px] text-navy-400 mt-1">
                  관심 있음을 보냈어요. 의뢰자의 선택을 기다리고 있어요.
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section className="mt-6">
          <h2 className="text-[15px] font-bold text-navy-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-teal-600" />
            진행 중인 업무
          </h2>
          <div className="flex flex-col gap-2.5">
            {inProgress.map(({ match, request }) => (
              <button
                key={match.id}
                onClick={() => navigate(`/chat/${match.id}`)}
                className="w-full text-left bg-white rounded-2xl shadow-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[13.5px] text-navy-800 line-clamp-1">
                    {request.title}
                  </p>
                  <Tag>{match.terms.confirmed ? "확정" : "협의 중"}</Tag>
                </div>
                <p className="text-[12px] text-navy-400 mt-1">
                  {request.location} · {request.workTime}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Star, CheckCircle2, MapPin, Repeat, ChevronRight, UserPlus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Tag from "../../components/Tag";

export default function WorkerMe() {
  const navigate = useNavigate();
  const { myWorkerId, getWorker, setRole, setJobSeekingActive } = useApp();
  const myWorker = myWorkerId ? getWorker(myWorkerId) : undefined;

  function switchToClient() {
    setRole("client");
    navigate("/client/home");
  }

  if (!myWorker) {
    return (
      <div className="px-5 pt-6 pb-6 animate-fade-in">
        <h1 className="text-xl font-extrabold text-navy-800 mb-5">내경력</h1>
        <div className="bg-white rounded-2xl shadow-card p-7 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
            <UserPlus size={22} className="text-teal-600" />
          </div>
          <p className="text-[13.5px] text-navy-400 leading-relaxed mb-4">
            아직 경력 프로필이 없어요.
            <br />한 번만 등록하면 이후엔 검색 없이 알림만 받아요.
          </p>
          <button
            onClick={() => navigate("/worker/profile/new")}
            className="w-full rounded-xl py-3 font-bold text-white bg-teal-500"
          >
            경력 프로필 등록하기
          </button>
        </div>
      </div>
    );
  }

  const jobSeeking = myWorker.jobSeekingActive !== false;

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-navy-800 mb-5">내경력</h1>

      <div className="bg-navy-800 text-white rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl">
            {myWorker.avatarEmoji}
          </div>
          <div className="flex-1">
            <p className="font-bold text-[16px]">{myWorker.name}</p>
            <p className="text-[12px] text-navy-200 mt-0.5">
              {myWorker.analysis?.mainJob ?? "경력 분석 중"} · {myWorker.totalCareerYears}년
            </p>
          </div>
          <button
            onClick={() => setJobSeekingActive(!jobSeeking)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-bold ${
              jobSeeking ? "bg-teal-500 text-white" : "bg-white/10 text-navy-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${jobSeeking ? "bg-white" : "bg-navy-300"}`} />
            구직 {jobSeeking ? "ON" : "OFF"}
          </button>
        </div>
        {myWorker.analysis && (
          <p className="mt-3 text-[13px] text-navy-100 leading-relaxed">
            &ldquo;{myWorker.analysis.oneLiner}&rdquo;
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl shadow-card p-3.5 text-center">
          <p className="text-lg font-extrabold text-navy-800 flex items-center justify-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            {myWorker.rating > 0 ? myWorker.rating.toFixed(1) : "-"}
          </p>
          <p className="text-[11px] text-navy-400 mt-0.5">평점</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3.5 text-center">
          <p className="text-lg font-extrabold text-navy-800 flex items-center justify-center gap-1">
            <CheckCircle2 size={14} className="text-teal-500" />
            {myWorker.completedJobs}
          </p>
          <p className="text-[11px] text-navy-400 mt-0.5">완료 업무</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-3.5 text-center">
          <p className="text-lg font-extrabold text-navy-800 flex items-center justify-center gap-1">
            <MapPin size={14} className="text-navy-400" />
            {myWorker.distanceKm}
          </p>
          <p className="text-[11px] text-navy-400 mt-0.5">활동 반경(km)</p>
        </div>
      </div>

      <div className="mt-5 bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
        <div>
          <p className="text-[11.5px] text-navy-300 font-semibold">활동 가능 지역</p>
          <p className="text-[13.5px] text-navy-700 mt-0.5">{myWorker.regions}</p>
        </div>
        <div>
          <p className="text-[11.5px] text-navy-300 font-semibold">가능한 날짜와 시간</p>
          <p className="text-[13.5px] text-navy-700 mt-0.5">{myWorker.availableTime}</p>
        </div>
        <div>
          <p className="text-[11.5px] text-navy-300 font-semibold">희망 금액</p>
          <p className="text-[13.5px] text-navy-700 mt-0.5">{myWorker.desiredRate}</p>
        </div>
        {myWorker.preferredWork && (
          <div>
            <p className="text-[11.5px] text-navy-300 font-semibold">선호하는 업무</p>
            <p className="text-[13.5px] text-navy-700 mt-0.5">{myWorker.preferredWork}</p>
          </div>
        )}
        {myWorker.avoidWork && (
          <div>
            <p className="text-[11.5px] text-navy-300 font-semibold">피하고 싶은 업무</p>
            <p className="text-[13.5px] text-navy-700 mt-0.5">{myWorker.avoidWork}</p>
          </div>
        )}
      </div>

      {myWorker.analysis && (
        <div className="mt-4">
          <p className="text-[13px] font-bold text-navy-700 mb-2">AI가 분석한 핵심 기술</p>
          <div className="flex flex-wrap gap-1.5">
            {myWorker.analysis.coreSkills.map((s) => (
              <Tag key={s} tone="navy">
                {s}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={switchToClient}
        className="mt-5 w-full flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3.5"
      >
        <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
          <Repeat size={17} className="text-navy-600" />
        </div>
        <span className="flex-1 text-left text-[13.5px] font-bold text-navy-700">
          의뢰자로 전환하기
        </span>
        <ChevronRight size={16} className="text-navy-300" />
      </button>
    </div>
  );
}

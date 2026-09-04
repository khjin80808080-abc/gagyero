import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, Gauge, Target, ArrowRight } from "lucide-react";
import TopBar from "../../components/TopBar";
import Loader from "../../components/Loader";
import Tag from "../../components/Tag";
import { useApp } from "../../context/AppContext";

export default function WorkerAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorker, runWorkerAnalysis } = useApp();
  const [loading, setLoading] = useState(true);

  const worker = id ? getWorker(id) : undefined;

  useEffect(() => {
    if (!worker) return;
    if (worker.analysis) {
      setLoading(false);
      return;
    }
    setLoading(true);
    runWorkerAnalysis(worker.id).then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker?.id]);

  if (!worker) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="AI 경력 분석" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          프로필 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="AI 경력 분석 결과" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        {loading || !worker.analysis ? (
          <Loader text="AI가 경력 내용을 분석하고 있어요..." />
        ) : (
          <div className="animate-fade-in pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center text-2xl">
                {worker.avatarEmoji}
              </div>
              <div>
                <p className="font-extrabold text-[16px] text-navy-800">{worker.name}</p>
                <p className="text-[12.5px] text-navy-400">{worker.analysis.careerLevel}</p>
              </div>
            </div>

            <div className="bg-teal-500 text-white rounded-2xl p-4 mb-5">
              <p className="text-[12px] text-teal-50 font-semibold mb-1">AI 한 줄 소개</p>
              <p className="text-[14.5px] font-bold leading-relaxed">
                &ldquo;{worker.analysis.oneLiner}&rdquo;
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-4 mb-5 flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-navy-600" />
                </div>
                <div>
                  <p className="text-[12px] text-navy-300 font-semibold">대표 직무</p>
                  <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                    {worker.analysis.mainJob}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                  <Gauge size={16} className="text-navy-600" />
                </div>
                <div>
                  <p className="text-[12px] text-navy-300 font-semibold">적합한 업무 난이도</p>
                  <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                    {worker.analysis.suitableDifficulty}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                  <Target size={16} className="text-navy-600" />
                </div>
                <div>
                  <p className="text-[12px] text-navy-300 font-semibold">추천 활동 분야</p>
                  <p className="text-[13.5px] font-bold text-navy-800 mt-0.5">
                    {worker.analysis.recommendedFields.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-bold text-navy-700 mb-2">핵심 기술</p>
              <div className="flex flex-wrap gap-1.5">
                {worker.analysis.coreSkills.map((s) => (
                  <Tag key={s} tone="navy">
                    {s}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-bold text-navy-700 mb-2">수행 가능한 업무</p>
              <ul className="bg-white rounded-2xl shadow-card divide-y divide-navy-50">
                {worker.analysis.possibleTasks.map((t) => (
                  <li key={t} className="px-4 py-3 text-[13.5px] text-navy-700">
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-bold text-navy-700 mb-2">강점</p>
              <div className="flex flex-wrap gap-1.5">
                {worker.analysis.strengths.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && worker.analysis && (
        <div className="shrink-0 px-5 py-4 bg-white border-t border-navy-100">
          <button
            onClick={() => navigate("/worker/home")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white bg-teal-500 active:scale-[0.98] transition-transform"
          >
            구직 활성화하고 AI 추천 받기
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

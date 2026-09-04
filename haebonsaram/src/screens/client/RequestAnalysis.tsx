import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  Gauge,
  CalendarClock,
  Wallet,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import TopBar from "../../components/TopBar";
import Loader from "../../components/Loader";
import Tag from "../../components/Tag";
import { useApp } from "../../context/AppContext";

const rows = [
  { key: "field", label: "업무 분야", icon: Briefcase },
  { key: "difficulty", label: "예상 난이도", icon: Gauge },
  { key: "duration", label: "적정 작업 기간", icon: CalendarClock },
  { key: "budgetFit", label: "예산 적정성", icon: Wallet },
  { key: "headcount", label: "필요한 인원", icon: Users },
  { key: "caution", label: "주의사항", icon: AlertTriangle },
] as const;

export default function RequestAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequest, runRequestAnalysis } = useApp();
  const [loading, setLoading] = useState(true);

  const request = id ? getRequest(id) : undefined;

  useEffect(() => {
    if (!request) return;
    if (request.analysis) {
      setLoading(false);
      return;
    }
    setLoading(true);
    runRequestAnalysis(request.id).then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  if (!request) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="AI 의뢰 분석" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          의뢰 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="AI 의뢰 분석 결과" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        {loading || !request.analysis ? (
          <Loader text="AI가 의뢰 내용을 분석하고 있어요..." />
        ) : (
          <div className="animate-fade-in pb-4">
            <div className="bg-navy-800 text-white rounded-2xl p-4 mb-4">
              <p className="text-[12px] text-teal-200 font-semibold">{request.title}</p>
              <p className="text-[15px] font-bold mt-1">{request.analysis.field}</p>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-bold text-navy-700 mb-2">핵심 기술</p>
              <div className="flex flex-wrap gap-1.5">
                {request.analysis.coreSkills.map((s) => (
                  <Tag key={s} tone="navy">
                    {s}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[13px] font-bold text-navy-700 mb-1.5">권장 경력</p>
              <p className="text-[14px] text-navy-600 bg-white rounded-xl border border-navy-100 px-3.5 py-3">
                {request.analysis.recommendedCareer}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-card divide-y divide-navy-50 mb-5">
              {rows.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-navy-300 font-semibold">{label}</p>
                    <p className="text-[13.5px] text-navy-800 font-medium mt-0.5">
                      {request.analysis![key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[13px] font-bold text-navy-700 mb-2">분석 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {request.analysis.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && request.analysis && (
        <div className="shrink-0 px-5 py-4 bg-white border-t border-navy-100">
          <button
            onClick={() => navigate(`/client/requests/${request.id}/searching`)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white bg-teal-500 active:scale-[0.98] transition-transform"
          >
            AI가 경력자를 찾도록 요청하기
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Plus, Radar } from "lucide-react";
import Tag from "../../components/Tag";
import { useApp } from "../../context/AppContext";
import { getActiveCandidates } from "../../lib/ai";

export default function AIMatching() {
  const navigate = useNavigate();
  const { requests, workers, matches, myRequestIds } = useApp();
  const myRequests = requests.filter(
    (r) => myRequestIds.includes(r.id) && (r.status === "matching" || r.status === "matched")
  );

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} className="text-teal-500" />
        <h1 className="text-xl font-extrabold text-navy-800">AI 매칭</h1>
      </div>
      <p className="text-[13px] text-navy-400 mb-5">
        의뢰를 등록하면 AI가 모든 경력자 데이터를 분석해서
        <br />
        적합도 높은 5명만 골라 알려드려요.
      </p>

      <button
        onClick={() => navigate("/client/requests/new")}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white bg-teal-500 mb-5 active:scale-[0.98] transition-transform"
      >
        <Plus size={18} />새 의뢰로 AI 매칭 시작하기
      </button>

      {myRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-7 text-center">
          <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <Radar size={20} className="text-navy-300" />
          </div>
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            아직 진행 중인 AI 매칭이 없어요.
            <br />
            의뢰를 등록하면 바로 시작돼요.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[13px] font-bold text-navy-700 mb-2">내 의뢰 매칭 현황</p>
          <div className="flex flex-col gap-3">
            {myRequests.map((r) => {
              const candidates = getActiveCandidates(r, workers, matches, 5);
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/client/requests/${r.id}/recommendations`)}
                  className="w-full text-left bg-white rounded-2xl shadow-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-navy-800 line-clamp-1 flex-1">
                      {r.title}
                    </p>
                    <Tag tone={r.status === "matched" ? "teal" : "navy"}>
                      {r.status === "matched" ? "매칭 완료" : `후보 ${candidates.length}명`}
                    </Tag>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.analysis?.tags.slice(0, 3).map((t) => (
                      <Tag key={t} tone="navy">
                        {t}
                      </Tag>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12.5px] text-teal-600 font-bold">
                    <span>AI 추천 후보 보기</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

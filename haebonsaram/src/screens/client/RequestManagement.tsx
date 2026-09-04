import { useNavigate } from "react-router-dom";
import { Plus, MapPin, CalendarDays, Wallet } from "lucide-react";
import Tag from "../../components/Tag";
import { useApp } from "../../context/AppContext";
import type { WorkRequest } from "../../types";

const statusLabel: Record<WorkRequest["status"], { text: string; tone: "teal" | "navy" | "gray" }> = {
  draft: { text: "작성 중", tone: "gray" },
  analyzed: { text: "분석 완료", tone: "navy" },
  matching: { text: "매칭 중", tone: "teal" },
  matched: { text: "매칭 완료", tone: "teal" },
};

export default function RequestManagement() {
  const navigate = useNavigate();
  const { requests, myRequestIds } = useApp();
  const myRequests = requests.filter((r) => myRequestIds.includes(r.id));

  function openRequest(r: WorkRequest) {
    if (r.status === "draft" || r.status === "analyzed") {
      navigate(`/client/requests/${r.id}/analysis`);
    } else {
      navigate(`/client/requests/${r.id}/recommendations`);
    }
  }

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-extrabold text-navy-800">의뢰관리</h1>
        <button
          onClick={() => navigate("/client/requests/new")}
          className="flex items-center gap-1 text-[12.5px] font-bold text-teal-600 bg-teal-50 rounded-full px-3 py-1.5"
        >
          <Plus size={14} /> 새 의뢰
        </button>
      </div>

      {myRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            등록한 의뢰가 없어요.
            <br />
            지금 첫 의뢰를 등록해보세요.
          </p>
          <button
            onClick={() => navigate("/client/requests/new")}
            className="mt-4 w-full rounded-xl py-3 font-bold text-white bg-teal-500"
          >
            의뢰 등록하기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myRequests.map((r) => (
            <button
              key={r.id}
              onClick={() => openRequest(r)}
              className="w-full text-left bg-white rounded-2xl shadow-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-[14.5px] text-navy-800 line-clamp-1 flex-1">
                  {r.title}
                </p>
                <Tag tone={statusLabel[r.status].tone}>{statusLabel[r.status].text}</Tag>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-navy-400">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {r.location}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} /> {r.startDate}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet size={12} /> {r.budget.toLocaleString()}원
                </span>
              </div>
              {r.status !== "draft" && (
                <p className="mt-2 text-[12px] text-teal-600 font-semibold">
                  관심 보낸 경력자 {r.clientInterestWorkerIds.length}명
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

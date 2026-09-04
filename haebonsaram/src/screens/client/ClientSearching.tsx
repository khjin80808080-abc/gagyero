import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Radar, CheckCircle2 } from "lucide-react";
import TopBar from "../../components/TopBar";
import { useApp } from "../../context/AppContext";

const steps = [
  "등록된 경력자 데이터를 확인하고 있어요",
  "업무 조건과 경력을 비교하고 있어요",
  "적합도 순위를 계산하고 있어요",
  "상위 5명에게 알림을 보내고 있어요",
];

export default function ClientSearching() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequest, startMatching } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  const request = id ? getRequest(id) : undefined;

  useEffect(() => {
    if (!id) return;
    startMatching(id);

    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 500);

    const timeout = setTimeout(() => {
      navigate(`/client/requests/${id}/recommendations`, { replace: true });
    }, 2100);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!request) {
    return (
      <div className="h-full flex flex-col">
        <TopBar title="경력자 탐색 중" />
        <div className="flex-1 flex items-center justify-center text-navy-300 text-sm">
          의뢰 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="경력자 탐색 중" showBack={false} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-navy-100 border-b-navy-400 animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
          <Radar size={28} className="text-teal-600" />
        </div>

        <p className="text-[15px] font-extrabold text-navy-800 leading-relaxed">
          AI가 회원님의 조건에 맞는
          <br />
          경력자를 찾고 있어요
        </p>
        <p className="text-[13px] text-navy-400 mt-1.5 line-clamp-1">{request.title}</p>

        <div className="mt-7 w-full flex flex-col gap-2.5">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold transition-colors ${
                i <= stepIndex ? "bg-teal-50 text-teal-700" : "bg-navy-50 text-navy-300"
              }`}
            >
              <CheckCircle2
                size={15}
                className={i <= stepIndex ? "text-teal-500" : "text-navy-200"}
              />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

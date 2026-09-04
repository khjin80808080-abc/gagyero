import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Sparkles,
  Radar,
  MapPin,
  Wallet,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Tag from "../../components/Tag";
import { getActiveCandidates } from "../../lib/ai";

export default function ClientHome() {
  const navigate = useNavigate();
  const { requests, workers, matches, myRequestIds } = useApp();

  const myRequests = requests.filter((r) => myRequestIds.includes(r.id));
  const searching = myRequests.filter((r) => r.status === "matching");
  const matchedReqs = myRequests.filter((r) => r.status === "matched");

  const respondedCandidates = useMemo(() => {
    const rows: { requestTitle: string; workerName: string; requestId: string; workerId: string }[] =
      [];
    for (const r of myRequests) {
      for (const m of matches) {
        if (m.requestId === r.id && m.workerResponse === "interested" && !m.matched) {
          const w = workers.find((w) => w.id === m.workerId);
          if (w) rows.push({ requestTitle: r.title, workerName: w.name, requestId: r.id, workerId: w.id });
        }
      }
    }
    return rows;
  }, [myRequests, matches, workers]);

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <p className="text-sm text-navy-400 font-medium">세종시 상생 매칭</p>
      <h1 className="text-xl font-extrabold text-navy-800 mt-1 leading-snug">
        검색하지 마세요.
        <br />
        AI가 대신 찾아드립니다.
      </h1>

      <button
        onClick={() => navigate("/client/requests/new")}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-500 text-white font-bold rounded-2xl py-3.5 shadow-card active:scale-[0.98] transition-transform"
      >
        <Plus size={18} />
        새 업무 등록하기
      </button>

      {searching.length > 0 && (
        <section className="mt-7">
          <h2 className="text-[15px] font-bold text-navy-800 mb-3 flex items-center gap-1.5">
            <Radar size={16} className="text-teal-500" />
            AI가 경력자를 찾고 있는 의뢰
          </h2>
          <div className="flex flex-col gap-2.5">
            {searching.map((r) => {
              const candidateCount = getActiveCandidates(r, workers, matches, 5).length;
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
                    <Tag>후보 {candidateCount}명 도착</Tag>
                  </div>
                  <p className="text-[12px] text-navy-300 mt-1">
                    {r.location} · {r.workTime}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {respondedCandidates.length > 0 && (
        <section className="mt-7">
          <h2 className="text-[15px] font-bold text-navy-800 mb-3 flex items-center gap-1.5">
            <Sparkles size={16} className="text-teal-500" />
            응답한 경력자
          </h2>
          <div className="flex flex-col gap-2.5">
            {respondedCandidates.map((row, i) => (
              <button
                key={i}
                onClick={() => navigate(`/worker/${row.workerId}?requestId=${row.requestId}`)}
                className="w-full text-left bg-white rounded-2xl shadow-card p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[13.5px] text-navy-800">{row.workerName}</p>
                  <p className="text-[12px] text-navy-400 mt-0.5 line-clamp-1">
                    {row.requestTitle}
                  </p>
                </div>
                <Tag>관심 있음</Tag>
              </button>
            ))}
          </div>
        </section>
      )}

      {matchedReqs.length > 0 && (
        <section className="mt-7">
          <h2 className="text-[15px] font-bold text-navy-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-teal-600" />
            매칭 완료 · 진행 중인 업무
          </h2>
          <div className="flex flex-col gap-2.5">
            {matchedReqs.map((r) => {
              const match = matches.find(
                (m) => m.requestId === r.id && r.clientInterestWorkerIds.includes(m.workerId) && m.matched
              );
              return (
                <button
                  key={r.id}
                  onClick={() => match && navigate(`/chat/${match.id}`)}
                  className="w-full text-left bg-white rounded-2xl shadow-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[14px] text-navy-800 line-clamp-1 flex-1">
                      {r.title}
                    </p>
                    <MessageCircle size={16} className="text-teal-500 shrink-0" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5 text-[12px] text-navy-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {r.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wallet size={12} /> {r.budget.toLocaleString()}원
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {myRequests.length === 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-card p-7 text-center">
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            아직 등록한 의뢰가 없어요.
            <br />
            업무를 등록하면 AI가 적합한 경력자를 찾아드려요.
          </p>
          <button
            onClick={() => navigate("/client/requests/new")}
            className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl py-3 font-bold text-white bg-teal-500"
          >
            첫 의뢰 등록하기
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

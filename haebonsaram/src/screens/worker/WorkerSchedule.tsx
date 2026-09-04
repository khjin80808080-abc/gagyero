import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, MessageCircle, CheckCircle2, Hourglass } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Tag from "../../components/Tag";

export default function WorkerSchedule() {
  const navigate = useNavigate();
  const { matches, myWorkerId, getRequest } = useApp();

  const mine = matches
    .filter((m) => m.workerId === myWorkerId)
    .map((m) => ({ match: m, request: getRequest(m.requestId) }))
    .filter((x): x is { match: (typeof matches)[number]; request: NonNullable<ReturnType<typeof getRequest>> } => !!x.request);

  const confirmed = mine.filter((x) => x.match.matched && x.match.terms.confirmed);
  const matchedOnly = mine.filter((x) => x.match.matched && !x.match.terms.confirmed);
  const waiting = mine.filter((x) => !x.match.matched && x.match.workerResponse === "interested");

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-navy-800 mb-5">일정</h1>

      {mine.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <p className="text-[13.5px] text-navy-400 leading-relaxed">
            아직 진행 중인 업무가 없어요.
            <br />
            알림함에서 관심을 보내보세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {confirmed.length > 0 && (
            <section>
              <h2 className="text-[13.5px] font-bold text-navy-700 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-teal-600" />
                확정된 업무
              </h2>
              <div className="flex flex-col gap-2.5">
                {confirmed.map(({ match, request }) => (
                  <button
                    key={match.id}
                    onClick={() => navigate(`/chat/${match.id}`)}
                    className="w-full text-left bg-white rounded-2xl shadow-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[14px] text-navy-800 line-clamp-1">
                        {request.title}
                      </p>
                      <Tag>확정</Tag>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-[12.5px] text-navy-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} /> {match.terms.schedule || request.workTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} /> {match.terms.location || request.location}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {matchedOnly.length > 0 && (
            <section>
              <h2 className="text-[13.5px] font-bold text-navy-700 mb-2.5 flex items-center gap-1.5">
                <MessageCircle size={15} className="text-teal-600" />
                협의 중인 업무
              </h2>
              <div className="flex flex-col gap-2.5">
                {matchedOnly.map(({ match, request }) => (
                  <button
                    key={match.id}
                    onClick={() => navigate(`/chat/${match.id}`)}
                    className="w-full text-left bg-white rounded-2xl shadow-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[14px] text-navy-800 line-clamp-1">
                        {request.title}
                      </p>
                      <Tag tone="navy">협의 중</Tag>
                    </div>
                    <p className="text-[12.5px] text-navy-400 mt-1.5">
                      채팅에서 업무 조건을 확정해보세요.
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {waiting.length > 0 && (
            <section>
              <h2 className="text-[13.5px] font-bold text-navy-700 mb-2.5 flex items-center gap-1.5">
                <Hourglass size={15} className="text-navy-500" />
                응답 대기 중
              </h2>
              <div className="flex flex-col gap-2.5">
                {waiting.map(({ match, request }) => (
                  <div key={match.id} className="bg-white rounded-2xl shadow-card p-4">
                    <p className="font-bold text-[14px] text-navy-800 line-clamp-1">
                      {request.title}
                    </p>
                    <p className="text-[12.5px] text-navy-400 mt-1.5">
                      의뢰자의 선택을 기다리고 있어요.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

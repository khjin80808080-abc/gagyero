import { useNavigate } from "react-router-dom";
import { Building2, Repeat, Bell, ShieldCheck, HelpCircle, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ClientMe() {
  const navigate = useNavigate();
  const { requests, myRequestIds, setRole } = useApp();
  const myRequests = requests.filter((r) => myRequestIds.includes(r.id));
  const matchedCount = myRequests.filter((r) => r.status === "matched").length;

  function switchToWorker() {
    setRole("worker");
    navigate("/worker/home");
  }

  const menu = [
    { icon: Bell, label: "알림 설정" },
    { icon: ShieldCheck, label: "안전결제 안내" },
    { icon: HelpCircle, label: "고객센터" },
  ];

  return (
    <div className="px-5 pt-6 pb-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-navy-800 mb-5">내정보</h1>

      <div className="bg-navy-800 text-white rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
          <Building2 size={26} />
        </div>
        <div>
          <p className="font-bold text-[15px]">사장님</p>
          <p className="text-[12px] text-navy-200 mt-0.5">의뢰자 계정 · 세종시</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-xl font-extrabold text-navy-800">{myRequests.length}</p>
          <p className="text-[12px] text-navy-400 mt-0.5">등록한 의뢰</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-xl font-extrabold text-teal-600">{matchedCount}</p>
          <p className="text-[12px] text-navy-400 mt-0.5">매칭 완료</p>
        </div>
      </div>

      <button
        onClick={switchToWorker}
        className="mt-4 w-full flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3.5"
      >
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
          <Repeat size={17} className="text-teal-600" />
        </div>
        <span className="flex-1 text-left text-[13.5px] font-bold text-navy-700">
          경력자로 전환하기
        </span>
        <ChevronRight size={16} className="text-navy-300" />
      </button>

      <div className="mt-4 bg-white rounded-2xl shadow-card divide-y divide-navy-50">
        {menu.map(({ icon: Icon, label }) => (
          <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5">
            <Icon size={17} className="text-navy-400" />
            <span className="flex-1 text-left text-[13.5px] text-navy-700">{label}</span>
            <ChevronRight size={16} className="text-navy-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

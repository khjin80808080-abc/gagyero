import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, X } from "lucide-react";
import TopBar from "../../components/TopBar";
import { useApp } from "../../context/AppContext";

const EMOJIS = ["🍳", "🔧", "📷", "🗂️", "🪚", "🧵", "🎨", "🧾", "🚚", "🛠️"];

const fieldClass =
  "w-full rounded-xl border border-navy-100 bg-white px-3.5 py-3 text-[14px] text-navy-800 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-400";
const labelClass = "text-[13px] font-bold text-navy-700 mb-1.5 block";

export default function WorkerProfileForm() {
  const navigate = useNavigate();
  const { saveMyWorkerProfile } = useApp();

  const [avatarEmoji, setAvatarEmoji] = useState(EMOJIS[0]);
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [totalCareerYears, setTotalCareerYears] = useState<number | "">("");
  const [previousWork, setPreviousWork] = useState("");
  const [actualTasks, setActualTasks] = useState("");
  const [strengths, setStrengths] = useState("");
  const [certifications, setCertifications] = useState("");
  const [tools, setTools] = useState("");
  const [regions, setRegions] = useState("세종시 ");
  const [availableTime, setAvailableTime] = useState("");
  const [desiredRate, setDesiredRate] = useState("");
  const [preferredWork, setPreferredWork] = useState("");
  const [avoidWork, setAvoidWork] = useState("");
  const [portfolio, setPortfolio] = useState<string[]>([]);

  const canSubmit = name.trim() && intro.trim() && totalCareerYears && actualTasks.trim();

  function handlePortfolioAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setPortfolio((p) => [...p, ...names].slice(0, 6));
    e.target.value = "";
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const worker = saveMyWorkerProfile({
      name: name.trim(),
      avatarEmoji,
      intro: intro.trim(),
      totalCareerYears: Number(totalCareerYears),
      previousWork: previousWork.trim(),
      actualTasks: actualTasks.trim(),
      strengths: strengths.trim(),
      certifications: certifications.trim() || "-",
      tools: tools.trim(),
      regions: regions.trim(),
      availableTime: availableTime.trim() || "협의 가능",
      desiredRate: desiredRate.trim() || "협의",
      preferredWork: preferredWork.trim(),
      avoidWork: avoidWork.trim(),
      portfolio,
    });
    navigate(`/worker/profile/${worker.id}/analysis`);
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="경력자 프로필 작성" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        <div className="flex flex-col gap-5 pb-4">
          <div>
            <label className={labelClass}>대표 아이콘</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setAvatarEmoji(e)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 transition-colors ${
                    avatarEmoji === e ? "border-teal-500 bg-teal-50" : "border-navy-100 bg-white"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>이름</label>
            <input
              className={fieldClass}
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>자기소개</label>
            <textarea
              className={`${fieldClass} min-h-[80px] resize-none`}
              placeholder="예) 8년간 음식점 주방과 매장 운영을 담당했습니다"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>총 경력 기간 (년)</label>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              placeholder="예) 8"
              value={totalCareerYears}
              onChange={(e) =>
                setTotalCareerYears(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className={labelClass}>이전 직장 또는 활동 분야</label>
            <input
              className={fieldClass}
              placeholder="예) 세종 소재 한식 매장 주방장"
              value={previousWork}
              onChange={(e) => setPreviousWork(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>실제 수행했던 업무</label>
            <textarea
              className={`${fieldClass} min-h-[80px] resize-none`}
              placeholder="예) 재료 손질, 메뉴 조리, 직원 업무 조율"
              value={actualTasks}
              onChange={(e) => setActualTasks(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>잘할 수 있는 일 (강점)</label>
            <input
              className={fieldClass}
              placeholder="예) 빠른 조리 속도, 위기상황 대응"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>자격증</label>
            <input
              className={fieldClass}
              placeholder="예) 조리기능사"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>사용 가능한 도구·장비</label>
            <input
              className={fieldClass}
              placeholder="예) 주방 전 기물"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>활동 가능 지역</label>
            <input
              className={fieldClass}
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>가능한 날짜와 시간</label>
            <input
              className={fieldClass}
              placeholder="예) 평일 오후, 주말 종일 가능"
              value={availableTime}
              onChange={(e) => setAvailableTime(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>희망 시간당·일당·건당 금액</label>
            <input
              className={fieldClass}
              placeholder="예) 시급 3만원 / 일당 20만원"
              value={desiredRate}
              onChange={(e) => setDesiredRate(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>선호하는 업무</label>
            <input
              className={fieldClass}
              placeholder="예) 반복 조리 업무, 신메뉴 개발"
              value={preferredWork}
              onChange={(e) => setPreferredWork(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>피하고 싶은 업무</label>
            <input
              className={fieldClass}
              placeholder="예) 심야 시간, 장거리 이동 업무"
              value={avoidWork}
              onChange={(e) => setAvoidWork(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>포트폴리오 및 작업사진</label>
            <div className="flex flex-wrap gap-2">
              {portfolio.map((p, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-xl bg-navy-50 flex items-center justify-center text-[10px] text-navy-400 px-1 text-center overflow-hidden"
                >
                  {p}
                  <button
                    onClick={() => setPortfolio((ps) => ps.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-navy-800/70 text-white flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-navy-200 flex items-center justify-center text-navy-300 cursor-pointer">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePortfolioAdd}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 py-4 bg-white border-t border-navy-100">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white transition-colors ${
            canSubmit ? "bg-teal-500 active:scale-[0.98]" : "bg-navy-200"
          }`}
        >
          <Sparkles size={18} />
          AI로 내 경력 분석하기
        </button>
      </div>
    </div>
  );
}

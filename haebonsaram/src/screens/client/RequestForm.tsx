import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, X } from "lucide-react";
import TopBar from "../../components/TopBar";
import { useApp } from "../../context/AppContext";
import type { Difficulty } from "../../types";

const difficulties: Difficulty[] = ["하", "중", "중상", "상"];

const fieldClass =
  "w-full rounded-xl border border-navy-100 bg-white px-3.5 py-3 text-[14px] text-navy-800 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-400";
const labelClass = "text-[13px] font-bold text-navy-700 mb-1.5 block";

export default function RequestForm() {
  const navigate = useNavigate();
  const { createRequest } = useApp();

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [detail, setDetail] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("중");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [location, setLocation] = useState("세종시 ");
  const [headcount, setHeadcount] = useState(1);
  const [budget, setBudget] = useState<number | "">("");
  const [requirements, setRequirements] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const canSubmit = title.trim() && detail.trim() && startDate && endDate && budget;

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setPhotos((p) => [...p, ...names].slice(0, 6));
    e.target.value = "";
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const req = createRequest({
      title: title.trim(),
      problem: problem.trim(),
      detail: detail.trim(),
      requiredLevel: requiredLevel.trim() || "관련 경력 우대",
      difficulty,
      startDate,
      endDate,
      workTime: workTime.trim() || "협의 가능",
      location: location.trim(),
      headcount,
      budget: Number(budget),
      requirements: requirements.trim(),
      photos,
    });
    navigate(`/client/requests/${req.id}/analysis`);
  }

  return (
    <div className="h-full flex flex-col">
      <TopBar title="업무 의뢰 작성" />
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
        <div className="flex flex-col gap-5 pb-4">
          <div>
            <label className={labelClass}>업무 제목</label>
            <input
              className={fieldClass}
              placeholder="예) 내일 오후 음식점 주방 경력자 필요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>해결해야 할 문제</label>
            <input
              className={fieldClass}
              placeholder="예) 주말 예약이 몰려 인력이 부족합니다"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>업무 상세내용</label>
            <textarea
              className={`${fieldClass} min-h-[96px] resize-none`}
              placeholder="구체적인 업무 내용을 적어주세요"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>필요한 경력 수준</label>
            <input
              className={fieldClass}
              placeholder="예) 음식점 주방 5년 이상"
              value={requiredLevel}
              onChange={(e) => setRequiredLevel(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>작업 난이도</label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold border transition-colors ${
                    difficulty === d
                      ? "bg-navy-800 text-white border-navy-800"
                      : "bg-white text-navy-400 border-navy-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>시작일</label>
              <input
                type="date"
                className={fieldClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>종료일</label>
              <input
                type="date"
                className={fieldClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>작업 시간</label>
            <input
              className={fieldClass}
              placeholder="예) 오후 2시 ~ 7시"
              value={workTime}
              onChange={(e) => setWorkTime(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>작업 장소</label>
            <input
              className={fieldClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>예상 투입 인원</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHeadcount((h) => Math.max(1, h - 1))}
                className="w-9 h-9 rounded-full bg-navy-50 text-navy-700 font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-navy-800">
                {headcount}
              </span>
              <button
                onClick={() => setHeadcount((h) => h + 1)}
                className="w-9 h-9 rounded-full bg-navy-50 text-navy-700 font-bold"
              >
                +
              </button>
              <span className="text-[13px] text-navy-400">명</span>
            </div>
          </div>

          <div>
            <label className={labelClass}>예산 (원)</label>
            <input
              type="number"
              inputMode="numeric"
              className={fieldClass}
              placeholder="예) 150000"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className={labelClass}>필요한 자격증·장비</label>
            <input
              className={fieldClass}
              placeholder="예) 위생교육 이수자 우대"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>사진 첨부</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-xl bg-navy-50 flex items-center justify-center text-[10px] text-navy-400 px-1 text-center overflow-hidden"
                >
                  {p}
                  <button
                    onClick={() => setPhotos((ps) => ps.filter((_, idx) => idx !== i))}
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
                  onChange={handlePhotoAdd}
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
          AI로 의뢰 분석하기
        </button>
      </div>
    </div>
  );
}

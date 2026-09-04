import type {
  Difficulty,
  MatchRecord,
  RequestAnalysis,
  WorkRequest,
  WorkerAnalysis,
  WorkerProfile,
} from "../types";

interface FieldRule {
  field: string;
  keywords: string[];
  coreSkills: string[];
  recommendedCareer: string;
  baseTags: string[];
}

const FIELD_RULES: FieldRule[] = [
  {
    field: "외식업 · 주방 운영",
    keywords: ["주방", "음식", "조리", "메뉴", "홀", "식당", "카페", "요리"],
    coreSkills: ["재료 손질", "조리 보조", "피크타임 대응", "위생 관리"],
    recommendedCareer: "음식점 주방 경력 5년 이상",
    baseTags: ["주방경력 5년 이상", "메뉴조리"],
  },
  {
    field: "전기 설비 · 현장 점검",
    keywords: ["전기", "배선", "누전", "조명", "콘센트", "분전반"],
    coreSkills: ["배선 점검", "누전 진단", "조명 회로 보수", "안전 점검"],
    recommendedCareer: "전기 관련 현장경력 7년 이상",
    baseTags: ["전기설비 7년 이상", "배선점검"],
  },
  {
    field: "사진 · 콘텐츠 촬영",
    keywords: ["촬영", "사진", "영상", "콘텐츠", "SNS", "포토"],
    coreSkills: ["구도 설계", "보정 작업", "브랜드 톤앤매너", "SNS용 편집"],
    recommendedCareer: "전문 촬영 경험 3년 이상",
    baseTags: ["촬영경력 3년 이상", "SNS콘텐츠"],
  },
  {
    field: "매장 운영 · 관리 컨설팅",
    keywords: ["매장관리", "점장", "운영", "재고", "발주", "근무표", "매뉴얼"],
    coreSkills: ["발주 체계 정리", "재고 관리", "근무표 설계", "매뉴얼 작성"],
    recommendedCareer: "매장관리 또는 점장 경력 5년 이상",
    baseTags: ["매장관리 5년 이상", "재고관리"],
  },
  {
    field: "목공 · 인테리어 시공",
    keywords: ["목공", "가구", "인테리어", "시공", "집기", "진열대", "가벽"],
    coreSkills: ["집기 제작", "목재 보수", "가벽 시공", "마감 처리"],
    recommendedCareer: "목공·인테리어 시공 경력 5년 이상",
    baseTags: ["목공경력 5년 이상", "인테리어시공"],
  },
  {
    field: "봉제 · 수선",
    keywords: ["봉제", "수선", "유니폼", "재봉", "커튼", "의류"],
    coreSkills: ["정밀 재단", "유니폼 제작", "수선 작업", "소량 맞춤 생산"],
    recommendedCareer: "봉제·수선 경력 5년 이상",
    baseTags: ["봉제경력 5년 이상", "맞춤수선"],
  },
  {
    field: "디자인 · 사무 · 회계",
    keywords: ["디자인", "회계", "사무", "정산", "장부", "브랜딩", "편집"],
    coreSkills: ["문서 정리", "브랜드 가이드 제작", "정산 관리", "실무 자동화"],
    recommendedCareer: "디자인·사무·회계 경력 3년 이상",
    baseTags: ["사무경력 3년 이상", "브랜딩"],
  },
];

const GENERIC_FIELD: FieldRule = {
  field: "생활 서비스 · 현장 지원",
  keywords: [],
  coreSkills: ["현장 대응", "일정 관리", "커뮤니케이션", "문제 해결"],
  recommendedCareer: "관련 현장경력 3년 이상",
  baseTags: ["현장경력 3년 이상", "생활서비스"],
};

function matchField(text: string): FieldRule {
  let best: { rule: FieldRule; score: number } | null = null;
  for (const rule of FIELD_RULES) {
    const score = rule.keywords.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { rule, score };
    }
  }
  return best ? best.rule : GENERIC_FIELD;
}

function regionTag(location: string): string {
  if (location.includes("세종")) return "세종시";
  const first = location.split(" ")[0];
  return first || "지역무관";
}

function timeTag(workTime: string): string {
  if (workTime.includes("오전")) return "오전근무";
  if (workTime.includes("오후")) return "오후근무";
  if (workTime.includes("저녁") || workTime.includes("야간")) return "야간근무";
  return "시간협의";
}

function durationLabel(start: string, end: string): string {
  if (!start || !end) return "미정";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return "당일";
  const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  if (days <= 1) return "당일";
  return `${days}일`;
}

function budgetFitLabel(budget: number, difficulty: Difficulty, days: number): string {
  const perDay = budget / Math.max(days, 1);
  const floor: Record<Difficulty, number> = {
    하: 80000,
    중: 120000,
    중상: 160000,
    상: 220000,
  };
  if (perDay >= floor[difficulty] * 1.3) return "넉넉함 (경력자 매칭에 유리)";
  if (perDay >= floor[difficulty]) return "적정 (평균 시세 수준)";
  return "다소 낮음 (숙련도 낮은 인력 위주로 매칭될 수 있음)";
}

export function analyzeRequest(req: WorkRequest): RequestAnalysis {
  const text = `${req.title} ${req.problem} ${req.detail} ${req.requiredLevel}`;
  const rule = matchField(text);
  const days = (() => {
    const s = new Date(req.startDate).getTime();
    const e = new Date(req.endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 1;
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  })();

  const tags = Array.from(
    new Set([
      ...rule.baseTags,
      timeTag(req.workTime),
      regionTag(req.location),
      days <= 1 ? "당일업무" : `${days}일업무`,
    ])
  ).slice(0, 8);

  return {
    field: rule.field,
    coreSkills: rule.coreSkills,
    recommendedCareer: req.requiredLevel || rule.recommendedCareer,
    difficulty: `${req.difficulty} (${
      req.difficulty === "상" || req.difficulty === "중상"
        ? "숙련자 우선 필요"
        : "일반 경력자로도 대응 가능"
    })`,
    duration: durationLabel(req.startDate, req.endDate),
    budgetFit: budgetFitLabel(req.budget, req.difficulty, days),
    headcount: `${req.headcount}명`,
    caution:
      req.difficulty === "상" || req.difficulty === "중상"
        ? "난이도가 높은 편이라 숙련자 우선 배치를 권장합니다."
        : "특이사항 없이 일반적인 조건의 업무입니다.",
    tags,
  };
}

export function analyzeWorker(w: {
  name: string;
  intro: string;
  totalCareerYears: number;
  previousWork: string;
  actualTasks: string;
  strengths: string;
  regions: string;
}): WorkerAnalysis {
  const text = `${w.intro} ${w.previousWork} ${w.actualTasks} ${w.strengths}`;
  const rule = matchField(text);

  const level =
    w.totalCareerYears >= 10
      ? "전문가 (10년차 이상)"
      : w.totalCareerYears >= 5
      ? "숙련 (5년차 이상)"
      : w.totalCareerYears >= 3
      ? "경력자 (3년차 이상)"
      : "입문 경력자";

  const strengthsList = w.strengths
    .split(/[,·\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const tasksList = w.actualTasks
    .split(/[,·\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const suitableDifficulty =
    w.totalCareerYears >= 7 ? "중 ~ 상" : w.totalCareerYears >= 3 ? "하 ~ 중" : "하";

  return {
    mainJob: rule.field,
    careerLevel: level,
    coreSkills: rule.coreSkills,
    possibleTasks: tasksList.length ? tasksList : rule.coreSkills,
    strengths: strengthsList.length ? strengthsList : ["성실한 업무 태도", "빠른 현장 적응"],
    suitableDifficulty,
    recommendedFields: [rule.field],
    oneLiner: `${w.totalCareerYears}년간 ${rule.field.split(" · ")[0]} 분야에서 활동한 ${
      w.totalCareerYears >= 7 ? "베테랑" : "현장형"
    } 전문가입니다.`,
    tags: Array.from(
      new Set([...rule.baseTags, regionTag(w.regions || "지역무관")])
    ).slice(0, 6),
  };
}

function tagOverlapScore(a: string[], b: string[]): number {
  const setB = new Set(b.map((t) => t.replace(/\s?\d+년.*$/, "").trim()));
  let score = 0;
  for (const tag of a) {
    const norm = tag.replace(/\s?\d+년.*$/, "").trim();
    if (setB.has(norm)) score += 1;
    else if ([...setB].some((t) => t.includes(norm) || norm.includes(t))) score += 0.6;
  }
  return score;
}

export interface RecommendationReason {
  score: number;
  reasons: string[];
}

export function scoreWorkerForRequest(
  req: WorkRequest,
  worker: WorkerProfile
): RecommendationReason {
  const analysis = req.analysis ?? analyzeRequest(req);
  const workerAnalysis = worker.analysis;
  const reqTags = analysis.tags;
  const workerTags = workerAnalysis?.tags ?? [];

  let raw = tagOverlapScore(reqTags, workerTags) * 18;

  const fieldMatch =
    workerAnalysis && analysis.field === workerAnalysis.mainJob ? 22 : 0;
  raw += fieldMatch;

  const careerGap = Math.max(0, 5 - Math.abs(worker.totalCareerYears - 6));
  raw += careerGap * 2;

  raw += Math.max(0, 10 - worker.distanceKm) * 1.2;

  if (worker.rating > 0) raw += (worker.rating - 4) * 10;

  const score = Math.max(52, Math.min(99, Math.round(raw)));

  const reasons: string[] = [];
  if (fieldMatch) reasons.push(`${analysis.field.split(" · ")[0]} 경력 일치`);
  if (req.workTime) reasons.push(`요청 시간(${req.workTime}) 근무 가능`);
  reasons.push(`매장과 ${worker.distanceKm.toFixed(1)}km 거리`);
  if (worker.rating >= 4.8) reasons.push(`평점 ${worker.rating.toFixed(1)}의 높은 신뢰도`);
  if (worker.completedJobs >= 30) reasons.push(`완료 업무 ${worker.completedJobs}건의 풍부한 경험`);
  if (worker.totalCareerYears >= 5) reasons.push(`경력 ${worker.totalCareerYears}년의 숙련도`);
  if (reasons.length < 3) reasons.push(`희망 조건과 근접한 활동 반경`);

  return { score, reasons: reasons.slice(0, 3) };
}

export interface RankedCandidate extends RecommendationReason {
  worker: WorkerProfile;
}

/**
 * The AI-selected active candidate pool for a request: top-N workers by fit
 * score, excluding anyone who has already declined this specific request.
 * A decline therefore makes room for the next-ranked worker automatically —
 * this is the "자동 보충" behavior, derived rather than stored.
 */
export function getActiveCandidates(
  request: WorkRequest,
  workers: WorkerProfile[],
  matches: MatchRecord[],
  count = 5
): RankedCandidate[] {
  return workers
    .filter((w) => {
      const m = matches.find(
        (m) => m.requestId === request.id && m.workerId === w.id
      );
      return m?.workerResponse !== "declined";
    })
    .map((w) => ({ worker: w, ...scoreWorkerForRequest(request, w) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function scoreRequestForWorker(
  worker: WorkerProfile,
  req: WorkRequest
): RecommendationReason {
  return scoreWorkerForRequest(req, worker);
}

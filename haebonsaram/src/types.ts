export type UserRole = "client" | "worker";

export type Difficulty = "하" | "중" | "중상" | "상";

export interface RequestAnalysis {
  field: string;
  coreSkills: string[];
  recommendedCareer: string;
  difficulty: string;
  duration: string;
  budgetFit: string;
  headcount: string;
  caution: string;
  tags: string[];
}

export interface WorkRequest {
  id: string;
  title: string;
  problem: string;
  detail: string;
  requiredLevel: string;
  difficulty: Difficulty;
  startDate: string;
  endDate: string;
  workTime: string;
  location: string;
  headcount: number;
  budget: number;
  requirements: string;
  photos: string[];
  createdAt: number;
  isSample?: boolean;
  status: "draft" | "analyzed" | "matching" | "matched";
  analysis?: RequestAnalysis;
  clientInterestWorkerIds: string[];
}

export interface WorkerAnalysis {
  mainJob: string;
  careerLevel: string;
  coreSkills: string[];
  possibleTasks: string[];
  strengths: string[];
  suitableDifficulty: string;
  recommendedFields: string[];
  oneLiner: string;
  tags: string[];
}

export interface WorkerProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  intro: string;
  totalCareerYears: number;
  previousWork: string;
  actualTasks: string;
  strengths: string;
  certifications: string;
  tools: string;
  regions: string;
  availableTime: string;
  desiredRate: string;
  portfolio: string[];
  rating: number;
  completedJobs: number;
  distanceKm: number;
  isSample?: boolean;
  analysis?: WorkerAnalysis;
  workerInterestRequestIds: string[];
  reviews?: { author: string; text: string; score: number }[];
  preferredWork?: string;
  avoidWork?: string;
  jobSeekingActive?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "client" | "worker";
  text: string;
  time: string;
}

export interface AgreedTerms {
  schedule: string;
  location: string;
  amount: string;
  scope: string;
  confirmed: boolean;
}

export type WorkerResponse = "pending" | "interested" | "declined";

export interface MatchRecord {
  id: string;
  requestId: string;
  workerId: string;
  matched: boolean;
  matchedAt?: number;
  messages: ChatMessage[];
  terms: AgreedTerms;
  seenPopup?: boolean;
  workerResponse: WorkerResponse;
  notifiedAt: number;
  respondedAt?: number;
}

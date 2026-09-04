import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { sampleRequests, sampleWorkers } from "../data/sampleData";
import { analyzeRequest, analyzeWorker } from "../lib/ai";
import type {
  AgreedTerms,
  ChatMessage,
  MatchRecord,
  UserRole,
  WorkRequest,
  WorkerProfile,
} from "../types";

const STORAGE_KEY = "haebonsaram_state_v1";

interface PersistedState {
  role: UserRole | null;
  requests: WorkRequest[];
  workers: WorkerProfile[];
  matches: MatchRecord[];
  myWorkerId: string | null;
  myRequestIds: string[];
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return {
    role: null,
    requests: sampleRequests,
    workers: sampleWorkers,
    matches: [],
    myWorkerId: null,
    myRequestIds: [],
  };
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyTerms(): AgreedTerms {
  return { schedule: "", location: "", amount: "", scope: "", confirmed: false };
}

interface AppContextValue {
  role: UserRole | null;
  setRole: (r: UserRole | null) => void;
  requests: WorkRequest[];
  workers: WorkerProfile[];
  matches: MatchRecord[];
  myWorkerId: string | null;
  myRequestIds: string[];
  createRequest: (
    draft: Omit<
      WorkRequest,
      "id" | "createdAt" | "status" | "clientInterestWorkerIds" | "analysis"
    >
  ) => WorkRequest;
  runRequestAnalysis: (id: string) => Promise<void>;
  saveMyWorkerProfile: (
    draft: Omit<
      WorkerProfile,
      | "id"
      | "rating"
      | "completedJobs"
      | "distanceKm"
      | "analysis"
      | "workerInterestRequestIds"
    >
  ) => WorkerProfile;
  runWorkerAnalysis: (id: string) => Promise<void>;
  startMatching: (requestId: string) => void;
  sendClientInterest: (requestId: string, workerId: string) => MatchRecord;
  sendWorkerInterest: (workerId: string, requestId: string) => MatchRecord;
  declineMatch: (requestId: string, workerId: string) => void;
  setJobSeekingActive: (active: boolean) => void;
  getMatch: (requestId: string, workerId: string) => MatchRecord | undefined;
  markMatchPopupSeen: (matchId: string) => void;
  addChatMessage: (matchId: string, sender: "client" | "worker", text: string) => void;
  updateTerms: (matchId: string, terms: Partial<AgreedTerms>) => void;
  getRequest: (id: string) => WorkRequest | undefined;
  getWorker: (id: string) => WorkerProfile | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable, ignore
    }
  }, [state]);

  const setRole = useCallback((r: UserRole | null) => {
    setState((s) => ({ ...s, role: r }));
  }, []);

  const createRequest: AppContextValue["createRequest"] = useCallback((draft) => {
    const newReq: WorkRequest = {
      ...draft,
      id: makeId("req"),
      createdAt: Date.now(),
      status: "draft",
      clientInterestWorkerIds: [],
    };
    setState((s) => ({
      ...s,
      requests: [newReq, ...s.requests],
      myRequestIds: [newReq.id, ...s.myRequestIds],
    }));
    return newReq;
  }, []);

  const runRequestAnalysis: AppContextValue["runRequestAnalysis"] = useCallback(
    async (id) => {
      await new Promise((r) => setTimeout(r, 1400));
      setState((s) => ({
        ...s,
        requests: s.requests.map((req) =>
          req.id === id
            ? { ...req, status: "analyzed", analysis: analyzeRequest(req) }
            : req
        ),
      }));
    },
    []
  );

  const saveMyWorkerProfile: AppContextValue["saveMyWorkerProfile"] = useCallback(
    (draft) => {
      const id = makeId("wk");
      const newWorker: WorkerProfile = {
        ...draft,
        id,
        rating: 0,
        completedJobs: 0,
        distanceKm: Math.round((1 + Math.random() * 6) * 10) / 10,
        workerInterestRequestIds: [],
      };
      setState((s) => ({
        ...s,
        workers: [newWorker, ...s.workers.filter((w) => w.id !== s.myWorkerId)],
        myWorkerId: id,
      }));
      return newWorker;
    },
    []
  );

  const runWorkerAnalysis: AppContextValue["runWorkerAnalysis"] = useCallback(
    async (id) => {
      await new Promise((r) => setTimeout(r, 1400));
      setState((s) => ({
        ...s,
        workers: s.workers.map((w) =>
          w.id === id
            ? { ...w, analysis: analyzeWorker(w), jobSeekingActive: true }
            : w
        ),
      }));
    },
    []
  );

  const startMatching: AppContextValue["startMatching"] = useCallback((id) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((req) =>
        req.id === id && req.status === "analyzed"
          ? { ...req, status: "matching" }
          : req
      ),
    }));
  }, []);

  const setJobSeekingActive: AppContextValue["setJobSeekingActive"] = useCallback(
    (active) => {
      setState((s) =>
        s.myWorkerId
          ? {
              ...s,
              workers: s.workers.map((w) =>
                w.id === s.myWorkerId ? { ...w, jobSeekingActive: active } : w
              ),
            }
          : s
      );
    },
    []
  );

  const getMatch = useCallback(
    (requestId: string, workerId: string) =>
      state.matches.find(
        (m) => m.requestId === requestId && m.workerId === workerId
      ),
    [state.matches]
  );

  const ensureMatch = useCallback(
    (requestId: string, workerId: string, s: PersistedState): PersistedState => {
      const existing = s.matches.find(
        (m) => m.requestId === requestId && m.workerId === workerId
      );
      if (existing) return s;
      const record: MatchRecord = {
        id: makeId("match"),
        requestId,
        workerId,
        matched: false,
        messages: [],
        terms: emptyTerms(),
        workerResponse: "pending",
        notifiedAt: Date.now(),
      };
      return { ...s, matches: [...s.matches, record] };
    },
    []
  );

  const sendClientInterest: AppContextValue["sendClientInterest"] = useCallback(
    (requestId, workerId) => {
      let result!: MatchRecord;
      setState((s) => {
        let next = ensureMatch(requestId, workerId, s);
        next = {
          ...next,
          requests: next.requests.map((req) =>
            req.id === requestId && !req.clientInterestWorkerIds.includes(workerId)
              ? {
                  ...req,
                  clientInterestWorkerIds: [...req.clientInterestWorkerIds, workerId],
                  status: "matching",
                }
              : req
          ),
        };
        const worker = next.workers.find((w) => w.id === workerId);
        const workerAlreadyInterested = !!worker?.workerInterestRequestIds.includes(
          requestId
        );
        next = {
          ...next,
          matches: next.matches.map((m) =>
            m.requestId === requestId && m.workerId === workerId
              ? {
                  ...m,
                  matched: workerAlreadyInterested ? true : m.matched,
                  matchedAt:
                    workerAlreadyInterested && !m.matched ? Date.now() : m.matchedAt,
                }
              : m
          ),
        };
        if (workerAlreadyInterested) {
          next = {
            ...next,
            requests: next.requests.map((req) =>
              req.id === requestId ? { ...req, status: "matched" } : req
            ),
          };
        }
        result = next.matches.find(
          (m) => m.requestId === requestId && m.workerId === workerId
        )!;
        return next;
      });
      return result;
    },
    [ensureMatch]
  );

  const sendWorkerInterest: AppContextValue["sendWorkerInterest"] = useCallback(
    (workerId, requestId) => {
      let result!: MatchRecord;
      setState((s) => {
        let next = ensureMatch(requestId, workerId, s);
        next = {
          ...next,
          workers: next.workers.map((w) =>
            w.id === workerId && !w.workerInterestRequestIds.includes(requestId)
              ? {
                  ...w,
                  workerInterestRequestIds: [...w.workerInterestRequestIds, requestId],
                }
              : w
          ),
        };
        const req = next.requests.find((r) => r.id === requestId);
        const clientAlreadyInterested = !!req?.clientInterestWorkerIds.includes(
          workerId
        );
        next = {
          ...next,
          matches: next.matches.map((m) =>
            m.requestId === requestId && m.workerId === workerId
              ? {
                  ...m,
                  workerResponse: "interested",
                  respondedAt: Date.now(),
                  matched: clientAlreadyInterested ? true : m.matched,
                  matchedAt:
                    clientAlreadyInterested && !m.matched ? Date.now() : m.matchedAt,
                }
              : m
          ),
        };
        if (clientAlreadyInterested) {
          next = {
            ...next,
            requests: next.requests.map((r) =>
              r.id === requestId ? { ...r, status: "matched" } : r
            ),
          };
        }
        result = next.matches.find(
          (m) => m.requestId === requestId && m.workerId === workerId
        )!;
        return next;
      });
      return result;
    },
    [ensureMatch]
  );

  const declineMatch: AppContextValue["declineMatch"] = useCallback(
    (requestId, workerId) => {
      setState((s) => {
        const next = ensureMatch(requestId, workerId, s);
        return {
          ...next,
          matches: next.matches.map((m) =>
            m.requestId === requestId && m.workerId === workerId
              ? { ...m, workerResponse: "declined", respondedAt: Date.now() }
              : m
          ),
        };
      });
    },
    [ensureMatch]
  );

  const markMatchPopupSeen = useCallback((matchId: string) => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) =>
        m.id === matchId ? { ...m, seenPopup: true } : m
      ),
    }));
  }, []);

  const addChatMessage = useCallback(
    (matchId: string, sender: "client" | "worker", text: string) => {
      const msg: ChatMessage = {
        id: makeId("msg"),
        sender,
        text,
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setState((s) => ({
        ...s,
        matches: s.matches.map((m) =>
          m.id === matchId ? { ...m, messages: [...m.messages, msg] } : m
        ),
      }));
    },
    []
  );

  const updateTerms = useCallback((matchId: string, terms: Partial<AgreedTerms>) => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) =>
        m.id === matchId ? { ...m, terms: { ...m.terms, ...terms } } : m
      ),
    }));
  }, []);

  const getRequest = useCallback(
    (id: string) => state.requests.find((r) => r.id === id),
    [state.requests]
  );
  const getWorker = useCallback(
    (id: string) => state.workers.find((w) => w.id === id),
    [state.workers]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      role: state.role,
      setRole,
      requests: state.requests,
      workers: state.workers,
      matches: state.matches,
      myWorkerId: state.myWorkerId,
      myRequestIds: state.myRequestIds,
      createRequest,
      runRequestAnalysis,
      saveMyWorkerProfile,
      runWorkerAnalysis,
      startMatching,
      sendClientInterest,
      sendWorkerInterest,
      declineMatch,
      setJobSeekingActive,
      getMatch,
      markMatchPopupSeen,
      addChatMessage,
      updateTerms,
      getRequest,
      getWorker,
    }),
    [
      state,
      setRole,
      createRequest,
      runRequestAnalysis,
      saveMyWorkerProfile,
      runWorkerAnalysis,
      startMatching,
      sendClientInterest,
      sendWorkerInterest,
      declineMatch,
      setJobSeekingActive,
      getMatch,
      markMatchPopupSeen,
      addChatMessage,
      updateTerms,
      getRequest,
      getWorker,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

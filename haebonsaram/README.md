# 해본사람 (모바일 인터랙티브 목업)

"단순인력이 아닌, 해본 사람을 찾아드립니다."

숨고식 공개 견적 장터가 아니라, **AI가 먼저 찾고 판단해서 최대 5명으로 압축해 알려주는** 매칭 서비스의
모바일 목업입니다. 경력자는 한 번 프로필을 등록하면 이후 검색 없이 AI 알림만 받고, 의뢰자는 의뢰를 등록하면
AI가 전체 경력자를 분석해 적합도 상위 5명만 추천합니다. 실제 서버·결제 없이 로컬 상태 + `localStorage`로
전체 흐름을 시뮬레이션합니다.

## 실행 방법

```bash
cd haebonsaram
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 (모바일 뷰포트 390×844 기준으로 디자인되어 있으며,
데스크톱에서는 자동으로 중앙 스마트폰 프레임 안에 표시됩니다).

```bash
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

## 기술 스택

React 18 + TypeScript + Vite + Tailwind CSS + React Router + lucide-react.
기존 저장소의 `가계Ro`(Next.js) 앱과는 완전히 별개의 독립 프로젝트로, `/haebonsaram` 디렉터리 안에서만
동작합니다.

## 핵심 화면 (요구된 12개 화면)

1. 역할 선택 — `/` (`StartScreen`)
2. 경력 등록 — `/worker/profile/new` (`WorkerProfileForm`)
3. AI 경력 분석 — `/worker/profile/:id/analysis` (`WorkerAnalysis`)
4. 경력자 매칭 대기(홈) — `/worker/home` (`WorkerHome`, 구직 ON/OFF 토글 포함)
5. 새로운 일감 도착 알림 — `/worker/notifications` (`WorkerNotifications`)
6. 추천 일감 상세정보 — `/jobs/:id` (`RequestDetailForWorker`, 관심있음/거절)
7. 의뢰 작성 — `/client/requests/new` (`RequestForm`)
8. AI 의뢰 분석 — `/client/requests/:id/analysis` (`RequestAnalysis`)
9. 경력자 탐색 중 — `/client/requests/:id/searching` (`ClientSearching`)
10. AI 추천 경력자 5명 — `/client/requests/:id/recommendations` (`RecommendationList`)
11. 상호 선택 완료 — `MatchModal` (양쪽 관심 표시 시 팝업)
12. 채팅 및 업무 협의 — `/chat/:matchId` (`ChatScreen`, 업무 조건 확정 시트 포함)

## 매칭 로직 요약 (`src/lib/ai.ts`)

- `analyzeRequest` / `analyzeWorker`: 키워드 기반 규칙으로 분야·핵심기술·태그를 자동 생성 (AI 분석 시뮬레이션).
- `scoreWorkerForRequest`: 태그 일치도·분야 일치·경력 연차·거리·평점을 종합해 0~99% 적합도 산출.
- `getActiveCandidates(request, workers, matches)`: 해당 의뢰를 **거절하지 않은** 경력자 중 적합도 상위 5명을
  매번 다시 계산합니다. 즉 경력자가 거절하면 별도 상태 저장 없이 다음 순위 후보가 자동으로 그 자리를
  채웁니다 (요구사항 7번 "후보 자동 보충"을 파생 로직으로 구현).

## 상태 관리

`src/context/AppContext.tsx`의 React Context가 의뢰(`WorkRequest`)·경력자(`WorkerProfile`)·매칭
(`MatchRecord`) 전체 상태를 들고 있고, 값이 바뀔 때마다 `localStorage`(`haebonsaram_state_v1`)에 저장됩니다.
새로고침해도 등록한 프로필·의뢰·매칭·채팅 내역이 유지됩니다.

## 주요 파일 구조

```
haebonsaram/
├─ src/
│  ├─ types.ts                  # WorkRequest / WorkerProfile / MatchRecord 등 타입
│  ├─ data/sampleData.ts        # 샘플 의뢰 4건 + 샘플 경력자 6명 (기획서 요구 데이터)
│  ├─ lib/ai.ts                 # AI 분석·적합도 스코어링·후보 선정 로직
│  ├─ context/AppContext.tsx    # 전역 상태 + localStorage 영속화
│  ├─ components/               # PhoneShell, BottomNav, TopBar, MatchModal, ScoreRing 등 공용 UI
│  └─ screens/
│     ├─ client/                # 의뢰자 화면 (홈/의뢰작성/분석/탐색중/추천/의뢰관리/AI매칭/내정보)
│     ├─ worker/                # 경력자 화면 (홈/프로필등록/분석/알림/일정/내경력/일감상세)
│     └─ WorkerDetail.tsx, ChatScreen.tsx, ChatList.tsx  # 양쪽 공용 화면
```

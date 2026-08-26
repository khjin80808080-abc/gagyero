const INPUT_METHODS = [
  { label: "영수증", icon: "🧾" },
  { label: "말하기", icon: "🎤" },
  { label: "글쓰기", icon: "✍️" },
  { label: "스크린샷", icon: "🖼️" },
  { label: "파일", icon: "📁" },
] as const;

export default function Home() {
  return (
    <main
      className="relative flex flex-1 flex-col overflow-hidden px-5 pt-8 pb-10 text-white"
      style={{
        background:
          "linear-gradient(160deg, #33127a 0%, #7c3aed 32%, #c026d3 62%, #fb923c 100%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-orange-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl"
      />

      <span className="relative text-lg font-bold tracking-tight">가계Ro</span>

      <div className="mt-7">
        <h1 className="text-[26px] font-bold leading-snug">편한 등록 선택</h1>
        <p className="mt-2 text-sm text-white/80">
          원하는 방법으로 등록하세요. 정리는 AI가 합니다.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {INPUT_METHODS.map((method) => (
          <button
            key={method.label}
            type="button"
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/95 py-5 shadow-sm active:bg-white"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-orange-100 text-2xl">
              {method.icon}
            </span>
            <span className="text-xs font-medium text-neutral-800">
              {method.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white/95 px-4 py-4 shadow-sm">
        <p className="text-xs text-neutral-500">이번 달 지출</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">0원</p>
      </div>
    </main>
  );
}

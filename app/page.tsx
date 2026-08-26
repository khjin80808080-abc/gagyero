const INPUT_METHODS = [
  { label: "영수증 사진", icon: "📷" },
  { label: "말하기", icon: "🎤" },
  { label: "글쓰기", icon: "✍️" },
  { label: "스크린샷", icon: "🖼️" },
  { label: "파일", icon: "📁" },
] as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 px-5 pt-8">
      <h1 className="text-2xl font-bold">편한 등록 선택</h1>

      <div className="grid grid-cols-2 gap-3">
        {INPUT_METHODS.map((method, index) => (
          <button
            key={method.label}
            type="button"
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/10 py-6 ${
              index === INPUT_METHODS.length - 1 ? "col-span-2" : ""
            }`}
          >
            <span className="text-3xl">{method.icon}</span>
            <span className="text-sm font-medium">{method.label}</span>
          </button>
        ))}
      </div>
    </main>
  );
}

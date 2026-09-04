export default function Tag({
  children,
  tone = "teal",
}: {
  children: React.ReactNode;
  tone?: "teal" | "navy" | "gray";
}) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    navy: "bg-navy-50 text-navy-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function ScoreRing({
  score,
  size = 56,
}: {
  score: number;
  size?: number;
}) {
  const stroke = size * 0.11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color =
    score >= 90 ? "#0f8175" : score >= 75 ? "#17a190" : "#4f71bf";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e6ebf5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-extrabold text-navy-800 leading-none" style={{ fontSize: size * 0.24 }}>
          {score}
        </span>
        <span className="text-[8px] text-navy-300 font-semibold">%</span>
      </div>
    </div>
  );
}

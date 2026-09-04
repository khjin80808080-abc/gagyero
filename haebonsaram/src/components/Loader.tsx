import { Sparkles } from "lucide-react";

export default function Loader({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
        <Sparkles size={22} className="text-teal-600" />
      </div>
      <p className="text-sm font-semibold text-navy-500">{text}</p>
    </div>
  );
}

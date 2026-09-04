import React from "react";

export default function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-navy-900 flex items-center justify-center sm:py-8">
      <div className="relative w-full sm:w-[390px] sm:h-[844px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-navy-800 sm:shadow-floating bg-[#f4f6fb] overflow-hidden flex flex-col h-screen sm:h-[844px]">
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-navy-800 rounded-b-2xl z-20" />
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}

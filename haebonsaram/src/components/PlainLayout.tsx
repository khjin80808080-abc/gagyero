import { Outlet } from "react-router-dom";

export default function PlainLayout() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">
        <Outlet />
      </div>
    </div>
  );
}

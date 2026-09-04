import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function TabLayout() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar overscroll-contain">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

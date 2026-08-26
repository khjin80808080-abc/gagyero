import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "가계Ro",
  description: "편한 등록 선택",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <div className="mx-auto flex min-h-screen max-w-md flex-col pb-16">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}

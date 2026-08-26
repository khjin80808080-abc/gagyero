import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "가계Ro",
  description: "편한 등록 선택",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

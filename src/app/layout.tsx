import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Podcat - AI가 만드는 매일의 팟캐스트",
  description: "스크롤 한 번으로 탐색하는 미니멀한 AI 팟캐스트 플랫폼. 매일 새로운 맞춤형 콘텐츠를 15분 안에.",
  keywords: "AI 팟캐스트, 스크롤 스냅, 미니멀 디자인, 매일 업데이트, 맞춤형 콘텐츠",
  authors: [{ name: "Podcat Team" }],
  creator: "Podcat",
  publisher: "Podcat",
  openGraph: {
    title: "Podcat - AI가 만드는 매일의 팟캐스트",
    description: "스크롤 한 번으로 탐색하는 미니멀한 AI 팟캐스트 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcat - AI가 만드는 매일의 팟캐스트",
    description: "스크롤 한 번으로 탐색하는 미니멀한 AI 팟캐스트 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

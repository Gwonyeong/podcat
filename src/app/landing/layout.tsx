import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import GoogleTagManager, {
  GoogleTagManagerBody,
} from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Podcat Audio Player - AI 팟캐스트 플레이어",
  description:
    "Podcat의 오디오 플레이어를 경험해보세요. AI가 생성한 샘플 팟캐스트를 재생하고 상세 정보를 확인할 수 있습니다.",
  keywords: "Podcat, AI 팟캐스트, 오디오 플레이어, 샘플 콘텐츠, 팟캐스트 재생",
  authors: [{ name: "Podcat Team" }],
  creator: "Podcat",
  publisher: "Podcat",
  openGraph: {
    title: "Podcat Audio Player - AI 팟캐스트 플레이어",
    description:
      "AI가 생성한 샘플 팟캐스트를 재생하고 상세 정보를 확인할 수 있습니다",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcat Audio Player - AI 팟캐스트 플레이어",
    description:
      "AI가 생성한 샘플 팟캐스트를 재생하고 상세 정보를 확인할 수 있습니다",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <GoogleTagManager />
      </head>
      <body className="font-sans antialiased">
        <GoogleTagManagerBody />
        {children}
      </body>
    </html>
  );
}

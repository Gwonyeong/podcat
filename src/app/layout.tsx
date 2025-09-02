import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleTagManager, {
  GoogleTagManagerBody,
} from "@/components/GoogleAnalytics";
import Providers from "./providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Podcat - AI 오디오 뉴스레터 플랫폼",
  description:
    "쌓여만 가는 뉴스레터, 팟켓이 오디오로 만들어드릴게요.",
  keywords:
    "오디오 뉴스레터, AI 큐레이션, 맞춤형 콘텐츠, 일일 업데이트, 뉴스레터 플랫폼",
  authors: [{ name: "Podcat Team" }],
  creator: "Podcat",
  publisher: "Podcat",
  openGraph: {
    title: "Podcat - AI 오디오 뉴스레터 플랫폼",
    description: "쌓여만 가는 뉴스레터, 팟켓이 오디오로 만들어드릴게요.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcat - AI 오디오 뉴스레터 플랫폼",
    description: "쌓여만 가는 뉴스레터, 팟켓이 오디오로 만들어드릴게요.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Podcat",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/black-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/black-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { 
        url: "/black-logo.png", 
        sizes: "192x192", 
        type: "image/png"
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <GoogleTagManager />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Podcat" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <GoogleTagManagerBody />
          <ServiceWorkerRegistration />
          {children}
        </Providers>
      </body>
    </html>
  );
}

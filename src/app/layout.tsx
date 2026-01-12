import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunum Yapıcı | Hızlı ve Profesyonel Sunum Tasarla",
  description: "Modern, profesyonel ve etkileyici sunumlar hazırlamanın en hızlı yolu. Mobil ve web mockup'ları ile sunumlarınızı özelleştirin, PDF olarak indirin.",
  keywords: ["sunum yapıcı", "sunum hazırlama", "profesyonel sunum", "mockup sunum", "yemreeke", "presentation maker"],
  authors: [{ name: "Emre Eke", url: "https://yemreeke.com" }],
  creator: "Emre Eke",
  metadataBase: new URL("https://sunumyapici.yemreeke.dev"),
  openGraph: {
    title: "Sunum Yapıcı | Hızlı ve Profesyonel Sunum Tasarla",
    description: "Modern ve etkileyici sunumlar hazırlamanın en kısa yolu.",
    url: "https://sunumyapici.yemreeke.dev",
    siteName: "Sunum Yapıcı",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunum Yapıcı",
    description: "Modern ve etkileyici sunumlar hazırlamanın en kısa yolu.",
    creator: "@yemreeke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import AuthRefresher from "@/components/auth/AuthRefresher";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paddock",
  description: "Sistem de gestiune pentru Școala Sportivă Republicană",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthRefresher />
        {children}
      </body>
    </html>
  );
}

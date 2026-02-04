import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Sidebar } from "@/components/shared/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Binance Sentiment Monitor",
  description: "Real-time social sentiment intelligence for Binance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "연구과제 예산 관리 시스템",
  description: "Research Project Budget Management System",
};

import MobileNav from "@/components/MobileNav";

// ... (existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-[#f3f4f6] text-gray-900`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 mb-16 md:mb-0">
              {children}
            </main>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}

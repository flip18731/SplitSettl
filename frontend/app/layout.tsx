import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "SplitSettl — AI-Powered Invoice Splitting & Settlement",
  description: "AI-powered invoice splitting and streaming settlement protocol for freelancers and DAO contributors on HashKey Chain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0F] min-h-screen">
        <Sidebar />
        <div className="ml-[240px] min-h-screen">
          <Header />
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

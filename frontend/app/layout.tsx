import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "SplitSettl — AI-Powered Payment Splitting on HashKey Chain",
  description:
    "An AI agent that analyzes contributions, generates invoices, and automatically splits payments to team members via HSP on HashKey Chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-primary min-h-screen text-text-primary">
        <Header />
        <main className="max-w-[1200px] mx-auto px-8 py-6">{children}</main>
      </body>
    </html>
  );
}

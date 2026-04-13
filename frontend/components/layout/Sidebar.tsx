"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5C3 3.89543 3.89543 3 5 3H8L10 5H15C16.1046 5 17 5.89543 17 7V14C17 15.1046 16.1046 16 15 16H5C3.89543 16 3 15.1046 3 14V5Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/invoice",
    label: "AI Invoice",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2H14L17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V3C3 2.44772 3.44772 2 4 2H6Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10H13M7 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-[rgba(255,255,255,0.06)] bg-[#0A0A0F] z-50 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[rgba(255,255,255,0.06)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00B894] to-[#6C5CE7] flex items-center justify-center text-white font-bold text-sm">
            SS
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">SplitSettl</h1>
            <p className="text-[10px] text-[rgba(255,255,255,0.35)] font-medium tracking-wider uppercase">
              AI Payment Protocol
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(255,255,255,0.06)] text-white"
                  : "text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <span className={isActive ? "text-[#00B894]" : ""}>{item.icon}</span>
              {item.label}
              {item.label === "AI Invoice" && (
                <span className="ml-auto px-1.5 py-0.5 rounded-md bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] text-[10px] font-semibold">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
            <span className="text-xs text-[rgba(255,255,255,0.6)]">HashKey Testnet</span>
          </div>
          <p className="text-[10px] text-[rgba(255,255,255,0.35)]">Chain ID: 133</p>
        </div>
      </div>
    </aside>
  );
}

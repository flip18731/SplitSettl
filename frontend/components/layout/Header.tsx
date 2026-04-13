"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/invoice", label: "Invoices" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="h-14 border-b border-border bg-bg-primary sticky top-0 z-50 flex items-center justify-between px-8">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-10">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0 select-none">
          <span className="text-[17px] font-bold text-accent-teal">Split</span>
          <span className="text-[17px] font-bold text-accent-orange">Settl</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-4 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-accent-teal rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Wallet */}
      <WalletConnect />
    </header>
  );
}

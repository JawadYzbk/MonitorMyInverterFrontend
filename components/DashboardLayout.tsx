"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Zap, LogOut, RefreshCw } from "lucide-react";

const NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "History", href: "/archive" },
  { label: "Network", href: "/network" },
  { label: "Settings", href: "/terminal" },
];

function useUpdatedAgo(timestamp?: string) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return null;
  const ms = now - Date.parse(timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`);
  if (Number.isNaN(ms)) return null;
  const min = Math.max(0, Math.round(ms / 60000));
  return min < 1 ? "just now" : min < 60 ? `${min} min ago` : `${Math.round(min / 60)} h ago`;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshing, fetchTelemetry, logout, data, history } = useAuth();
  const pathname = usePathname();
  const updatedAgo = useUpdatedAgo(history[0]?.timestamp);

  if (!isAuthenticated && pathname !== "/") {
    return null; // AuthProvider will redirect
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  const online = data?.status === "Online";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <Zap className="h-4 w-4" />
            </span>
            <span className="hidden text-sm font-semibold sm:inline">Pi Q6 Monitor</span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Main">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <span className="hidden items-center gap-2 pr-2 text-xs text-zinc-400 md:flex">
              <span className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-zinc-600"}`} />
              {online ? "Live" : "Offline"}
              {updatedAgo && <span className="text-zinc-500">· {updatedAgo}</span>}
            </span>
            <button
              onClick={() => fetchTelemetry()}
              disabled={refreshing}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50 cursor-pointer"
              aria-label="Refresh now"
              title="Refresh now"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400 cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl overflow-x-clip px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

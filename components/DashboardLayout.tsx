"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Cpu, LayoutDashboard, History as HistoryIcon, 
  Globe, Settings as SettingsIcon, LogOut, RefreshCw, ChevronRight 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshing, fetchTelemetry, logout, username } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated && pathname !== "/") {
    return null; // AuthProvider will redirect
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden">
      {/* GLOBAL SIDEBAR */}
      <aside className="w-20 border-r border-white/5 bg-card/50 hidden lg:flex flex-col items-center py-8 gap-10 backdrop-blur-xl z-20">
        <Link href="/dashboard" className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-2xl border border-primary/20 glow-primary cursor-pointer hover:bg-primary/20 transition-all">
          <Cpu className="h-6 w-6 text-primary" />
        </Link>
        
        <nav className="flex-1 flex flex-col gap-4">
          {[
            { icon: LayoutDashboard, href: "/dashboard" },
            { icon: HistoryIcon, href: "/archive" },
            { icon: Globe, href: "/network" },
            { icon: SettingsIcon, href: "/terminal" }
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all cursor-pointer group ${pathname === item.href ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse mx-auto" />
          <button onClick={logout} className="h-12 w-12 flex items-center justify-center rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* COMMAND CENTER */}
      <main className="flex-1 flex flex-col h-screen relative">
        <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* TOP STATUS BAR */}
        <header className="h-20 border-b border-white/5 bg-card/30 flex items-center justify-between px-10 backdrop-blur-md z-10">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">Shine<span className="text-primary">OS</span></h1>
              <p className="text-[9px] font-bold text-primary/50 uppercase tracking-[0.2em]">Command Console 01</p>
            </div>
            <div className="h-8 w-[1px] bg-white/5 hidden md:block" />
            <div className="hidden md:flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Network Status</span>
                <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Node</span>
                <span className="text-[11px] font-bold text-white">SATELLITE-A42</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => fetchTelemetry()} disabled={refreshing} variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] gap-2 transition-all cursor-pointer">
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Sync Node
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {username.substring(0, 2) || "AD"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

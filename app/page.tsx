"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShieldAlert, Cpu, ChevronRight, Lock, User, 
  Fingerprint, ShieldCheck, Key 
} from "lucide-react";

export default function LoginPage() {
  const [localUser, setLocalUser] = useState("");
  const [localPass, setLocalPass] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(localUser, localPass, rememberMe);
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden font-sans">
      {/* LEFT PANE: BRAND & VISUALS */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(34,197,94,0.1),_transparent_70%)]" />
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(34,197,94,0.1) 1px, rgba(34,197,94,0.1) 2px)`, backgroundSize: `100% 4px` }} />
        
        <div className="z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 glow-primary">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">Shine<span className="text-primary">OS</span></h1>
          </div>
        </div>

        <div className="z-10 max-w-lg space-y-6">
          <h2 className="text-6xl font-bold tracking-tighter text-white uppercase leading-none">
            Security <br /> <span className="text-primary italic">Gateway</span>
          </h2>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Establishing a secure quantum-encrypted tunnel to the solar telemetry grid. Authorized node access only.
          </p>
          <div className="flex gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol</p>
              <p className="text-white font-mono text-sm">TLS_AES_256_GCM</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Uptime</p>
              <p className="text-white font-mono text-sm">99.998%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Status</p>
              <p className="text-white font-mono text-sm">SECURE</p>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center gap-4 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em]">
          <span>System Terminal 4.2.1</span>
          <div className="h-1 w-1 rounded-full bg-white/20" />
          <span>Sector 7G Monitoring</span>
        </div>

        {/* DECORATIVE ELEMENTS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* RIGHT PANE: LOGIN FORM */}
      <div className="w-full lg:w-[550px] bg-black border-l border-white/5 flex flex-col items-center justify-center p-8 lg:p-16 relative">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-10 z-10">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security Checkpoint
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white uppercase italic">Initialize <span className="text-primary">Tunnel</span></h3>
            <p className="text-muted-foreground text-sm font-medium">Verify your credentials to establish a node handshake.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <p className="text-[11px] font-bold text-destructive uppercase tracking-widest leading-none">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2 group">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors">Identity Reference</label>
                  <User className="h-3 w-3 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  placeholder="Enter Access Identity"
                  className="h-14 border-white/10 bg-white/5 text-white placeholder:text-muted-foreground/20 focus:border-primary/50 transition-all outline-none rounded-xl"
                  value={localUser}
                  onChange={(e) => setLocalUser(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors">Security Token</label>
                  <Key className="h-3 w-3 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  className="h-14 border-white/10 bg-white/5 text-white placeholder:text-muted-foreground/20 focus:border-primary/50 transition-all outline-none rounded-xl"
                  value={localPass}
                  onChange={(e) => setLocalPass(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(!!checked)} className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer rounded-md h-5 w-5" />
                <label htmlFor="remember" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-white transition-colors">Retain Access Tunnel</label>
              </div>
              <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-primary/70 transition-colors">Forgot Key?</button>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] transition-all cursor-pointer shadow-xl shadow-primary/20 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <span className="relative flex items-center justify-center gap-3">
                {loading ? "Establishing Link..." : <>Open Secure Gate <ChevronRight className="h-4 w-4" /></>}
              </span>
            </Button>
          </form>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-6">
              <Fingerprint className="h-6 w-6 text-muted-foreground/20" />
              <div className="h-6 w-[1px] bg-white/5" />
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] text-center max-w-[200px]">
                Multifactor authentication enabled for internal grid nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

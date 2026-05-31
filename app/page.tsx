"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShieldAlert, ChevronRight, Lock, User, 
  Fingerprint, ShieldCheck, Key, Sun, Zap, 
  BatteryCharging, Leaf, Activity, BarChart3, 
  RefreshCw, Radio, Sparkles
} from "lucide-react";

export default function LoginPage() {
  const [localUser, setLocalUser] = useState("");
  const [localPass, setLocalPass] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const { login, loading, error } = useAuth();

  // Dynamic Telemetry States (Simulating real-time solar inverter data)
  const [irradiance, setIrradiance] = useState(842);
  const [generation, setGeneration] = useState(4.18);
  const [co2Saved, setCo2Saved] = useState(12854.12);
  const [batteryPercent, setBatteryPercent] = useState(92);
  const [systemAlerts, setSystemAlerts] = useState(0);

  // Simulated real-time sensor loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuating light levels (Irradiance)
      setIrradiance(prev => {
        const delta = (Math.random() - 0.5) * 6;
        const next = prev + delta;
        return Math.round(Math.max(810, Math.min(880, next)));
      });

      // Generation power output tracking irradiance
      setGeneration(prev => {
        const delta = (Math.random() - 0.5) * 0.04;
        const next = prev + delta;
        return parseFloat(Math.max(3.95, Math.min(4.35, next)).toFixed(3));
      });

      // Eco Carbon offset climbing
      setCo2Saved(prev => prev + 0.015);

      // Battery charging slowly
      setBatteryPercent(prev => {
        if (prev >= 99) return 90; // reset loop
        return prev + (Math.random() > 0.6 ? 1 : 0);
      });
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(localUser, localPass, rememberMe);
  };

  // UI Interactive Charge Level based on form completion
  const getChargeLevel = () => {
    let level = 0;
    if (localUser.trim().length > 0) level += 40;
    if (localPass.trim().length > 0) level += 40;
    if (rememberMe) level += 20;
    return level;
  };

  const chargeLevel = getChargeLevel();

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-950 via-[#030712] to-black overflow-hidden font-sans select-none text-white relative">
      
      {/* BACKGROUND FLOATING LIGHT AURORAS */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-aurora-glow" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-aurora-glow" style={{ animationDelay: "-4s" }} />

      {/* LEFT PANE: SOLAR REACTOR & TELEMETRY INTERACTIVE PANEL */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 bg-slate-950/20 backdrop-blur-[2px]">
        
        {/* Photovoltaic cells micro grid canvas overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pvGrid" width="60" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(25 0 0)">
                <path d="M 60 0 L 0 0 0 40" fill="none" stroke="rgba(251, 191, 36, 0.25)" strokeWidth="1" />
                <rect width="56" height="36" x="2" y="2" fill="rgba(8, 10, 20, 0.1)" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
                <line x1="2" y1="2" x2="58" y2="38" stroke="rgba(251, 191, 36, 0.05)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pvGrid)" />
          </svg>
        </div>

        {/* Dynamic Electric Circuit Flow Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="solarLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Animated Electron Paths along solar grid lines */}
            <path d="M 100 120 L 300 120 L 300 400 L 500 400" fill="none" stroke="url(#solarLineGradient)" strokeWidth="2.5" className="electron-flow-line" />
            <path d="M 50 500 L 250 500 L 350 650 L 700 650" fill="none" stroke="url(#solarLineGradient)" strokeWidth="2" className="electron-flow-line" style={{ animationDelay: "-3s" }} />
            <path d="M 400 150 L 550 250 L 750 250" fill="none" stroke="url(#solarLineGradient)" strokeWidth="1.5" className="electron-flow-line" style={{ animationDelay: "-6s" }} />
          </svg>
        </div>

        {/* HEADER BRANDING */}
        <div className="z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 flex items-center justify-center bg-[conic-gradient(from_0deg,#f59e0b,#10b981,#f59e0b)] rounded-2xl p-[1.5px] glow-amber shadow-2xl transition-transform hover:scale-105 duration-300">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sun className="h-5.5 w-5.5 text-amber-500 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                SHINE<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 font-extrabold italic ml-1">OS</span>
              </h1>
              <p className="text-[9px] font-bold text-emerald-400/70 tracking-[0.25em] uppercase">Photovoltaic Grid Control</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse glow-emerald" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Telemetry Link Live</span>
          </div>
        </div>

        {/* ANIMATED SOLAR CORE (SUN REACTOR ENGINE) */}
        <div className="z-10 flex-1 flex flex-col items-center justify-center py-6 relative">
          
          {/* Reactor Rings Container */}
          <div className="relative w-[340px] h-[340px] flex items-center justify-center">
            
            {/* Outer Orbital Grid Rings */}
            <div className="absolute w-[360px] h-[360px] border border-white/5 rounded-full z-0" />
            <div className="absolute w-[300px] h-[300px] border border-dashed border-amber-500/10 rounded-full animate-solar-spin z-0" />
            <div className="absolute w-[240px] h-[240px] border border-emerald-500/10 rounded-full animate-solar-spin-reverse z-0" />

            {/* Glowing Tech Nodes on Orbits */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[340px] w-1.5 flex flex-col justify-between items-center z-10 animate-solar-spin">
              <div className="h-2 w-2 rounded-full bg-amber-400 glow-amber" />
              <div className="h-2 w-2 rounded-full bg-emerald-400 glow-emerald" />
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 w-[340px] flex justify-between items-center z-10 animate-solar-spin-reverse" style={{ animationDuration: "25s" }}>
              <div className="h-2 w-2 rounded-full bg-amber-500 glow-amber" />
              <div className="h-2 w-2 rounded-full bg-emerald-500 glow-emerald" />
            </div>

            {/* Multi-layered Vector Sun Core Core */}
            <div className="relative w-[150px] h-[150px] rounded-full flex items-center justify-center z-10">
              
              {/* Outer Corona Core Blur */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 rounded-full opacity-30 animate-solar-pulse blur-[24px]" />
              
              {/* Spinning Solar Core Corona Rays */}
              <svg className="absolute w-[180px] h-[180px] animate-solar-spin pointer-events-none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 8 }).map((_, i) => (
                  <path 
                    key={i} 
                    d="M 50 10 L 53 45 L 47 45 Z" 
                    fill="url(#rayGrad)" 
                    transform={`rotate(${i * 45} 50 50)`} 
                    className="origin-center animate-ray-shimmer"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </svg>

              {/* Reactor Core Central Sphere */}
              <div className="absolute w-[110px] h-[110px] rounded-full bg-slate-950 border-2 border-amber-500/40 flex items-center justify-center p-1 overflow-hidden glow-amber animate-solar-pulse">
                
                {/* Simulated Solar Waves inside the sphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-transparent to-emerald-500/20 z-0" />
                <div className="absolute bottom-[-10%] w-[150%] h-[60%] bg-emerald-500/10 rounded-[45%] animate-[spin_10s_linear_infinite]" />
                <div className="absolute bottom-[-15%] w-[150%] h-[70%] bg-amber-500/20 rounded-[40%] animate-[spin_7s_linear_infinite_reverse]" />

                <div className="z-10 flex flex-col items-center justify-center select-none text-center">
                  <Zap className="h-7 w-7 text-amber-400 animate-bounce" />
                  <p className="text-[8px] font-extrabold uppercase tracking-widest text-amber-300/80 mt-1">Grid Core</p>
                  <p className="text-[12px] font-mono font-extrabold text-white mt-0.5">{generation} MW</p>
                </div>
              </div>

            </div>

          </div>

          <div className="text-center mt-6 max-w-sm px-4">
            <h4 className="text-lg font-bold tracking-tight text-white uppercase italic">Grid Telemetry <span className="text-amber-500">Gateway</span></h4>
            <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
              Harvesting renewable solar irradiance and mapping localized power distribution modules with quantum secure protocols.
            </p>
          </div>

        </div>

        {/* TELEMETRY READOUT CARDS */}
        <div className="z-10 grid grid-cols-2 gap-4">
          
          <div className="solar-glass-card p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-amber-500/5 rounded-full blur-[10px] pointer-events-none" />
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Sun className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Solar Irradiance</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono tracking-tight text-white">{irradiance}</span>
                <span className="text-[10px] font-bold text-slate-500">W/m²</span>
              </div>
            </div>
          </div>

          <div className="solar-glass-card-green p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-emerald-500/5 rounded-full blur-[10px] pointer-events-none" />
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inverter Yield</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono tracking-tight text-white">{generation}</span>
                <span className="text-[10px] font-bold text-slate-500">MW</span>
              </div>
            </div>
          </div>

          <div className="solar-glass-card-green p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-emerald-500/5 rounded-full blur-[10px] pointer-events-none" />
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Leaf className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Carbon Offset</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-bold font-mono tracking-tight text-white truncate max-w-[90px]">
                  {co2Saved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] font-bold text-slate-500">KG CO₂</span>
              </div>
            </div>
          </div>

          <div className="solar-glass-card p-4 rounded-2xl flex items-center gap-3.5 relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
            <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-amber-500/5 rounded-full blur-[10px] pointer-events-none" />
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <BatteryCharging className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Storage Status</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono tracking-tight text-white">{batteryPercent}%</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Active</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT PANE: GLASSMORPHIC LOGIN FORM CARD */}
      <div className="w-full lg:w-[560px] flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Header Branding (Visible only on mobile/tablet) */}
        <div className="lg:hidden flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 flex items-center justify-center bg-[conic-gradient(from_0deg,#f59e0b,#10b981,#f59e0b)] rounded-2xl p-[1.5px] glow-amber shadow-2xl mb-3">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sun className="h-6 w-6 text-amber-500 animate-[spin_12s_linear_infinite]" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase italic">
            Shine<span className="text-amber-500">OS</span>
          </h2>
          <p className="text-[10px] font-bold text-emerald-400/80 tracking-[0.3em] uppercase mt-1">Solar Grid Telemetry Gateway</p>
        </div>

        {/* Floating Form Shell */}
        <div className="w-full max-w-md solar-glass-card rounded-[32px] p-8 md:p-10 border border-white/5 relative overflow-hidden shadow-2xl">
          
          {/* Top dynamic charge progress bar (Tactile design feedback) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-700 ease-out glow-amber relative"
              style={{ width: `${chargeLevel}%` }}
            >
              {chargeLevel > 0 && (
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_1.5s_infinite] translate-x-[-100%]" style={{ backgroundSize: '200% 100%' }} />
              )}
            </div>
          </div>

          <div className="space-y-8">
            
            {/* Header Content */}
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2 select-none">
                {chargeLevel === 100 ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                    <span>Grid Connection Primed</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    <span>Establishing Link: {chargeLevel}% Charged</span>
                  </>
                )}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white uppercase italic">
                Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 font-extrabold">Handshake</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold">
                Provide certified credentials to establish an encrypted solar node link.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex items-center gap-3.5 animate-in fade-in zoom-in-95 duration-300">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Authentication Denied</p>
                  <p className="text-[11px] font-semibold text-slate-300 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-5">
                
                {/* Username Input Container */}
                <div className="space-y-2 group relative">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-amber-400 transition-colors">Access Identifier</label>
                    <User className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Enter operational ID"
                      className="h-13 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 transition-all rounded-xl pl-4 pr-10"
                      value={localUser}
                      onChange={(e) => setLocalUser(e.target.value)}
                    />
                    {localUser.trim().length > 0 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-400 glow-amber animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Password Input Container */}
                <div className="space-y-2 group relative">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-emerald-400 transition-colors">Security Code</label>
                    <Lock className="h-3.5 w-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      className="h-13 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all rounded-xl pl-4 pr-10"
                      value={localPass}
                      onChange={(e) => setLocalPass(e.target.value)}
                    />
                    {localPass.trim().length > 0 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-400 glow-emerald animate-pulse" />
                    )}
                  </div>
                </div>

              </div>

              {/* Remember tunnel & Forgot keys */}
              <div className="flex items-center justify-between text-xs pt-1 select-none">
                <div className="flex items-center space-x-2.5">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(!!checked)} 
                    className="border-white/10 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black border rounded-md h-4.5 w-4.5 cursor-pointer transition-all focus-visible:ring-emerald-500/20" 
                  />
                  <label htmlFor="remember" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Retain Tunnel</label>
                </div>
                <button type="button" className="text-[9px] font-bold text-amber-400 uppercase tracking-widest hover:text-amber-300 transition-colors">Refactor Keys?</button>
              </div>

              {/* Submit Activation Button */}
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-15 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:via-orange-400 hover:to-emerald-400 text-black font-extrabold uppercase tracking-[0.22em] text-xs transition-all cursor-pointer shadow-xl shadow-amber-500/10 rounded-2xl relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Moving glare animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-black" />
                      <span>Syncing Grid Nodes...</span>
                    </>
                  ) : (
                    <>
                      <span>Establish Operational Link</span>
                      <ChevronRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

            </form>

            {/* Multifactor terminal message */}
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-center gap-5">
                <Fingerprint className="h-5.5 w-5.5 text-slate-600 animate-pulse shrink-0" />
                <div className="h-5 w-[1px] bg-white/5" />
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.25em] leading-relaxed max-w-[220px]">
                  Internal grid protocol enforced. Double handshake node mapping certified by ShineOS authority.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footprint system metadata */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            System Node: Sector 7G // Core Terminal 4.5
          </p>
        </div>

      </div>

    </div>
  );
}

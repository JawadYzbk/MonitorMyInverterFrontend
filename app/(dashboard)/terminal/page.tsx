"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Slider from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Settings as SettingsIcon, CheckCircle2, Globe, Cpu, 
  Terminal as TerminalIcon, ShieldAlert, Activity, 
  Zap, Database, Lock, Unlock, RefreshCw
} from "lucide-react";

export default function TerminalPage() {
  const { 
    warningThreshold, 
    setWarningThreshold, 
    devices, 
    selectDevice, 
    history,
    refreshing,
    fetchTelemetry
  } = useAuth();
  
  const [localThreshold, setLocalThreshold] = React.useState(warningThreshold ?? 0);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isOverrideActive, setIsOverrideActive] = React.useState(false);

  // Sync local state
  React.useEffect(() => {
    setLocalThreshold(warningThreshold ?? 0);
  }, [warningThreshold]);

  const handleSave = () => {
    setWarningThreshold(localThreshold);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Generate matrix data for the heatmap
  const matrixData = React.useMemo(() => {
    // Fill a 10x5 grid with recent history or placeholders
    const data = [...history].slice(0, 50);
    const grid = [];
    for (let i = 0; i < 5; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        const index = i * 10 + j;
        row.push(data[index] || null);
      }
      grid.push(row);
    }
    return grid;
  }, [history]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700 relative">
      {/* Scanline Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(rgba(0,0,0,0)_0px,rgba(0,0,0,0)_1px,rgba(0,255,0,0.5)_2px,rgba(0,0,0,0)_3px)] bg-[length:100%_4px]" />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/20 pb-6 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 border border-primary/20 rounded shadow-[0_0_10px_rgba(34,197,94,0.2)]">
              <TerminalIcon className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-mono">
              System <span className="text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">Terminal</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] bg-primary/5 px-2 py-0.5 border border-primary/10">Root Access Granted</span>
            <div className="h-1 w-24 bg-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary animate-[shimmer_2s_infinite] w-1/2" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchTelemetry()}
            className="border-primary/20 text-primary hover:bg-primary/10 font-mono text-[10px] uppercase tracking-widest cursor-pointer group"
          >
            <RefreshCw className={`mr-2 h-3 w-3 ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            Refresh Stream
          </Button>
          <div className="text-right font-mono">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Global Timestamp</p>
            <p className="text-xs font-bold text-white">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Matrix */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Control Panel */}
          <Card className="bg-slate-950/50 border-primary/20 overflow-hidden relative group transition-all hover:border-primary/40 shadow-2xl shadow-primary/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <ShieldAlert className="h-24 w-24 text-primary" />
            </div>
            
            <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold tracking-[0.2em] text-white uppercase font-mono">System Override Matrix</CardTitle>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Core Threshold Modulation</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsOverrideActive(!isOverrideActive)}
                  className={`text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 border-2 ${
                    isOverrideActive 
                      ? "text-primary border-primary bg-primary/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                      : "text-muted-foreground border-white/10 hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {isOverrideActive ? <Unlock className="mr-2 h-3 w-3" /> : <Lock className="mr-2 h-3 w-3" />}
                  {isOverrideActive ? "Override Active" : "Click to Unlock"}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap className="h-3 w-3" /> 
                      Emergency Threshold
                    </label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-mono">
                      Define the critical depletion limit. Falling below this value triggers global protocol termination.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <Slider 
                      disabled={!isOverrideActive}
                      value={[localThreshold]} 
                      max={100} 
                      step={1} 
                      onValueChange={(val: number | number[]) => {
                        const numericVal = Array.isArray(val) ? val[0] : val;
                        if (typeof numericVal === "number" && !isNaN(numericVal)) {
                          setLocalThreshold(numericVal);
                        }
                      }}
                      className={`cursor-pointer ${!isOverrideActive && "opacity-20 grayscale"}`}
                    />
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/10 font-mono">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Buffer</span>
                      <div className="flex items-center gap-1">
                        <Input 
                          type="number"
                          disabled={!isOverrideActive}
                          value={localThreshold}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              setLocalThreshold(Math.max(0, Math.min(100, val)));
                            } else if (e.target.value === "") {
                              setLocalThreshold(0);
                            }
                          }}
                          className="w-16 h-8 bg-transparent border-none text-2xl font-black text-primary p-0 text-right focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-2xl font-black text-primary drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/10 rounded-lg relative overflow-hidden group/viz">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)] opacity-0 group-hover/viz:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 text-center space-y-2">
                    <div className="text-6xl font-black text-white tracking-tighter mb-2 italic">
                      {localThreshold}
                      <span className="text-xl text-primary/40 not-italic ml-1">%</span>
                    </div>
                    <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden mx-auto border border-white/5">
                      <div className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ width: `${localThreshold}%` }} />
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-4">Safety Margin Index</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <Button 
                  variant="ghost" 
                  onClick={() => setLocalThreshold(warningThreshold)}
                  disabled={!isOverrideActive || refreshing}
                  className="font-bold uppercase tracking-widest text-[10px] h-10 px-6 cursor-pointer opacity-50 hover:opacity-100"
                >
                  Revert
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isOverrideActive || refreshing}
                  className={`font-mono font-bold uppercase tracking-[0.2em] text-[10px] h-10 px-8 transition-all cursor-pointer border shadow-lg ${
                    isSaved 
                      ? "bg-green-500 text-white border-green-400 shadow-green-500/20" 
                      : "bg-primary text-primary-foreground border-primary shadow-primary/20 hover:scale-105"
                  } ${(!isOverrideActive || refreshing) && "opacity-20 grayscale cursor-not-allowed"}`}
                >
                  {isSaved ? (
                    <><CheckCircle2 className="mr-3 h-4 w-4" /> Protocol Updated</>
                  ) : (
                    <><Database className="mr-3 h-4 w-4" /> Commit Override</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Matrix Heatmap Grid */}
          <Card className="bg-slate-950/50 border-white/10 overflow-hidden group hover:border-primary/20 transition-all">
            <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Telemetry Intensity Matrix</CardTitle>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Real-time Batch Scan</span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-10 gap-2">
                {matrixData.flat().map((log, i) => {
                  const intensity = log ? Math.min((log.loadPower / 3000) * 100, 100) : 0;
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-sm transition-all duration-500 group/cell relative ${
                        log 
                          ? "bg-primary/20 border border-primary/20 hover:scale-110 hover:z-10 hover:bg-primary/40 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                          : "bg-white/5 border border-white/5"
                      }`}
                      style={log ? { opacity: 0.3 + (intensity / 100) * 0.7 } : {}}
                    >
                      {log && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity z-20 pointer-events-none">
                          <div className="bg-black/90 border border-primary/40 p-2 rounded shadow-2xl text-[8px] font-mono whitespace-nowrap -translate-y-8">
                            <p className="text-primary font-bold">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            <p className="text-white">{log.loadPower}W | {log.batteryCapacity}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Low Intensity</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/20 rounded-sm" />
                    <div className="w-2 h-2 bg-primary/50 rounded-sm" />
                    <div className="w-2 h-2 bg-primary rounded-sm" />
                  </div>
                  <span>High Intensity</span>
                </div>
                <span>50 Node Sample</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Node Management & Logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Node Selector */}
          <Card className="bg-slate-950/50 border-white/10 overflow-hidden">
            <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Mesh Node Network</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {devices.map((device) => (
                <div 
                  key={device.serial_number}
                  onClick={() => selectDevice(device.serial_number)}
                  className={`p-3 rounded border transition-all cursor-pointer group relative overflow-hidden ${
                    device.is_selected 
                      ? "bg-primary/10 border-primary/50 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2 rounded ${device.is_selected ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-white/10 text-muted-foreground group-hover:text-white transition-colors"}`}>
                      <Cpu className="h-3 w-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-white uppercase tracking-wider">{device.alias}</p>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest group-hover:text-primary/60 transition-colors">{device.serial_number}</p>
                    </div>
                    {device.is_selected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  {device.is_selected && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-full shadow-[0_0_10px_rgba(34,197,94,1)]" />
                  )}
                </div>
              ))}
              {devices.length === 0 && (
                <div className="text-center py-8 space-y-3 opacity-30">
                  <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">No Active Nodes Detected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="bg-slate-950/50 border-white/10 overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-primary" />
              <CardTitle className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Command Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[9px]">
                {history.slice(0, 15).map((log, i) => (
                  <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-1" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="text-primary/40 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
                    <span className="text-white/80 leading-tight">
                      <span className="text-indigo-400">TELEMETRY_RX</span> node_id:{log.id} load:{log.loadPower}W cap:{log.batteryCapacity}% 
                      <span className="text-primary/60"> [OK]</span>
                    </span>
                  </div>
                ))}
                {isSaved && (
                  <div className="flex gap-3 text-green-400 animate-pulse font-bold">
                    <span>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                    <span>PROTOCOL_OVERRIDE_COMMIT_SUCCESS: THRESHOLD={localThreshold}%</span>
                  </div>
                )}
                {history.length === 0 && (
                  <div className="text-muted-foreground/30 italic text-center py-12">Initializing stream listener...</div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

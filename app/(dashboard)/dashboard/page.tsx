"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, BatteryCharging, Sun, Activity, AlertTriangle, 
  ArrowUpRight, ChevronRight, Terminal 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from "recharts";

export default function DashboardPage() {
  const { data, history, warningThreshold } = useAuth();
  const [isAlertAcknowledged, setIsAlertAcknowledged] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState("4h"); // Default to 4h

  // Prepare chart data from history based on selected time range
  const chartData = React.useMemo(() => {
    if (!history || history.length === 0) return [];

    // Use the latest log timestamp as reference to ensure data is visible even if stale
    const referenceTime = new Date(history[0].timestamp).getTime();
    let filterMs = 5 * 60 * 1000; // Default 5 mins

    switch (timeRange) {
      case "1m": filterMs = 1 * 60 * 1000; break;
      case "5m": filterMs = 5 * 60 * 1000; break;
      case "30m": filterMs = 30 * 60 * 1000; break;
      case "1h": filterMs = 60 * 60 * 1000; break;
      case "4h": filterMs = 4 * 60 * 60 * 1000; break;
      case "all": filterMs = Infinity; break;
    }

    return [...history]
      .filter(log => {
        if (filterMs === Infinity) return true;
        // Backend provides ISO strings, ensure they are treated as UTC if no offset is present
        const logTime = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').getTime();
        return (referenceTime - logTime) <= filterMs;
      })
      .reverse()
      .map(log => {
        const date = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
        return {
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: timeRange === "1m" || timeRange === "5m" ? '2-digit' : undefined 
          }),
          load: log.loadPower,
          battery: log.batteryCapacity,
          pv: log.pvInputPower || 0
        };
      });
  }, [history, timeRange]);

  // Reset acknowledgement if battery goes above threshold then back down
  React.useEffect(() => {
    if (data && data.batteryCapacity >= warningThreshold) {
      setIsAlertAcknowledged(false);
    }
  }, [data?.batteryCapacity, warningThreshold]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">Intelligence <span className="text-primary">Stage</span></h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Telemetry Processing</span>
            <ChevronRight className="h-3 w-3 text-primary" />
          </div>
        </div>
      </div>

      {data && data.batteryCapacity < warningThreshold && !isAlertAcknowledged && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">Protocol Breach</p>
              <p className="text-sm font-medium text-white">Critical Battery Depletion: {data.batteryCapacity}% reserves remaining.</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => setIsAlertAcknowledged(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            Acknowledge
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* STAGE: MAIN VISUALIZATION */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/20 border-white/5 border-dashed h-[480px] relative overflow-hidden flex flex-col p-6 group hover:bg-card/30 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.5em]">Live Power Analysis</span>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">Load vs Solar Harvest (W)</p>
              </div>
              
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                {["1m", "5m", "30m", "1h", "4h"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all duration-300 relative ${
                      timeRange === range 
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-105" 
                        : "text-muted-foreground hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {range}
                    {timeRange === range && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full blur-[1px]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tighter text-white">{data?.loadPower || 0}</span>
                <span className="text-sm font-bold text-muted-foreground/30 uppercase tracking-tighter">Watts</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} key={timeRange}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #22c55e)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary, #22c55e)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={timeRange === "1m" || timeRange === "5m" ? 30 : 60}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `${value}W`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #ffffff10", borderRadius: "8px", fontSize: "10px" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#22c55e" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="pv" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPV)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex items-center gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Load Power</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Solar Intake</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/40 border-white/5 p-6 overflow-hidden group/battery transition-all hover:border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Battery History</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{data?.batteryCapacity}% AVG</span>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} key={timeRange}>
                    <XAxis dataKey="time" hide />
                    <Tooltip 
                      cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0a0a0a] border border-white/10 p-2 rounded-lg shadow-xl">
                              <p className="text-[8px] text-muted-foreground uppercase font-bold mb-1">{payload[0].payload.time}</p>
                              <p className="text-xs font-bold text-primary">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="battery" 
                      fill="#22c55e40" 
                      radius={[2, 2, 0, 0]} 
                      isAnimationActive={false}
                      className="transition-all duration-300 hover:fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-card/40 border-white/5 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Efficiency</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">98.2%</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Load Distribution</span>
                  <span className="text-lg font-bold text-white">{data?.loadPercent || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${data?.loadPercent || 0}%` }} />
                </div>
              </div>
            </Card>
          </div>

          {/* LIVE TERMINAL LOGS INTEGRATED */}
          <Card className="bg-card/40 border-white/5 overflow-hidden">
            <CardHeader className="py-3 px-6 border-b border-white/5 bg-white/[0.02] flex flex-row items-center gap-3">
              <Terminal className="h-4 w-4 text-primary" />
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Activity Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-40 overflow-y-auto p-4 font-mono text-[10px] space-y-2">
                {history.slice(0, 5).map((log, i) => {
                  const date = new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z');
                  return (
                    <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                      <span className="text-muted-foreground/40">[{date.toLocaleTimeString()}]</span>
                      <span className="text-primary font-bold">EVENT_TELEMETRY</span>
                      <span className="text-white">Load: {log.loadPower}W | Reserve: {log.batteryCapacity}% | Intake: {log.pvVoltage}V</span>
                    </div>
                  );
                })}
                {history.length === 0 && <div className="text-muted-foreground italic">Waiting for incoming telemetry stream...</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INSTRUMENTS CLUSTER */}
        <div className="space-y-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Instrument Cluster</p>
          
          {/* Battery Instrument */}
          <Card className="bg-card/40 border-white/5 p-6 hover:border-primary/20 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
            <div className="flex items-center justify-between mb-6">
              <div className={`p-2 rounded-lg ${data?.batteryCapacity && data.batteryCapacity < warningThreshold ? "bg-destructive/10 border border-destructive/20 text-destructive" : "bg-primary/10 border border-primary/20 text-primary"}`}>
                <BatteryCharging className="h-5 w-5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Energy Reserves</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${data?.batteryCapacity && data.batteryCapacity < warningThreshold ? "text-destructive" : "text-primary"}`}>
                  {data?.batteryCapacity && data.batteryCapacity < warningThreshold ? "BREACH DETECTED" : "NOMINAL"}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-5xl font-bold tracking-tighter text-white">{data?.batteryCapacity || 0}</span>
              <span className="text-xl font-bold text-muted-foreground/30 uppercase">%</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Potential</span>
                <span>{data?.batteryVoltage || 0}V</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${data?.batteryCapacity && data.batteryCapacity < warningThreshold ? "bg-destructive" : "bg-primary"}`} 
                     style={{ width: `${data?.batteryCapacity || 0}%` }} />
              </div>
            </div>
          </Card>

          {/* Detailed Matrix Instrument */}
          <Card className="bg-card/40 border-white/5 p-6 hover:border-indigo-500/20 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-500">
                <Zap className="h-5 w-5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Detailed Matrix</span>
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">LIVE CONVERSION</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">AC Input</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{data?.acInputVoltage || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">V</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">AC Output</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{data?.acOutputVoltage || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">V</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Frequency</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{data?.acOutputFrequency || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">Hz</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Load Matrix</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{data?.loadPercent || 0}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase">%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Solar Instrument */}
          <Card className="bg-card/40 border-white/5 p-6 hover:border-orange-500/20 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl group-hover:bg-orange-500/10 transition-all" />
            <div className="flex items-center justify-between mb-6">
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500">
                <Sun className="h-5 w-5" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Solar Intake</span>
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">ACTIVE HARVEST</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Potential</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tighter text-white">{data?.pvVoltage || 0}</span>
                  <span className="text-lg font-bold text-muted-foreground/30 uppercase">V</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Harvest</span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-4xl font-bold tracking-tighter text-white">{data?.pvInputPower || 0}</span>
                  <span className="text-lg font-bold text-muted-foreground/30 uppercase">W</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Status Card */}
          <Card className="bg-card/20 border-white/5 p-6 border-dashed flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Health</p>
                <p className="text-xs font-bold text-white uppercase">OPTIMAL</p>
              </div>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </Card>
        </div>
      </div>
    </div>
  );
}

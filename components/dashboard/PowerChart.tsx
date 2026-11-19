"use client";

import React from "react";
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export interface PowerPoint {
  timestamp: string;
  loadPower: number;
  pvInputPower?: number;
  batteryCapacity: number;
}

export const SERIES = {
  load: { label: "Load", color: "#a78bfa" },     // violet-400
  solar: { label: "Solar", color: "#fbbf24" },   // amber-400
  battery: { label: "Battery", color: "#34d399" }, // emerald-400
};

const RANGES = [
  { key: "1h", label: "1 h", ms: 3600_000 },
  { key: "2h", label: "2 h", ms: 2 * 3600_000 },
  { key: "4h", label: "4 h", ms: 4 * 3600_000 },
];

const toMs = (ts: string) => Date.parse(ts.endsWith("Z") ? ts : `${ts}Z`);
const timeLabel = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function PowerChart({ history }: { history: PowerPoint[] }) {
  const [range, setRange] = React.useState("2h");

  const data = React.useMemo(() => {
    if (!history.length) return [];
    const rangeMs = RANGES.find((r) => r.key === range)!.ms;
    const latest = Math.max(...history.map((h) => toMs(h.timestamp)));
    return history
      .map((h) => ({
        t: toMs(h.timestamp),
        load: h.loadPower ?? 0,
        solar: h.pvInputPower ?? 0,
        battery: h.batteryCapacity ?? 0,
      }))
      .filter((p) => latest - p.t <= rangeMs)
      .sort((a, b) => a.t - b.t);
  }, [history, range]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
          {Object.values(SERIES).map((s) => (
            <span key={s.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
              {s.label === "Battery" ? " %" : " W"}
            </span>
          ))}
        </div>
        <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                range === r.key ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">Waiting for data…</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -10 }}>
              <defs>
                {(["load", "solar"] as const).map((k) => (
                  <linearGradient key={k} id={`fill-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[k].color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SERIES[k].color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={timeLabel}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#71717a"
                minTickGap={40}
              />
              <YAxis
                yAxisId="w"
                tickFormatter={(v) => `${v}`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#71717a"
                unit=" W"
                width={60}
              />
              <YAxis
                yAxisId="pct"
                orientation="right"
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#71717a"
                width={40}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs shadow-xl">
                      <p className="mb-1 text-zinc-400">{timeLabel(Number(label))}</p>
                      {payload.map((p) => {
                        const key = p.dataKey as keyof typeof SERIES;
                        return (
                          <p key={key} className="flex items-center justify-between gap-6 text-zinc-100">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ background: SERIES[key].color }} />
                              {SERIES[key].label}
                            </span>
                            <span className="tabular-nums">
                              {Math.round(Number(p.value)).toLocaleString()}
                              {key === "battery" ? "%" : " W"}
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  ) : null
                }
              />
              <Area yAxisId="w" type="monotone" dataKey="solar" stroke={SERIES.solar.color} fill="url(#fill-solar)" strokeWidth={2} isAnimationActive={false} />
              <Area yAxisId="w" type="monotone" dataKey="load" stroke={SERIES.load.color} fill="url(#fill-load)" strokeWidth={2} isAnimationActive={false} />
              <Line yAxisId="pct" type="monotone" dataKey="battery" stroke={SERIES.battery.color} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  GRID_OFF_COLOR,
  GRID_ON_COLOR,
  HourBucket,
  NO_DATA_COLOR,
  formatHours,
  gridCellColor,
  hasData,
  onFraction,
  totalOnHours,
} from "@/lib/grid";

const hourLabel = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const dayLabel = (d: Date) => d.toLocaleDateString([], { weekday: "short" });

function minutes(seconds: number) {
  return Math.round(seconds / 60);
}

function describeHour(b: HourBucket) {
  const end = new Date(b.start.getTime() + 3600_000);
  const range = `${hourLabel(b.start)}–${hourLabel(end)}`;
  if (onFraction(b) === null) return `${range} · no data`;
  const on = minutes(b.on);
  const off = minutes(b.off);
  return `${range} · ${on} min on${off ? `, ${off} min off` : ""}`;
}

export function GridLegend() {
  const items = [
    { label: "Grid on", color: GRID_ON_COLOR },
    { label: "Grid off", color: GRID_OFF_COLOR },
    { label: "No data", color: NO_DATA_COLOR },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** Last 24 hours: one stacked bar per hour (minutes on / off / no data). */
export function GridDayChart({ buckets, now }: { buckets: HourBucket[]; now: number }) {
  const data = buckets.map((b, i) => {
    const on = minutes(b.on);
    const off = minutes(b.off);
    const isCurrent = i === buckets.length - 1;
    const elapsed = isCurrent ? Math.max(0, Math.min(60, Math.round((now - b.start.getTime()) / 60000))) : 60;
    return {
      label: hourLabel(b.start),
      on,
      off,
      none: Math.max(0, elapsed - on - off),
      text: describeHour(b),
    };
  });

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }} barCategoryGap={2}>
          <XAxis dataKey="label" interval={2} tickLine={false} axisLine={false} fontSize={11} stroke="#71717a" />
          <YAxis
            domain={[0, 60]}
            ticks={[0, 30, 60]}
            tickFormatter={(v) => `${v}m`}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            stroke="#71717a"
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 shadow-xl">
                  {(payload[0].payload as { text: string }).text}
                </div>
              ) : null
            }
          />
          <Bar dataKey="on" stackId="h" fill={GRID_ON_COLOR} isAnimationActive={false} />
          <Bar dataKey="off" stackId="h" fill={GRID_OFF_COLOR} isAnimationActive={false} />
          <Bar dataKey="none" stackId="h" fill={NO_DATA_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const HOUR_COLUMNS = { gridTemplateColumns: "repeat(24, minmax(0, 1fr))" };

/** Last 7 days, hour by hour: rows are days, columns are hours. */
export function GridWeekHeatmap({ days, now }: { days: HourBucket[][]; now: number }) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="grid min-w-[560px] grid-cols-[3.25rem_1fr_4.5rem] items-center gap-x-3 gap-y-1.5">
          {days.map((row, r) => {
            const isToday = r === days.length - 1;
            return (
              <React.Fragment key={r}>
                <span className={`text-xs ${isToday ? "font-semibold text-zinc-100" : "text-zinc-400"}`}>
                  {isToday ? "Today" : dayLabel(row[0].start)}
                </span>
                <div className="grid gap-[3px]" style={HOUR_COLUMNS}>
                  {row.map((b, i) => {
                    const future = b.start.getTime() > now;
                    const text = `${dayLabel(b.start)} ${describeHour(b)}`;
                    return (
                      <div
                        key={i}
                        title={future ? undefined : text}
                        onMouseEnter={() => !future && setHovered(text)}
                        onMouseLeave={() => setHovered(null)}
                        className={`h-5 rounded-[3px] ${future ? "border border-dashed border-zinc-800" : "transition-transform hover:scale-110"}`}
                        style={future ? undefined : { background: gridCellColor(b) }}
                      />
                    );
                  })}
                </div>
                <span className="text-right text-xs tabular-nums text-zinc-300">
                  {hasData(row) ? formatHours(totalOnHours(row)) : "—"}
                </span>
              </React.Fragment>
            );
          })}
          <span />
          <div className="grid text-[11px] text-zinc-500" style={HOUR_COLUMNS}>
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h}>{h % 3 === 0 ? String(h).padStart(2, "0") : ""}</span>
            ))}
          </div>
          <span className="text-right text-[11px] text-zinc-500">on / day</span>
        </div>
      </div>
      <p className="min-h-4 text-xs text-zinc-400" aria-live="polite">
        {hovered ?? "Hover a cell to see that hour."}
      </p>
    </div>
  );
}

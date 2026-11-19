"use client";

import React from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, Repeat, Target, TrendingDown, TrendingUp } from "lucide-react";
import { GRID_OFF_COLOR, GRID_ON_COLOR, GridForecast as Forecast, NO_DATA_COLOR, formatDuration, formatHours } from "@/lib/grid";

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

function dayWord(iso: string, now: number) {
  const d = new Date(iso).toDateString();
  if (d === new Date(now).toDateString()) return "";
  if (d === new Date(now + 86_400_000).toDateString()) return "tomorrow ";
  return `${new Date(iso).toLocaleDateString([], { weekday: "short" })} `;
}

const CONFIDENCE: Record<Forecast["confidence"], { label: string; color: string }> = {
  high: { label: "High confidence", color: "#34d399" },
  medium: { label: "Medium confidence", color: "#fbbf24" },
  low: { label: "Low confidence", color: "#f87171" },
  early: { label: "Early estimate", color: "#a1a1aa" },
};

function Headline({ f, now }: { f: Forecast; now: number }) {
  const p = f.prediction;
  if (!p) {
    return (
      <div>
        <p className="text-lg font-semibold text-zinc-100">No forecast right now</p>
        <p className="mt-1 text-sm text-zinc-400">
          {f.current ? "There aren't enough similar past days to predict the next change yet." : "Waiting for a live reading."}
        </p>
      </div>
    );
  }
  const goingOn = p.state === "on";
  const color = goingOn ? GRID_ON_COLOR : "#f87171";
  return (
    <div>
      {p.overdue ? (
        <p className="text-lg font-semibold text-zinc-100">
          {goingOn ? (
            <>Grid is <span style={{ color }}>overdue</span> — it&apos;s usually back by now</>
          ) : (
            <>Grid is <span style={{ color }}>usually off by now</span></>
          )}
        </p>
      ) : (
        <p className="text-lg font-semibold text-zinc-100">
          Grid expected {goingOn ? "back" : "to go off"} at{" "}
          <span className="tabular-nums" style={{ color }}>{dayWord(p.at, now)}{clock(p.at)}</span>
          <span className="ml-2 text-sm font-normal text-zinc-400">in {formatDuration(Date.parse(p.at) - now)}</span>
        </p>
      )}
      <p className="mt-1 text-sm text-zinc-400">
        Likely between {clock(p.earliest)} and {clock(p.latest)}
        {f.thenOn && (
          <> · then back around <span className="text-zinc-200">{dayWord(f.thenOn.at, now)}{clock(f.thenOn.at)}</span></>
        )}
      </p>
    </div>
  );
}

function Chip({ icon: Icon, children, title }: { icon: React.ElementType; children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-300">
      <Icon className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
      {children}
    </span>
  );
}

/** Next 24 hours as one strip of expected on/off blocks. */
function NextDayStrip({ f, now }: { f: Forecast; now: number }) {
  if (!f.upcoming.length) return null;
  const start = Date.parse(f.upcoming[0].start);
  const span = Date.parse(f.upcoming[f.upcoming.length - 1].end) - start;
  const ticks = Array.from({ length: 5 }, (_, i) => start + (span * i) / 4);
  const onBlocks = f.upcoming.filter((b) => b.state === "on");
  const color = (s: string) => (s === "on" ? GRID_ON_COLOR : s === "off" ? GRID_OFF_COLOR : NO_DATA_COLOR);
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Expected next 24 hours</h3>
      <div className="flex h-7 w-full overflow-hidden rounded-md">
        {f.upcoming.map((b, i) => (
          <div
            key={i}
            title={`${clock(b.start)}–${clock(b.end)} · ${b.state === "unknown" ? "no data" : `grid ${b.state}`}`}
            style={{ width: `${((Date.parse(b.end) - Date.parse(b.start)) / span) * 100}%`, background: color(b.state) }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
        {ticks.map((t, i) => (
          <span key={i}>{i === 0 ? "now" : clock(new Date(t).toISOString())}</span>
        ))}
      </div>
      {onBlocks.length > 0 && (
        <p className="mt-2 text-xs text-zinc-400">
          Grid expected:{" "}
          {onBlocks.map((b, i) => (
            <span key={i} className="text-zinc-200">
              {i > 0 && ", "}
              {dayWord(b.start, now)}{clock(b.start)}–{clock(b.end)}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

/** Chance of grid power for each hour of the day, learned from history. */
function UsualSchedule({ profile, nowHour }: { profile: (number | null)[]; nowHour: number }) {
  const data = profile.map((p, h) => ({
    hour: String(h).padStart(2, "0"),
    chance: p === null ? 0 : Math.round(p * 100),
    known: p !== null,
    h,
  }));
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Usual daily schedule · chance of grid each hour</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }} barCategoryGap={2}>
            <XAxis dataKey="hour" interval={2} tickLine={false} axisLine={false} fontSize={11} stroke="#71717a" />
            <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={11} stroke="#71717a" />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as { h: number; chance: number; known: boolean };
                return (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 shadow-xl">
                    {String(d.h).padStart(2, "0")}:00–{String((d.h + 1) % 24).padStart(2, "0")}:00 ·{" "}
                    {d.known ? `grid on ${d.chance}% of the time` : "no data yet"}
                  </div>
                );
              }}
            />
            <Bar dataKey="chance" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => (
                <Cell
                  key={d.h}
                  fill={d.known ? GRID_ON_COLOR : NO_DATA_COLOR}
                  fillOpacity={d.known ? 0.35 + 0.65 * (d.chance / 100) : 1}
                  stroke={d.h === nowHour ? "#f4f4f5" : undefined}
                  strokeWidth={d.h === nowHour ? 1.5 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-zinc-500">Outlined bar = current hour. Recent days count more.</p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 px-4 py-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function GridForecastPanel({ forecast: f, now }: { forecast: Forecast; now: number }) {
  if (f.status === "learning") {
    const pct = Math.min(100, Math.round((f.coverageHours / f.neededHours) * 100));
    return (
      <div className="space-y-3">
        <p className="text-lg font-semibold text-zinc-100">Learning your grid schedule…</p>
        <p className="text-sm text-zinc-400">
          The forecast starts after {f.neededHours} hours of readings. Collected so far: {f.coverageHours} hours.
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const conf = CONFIDENCE[f.confidence];
  const { stats } = f;
  const thisWeek = stats.hoursPerDayThisWeek;
  const lastWeek = stats.hoursPerDayLastWeek;
  const trend = thisWeek !== null && lastWeek !== null ? thisWeek - lastWeek : null;
  const matchPct = f.pattern.match !== undefined ? Math.round(f.pattern.match * 100) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Headline f={f} now={now} />
        <div className="flex flex-wrap gap-2">
          <Chip icon={Repeat} title="The repeat length that best matches your history">
            {f.pattern.label}
            {f.pattern.kind !== "none" && matchPct !== null && <span className="text-zinc-500">· {matchPct}% match</span>}
          </Chip>
          <Chip icon={Clock}>
            {f.method === "pattern" ? "Based on the repeating pattern" : "Based on how long cuts usually last"}
          </Chip>
          <Chip icon={Target} title="Checked against real past outages, predicting from the moment each one started">
            <span className="h-2 w-2 rounded-full" style={{ background: conf.color }} />
            {conf.label}
            {f.accuracy.medianErrorMinutes !== null && f.accuracy.tested > 0 && (
              <span className="text-zinc-500">
                · usually within {f.accuracy.medianErrorMinutes} min ({f.accuracy.tested} past cuts)
              </span>
            )}
          </Chip>
        </div>
      </div>

      <NextDayStrip f={f} now={now} />

      <UsualSchedule profile={f.profile} nowHour={new Date(now).getHours()} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Grid per day (this week)"
          value={thisWeek !== null ? formatHours(thisWeek) : "—"}
          hint={
            trend !== null && Math.abs(trend) >= 0.1 ? (
              <span className={`inline-flex items-center gap-1 ${trend > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatHours(Math.abs(trend))} vs last week
              </span>
            ) : lastWeek !== null ? "same as last week" : "no data for last week yet"
          }
        />
        <Stat label="Typical cut length" value={stats.medianOutageMinutes !== null ? formatDuration(stats.medianOutageMinutes * 60_000) : "—"} />
        <Stat label="Typical on period" value={stats.medianOnMinutes !== null ? formatDuration(stats.medianOnMinutes * 60_000) : "—"} />
        <Stat label="Cuts per day" value={stats.cutsPerDay ?? "—"} hint="last 7 days" />
      </div>
    </div>
  );
}

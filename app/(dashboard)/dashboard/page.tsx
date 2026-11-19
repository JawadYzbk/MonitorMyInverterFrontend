"use client";

import React from "react";
import { getApiUrl, useAuth } from "@/context/AuthContext";
import { AlertTriangle, BatteryCharging, BatteryMedium, PlugZap, Sun, Gauge, X } from "lucide-react";
import PowerChart from "@/components/dashboard/PowerChart";
import { GridDayChart, GridLegend, GridWeekHeatmap } from "@/components/dashboard/GridCharts";
import GridForecastPanel from "@/components/dashboard/GridForecast";
import {
  useGridForecast,
  countOutages,
  formatDuration,
  formatHours,
  hasData,
  last24Hours,
  last7Days,
  totalOnHours,
  useGridHistory,
} from "@/lib/grid";

// Keep in sync with GRID_ON_VOLTAGE in the backend (used until /api/grid answers).
const DEFAULT_GRID_ON_VOLTAGE = 100;

const fmtW = (v?: number) => `${Math.round(v ?? 0).toLocaleString()}`;
const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

function Panel({ title, action, children, className = "" }: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function StatTile({ icon: Icon, label, value, unit, detail, accent, children }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  unit?: string;
  detail: React.ReactNode;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} aria-hidden />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1 sm:mt-3">
        <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>
      {children}
      <p className="mt-2 text-xs text-zinc-400">{detail}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-950/60 px-4 py-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-100">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, history, warningThreshold } = useAuth();
  const { grid, status: gridStatus } = useGridHistory(getApiUrl);
  const { forecast, status: forecastStatus } = useGridForecast(getApiUrl);
  const [alertDismissed, setAlertDismissed] = React.useState(false);
  const [now, setNow] = React.useState(() => new Date());

  // Re-render each minute so "since" times and the current hour stay fresh.
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const battery = data?.batteryCapacity ?? 0;
  const isLow = !!data && battery < warningThreshold;

  // Show the alert again the next time the battery drops below the threshold.
  const [wasLow, setWasLow] = React.useState(isLow);
  if (wasLow !== isLow) {
    setWasLow(isLow);
    if (!isLow) setAlertDismissed(false);
  }

  // --- Grid ---
  const threshold = grid?.threshold ?? DEFAULT_GRID_ON_VOLTAGE;
  const gridVoltage = data?.acInputVoltage ?? 0;
  const gridOn = gridVoltage >= threshold;
  const live = data?.status === "Online";
  const segments = React.useMemo(() => grid?.segments ?? [], [grid]);
  const day = React.useMemo(() => last24Hours(segments, now), [segments, now]);
  const week = React.useMemo(() => last7Days(segments, now), [segments, now]);
  const daysWithData = week.filter(hasData);
  const avgPerDay = daysWithData.length
    ? daysWithData.reduce((s, r) => s + totalOnHours(r), 0) / daysWithData.length
    : 0;
  const outages24h = countOutages(segments, new Date(now.getTime() - 24 * 3600_000));
  const lastChange = grid?.lastChange;
  const sinceText = lastChange
    ? `since ${clock(lastChange)} · ${formatDuration(now.getTime() - Date.parse(lastChange))}`
    : null;
  const nextChange = forecast?.prediction && !forecast.prediction.overdue
    ? `${forecast.prediction.state === "on" ? "back" : "off"} ~${clock(forecast.prediction.at)}`
    : null;

  // --- Battery ---
  const charging = (data?.batteryChargingCurrent ?? 0) > 0;
  const discharging = (data?.batteryDischargingCurrent ?? 0) > 0;
  const batteryDetail = `${data?.batteryVoltage ?? 0} V · ${
    charging ? `charging ${data?.batteryChargingCurrent} A`
      : discharging ? `using ${data?.batteryDischargingCurrent} A`
      : "idle"
  }`;
  const batteryColor = isLow ? "#f87171" : "#34d399";

  return (
    <div className="space-y-6">
      {isLow && !alertDismissed && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" aria-hidden />
            <p className="text-sm text-zinc-100">
              <span className="font-semibold text-red-300">Battery low: {battery}%.</span>{" "}
              It is below your {warningThreshold}% alert level. Reduce the load if you can.
            </p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Live status */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          icon={charging ? BatteryCharging : BatteryMedium}
          label="Battery"
          value={battery}
          unit="%"
          detail={batteryDetail}
          accent={batteryColor}
        >
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, battery)}%`, background: batteryColor }} />
          </div>
        </StatTile>
        <StatTile
          icon={PlugZap}
          label="Grid power"
          value={data ? (gridOn ? "On" : "Off") : "—"}
          detail={
            !data ? "No reading yet"
              : live ? `${gridVoltage} V${sinceText ? ` · ${sinceText}` : ""}${nextChange ? ` · ${nextChange}` : ""}`
              : `${gridVoltage} V · not live`
          }
          accent={!live ? "#a1a1aa" : gridOn ? "#38bdf8" : "#f87171"}
        />
        <StatTile
          icon={Sun}
          label="Solar"
          value={fmtW(data?.pvInputPower)}
          unit="W"
          detail={`Panels at ${data?.pvVoltage ?? 0} V`}
          accent="#fbbf24"
        />
        <StatTile
          icon={Gauge}
          label="Home load"
          value={fmtW(data?.loadPower)}
          unit="W"
          detail={`${data?.loadPercent ?? 0}% of inverter capacity`}
          accent="#a78bfa"
        />
      </div>

      {/* Grid forecast */}
      <Panel title="Grid forecast">
        {forecastStatus === "ready" && forecast ? (
          <GridForecastPanel forecast={forecast} now={now.getTime()} />
        ) : (
          <p className="py-6 text-center text-sm text-zinc-400">
            {forecastStatus === "loading" && "Analysing grid history…"}
            {forecastStatus === "unavailable" && "The forecast needs the latest backend. Deploy it to see predictions."}
            {forecastStatus === "error" && "Couldn't load the forecast. It will retry in a moment."}
          </p>
        )}
      </Panel>

      {/* Power over time */}
      <Panel title="Power">
        <PowerChart history={history} />
      </Panel>

      {/* Grid availability */}
      <Panel title="Grid power" action={<GridLegend />}>
        {gridStatus === "ready" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Fact label="Today" value={formatHours(totalOnHours(week[6]))} />
              <Fact label="Last 24 hours" value={formatHours(totalOnHours(day))} />
              <Fact label="Daily average (7 days)" value={formatHours(avgPerDay)} />
              <Fact label="Cuts in last 24 hours" value={outages24h} />
            </div>

            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Last 24 hours · minutes of grid power per hour</h3>
              <GridDayChart buckets={day} now={now.getTime()} />
            </div>

            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Last 7 days · hour by hour</h3>
              <GridWeekHeatmap days={week} now={now.getTime()} />
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-400">
            {gridStatus === "loading" && "Loading grid history…"}
            {gridStatus === "unavailable" && "Grid history needs the latest backend. Deploy it to start seeing these charts."}
            {gridStatus === "error" && "Couldn't load grid history. It will retry in a moment."}
          </p>
        )}
      </Panel>
    </div>
  );
}

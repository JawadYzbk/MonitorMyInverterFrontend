"use client";

import { useCallback, useEffect, useState } from "react";

/** Grid (utility power) availability, from GET /api/grid. */
export type GridState = "on" | "off";

export interface GridSegment {
  start: string; // UTC ISO
  end: string;   // UTC ISO
  state: GridState;
}

export interface GridResponse {
  threshold: number;
  hours: number;
  from: string;
  to: string;
  current: GridState | "unknown";
  currentVoltage: number | null;
  lastSample: string | null;
  lastChange: string | null;
  segments: GridSegment[];
}

/** One local-time hour: seconds with grid on / off. The rest of the hour had no data. */
export interface HourBucket {
  start: Date;
  on: number;
  off: number;
}

const HOUR_MS = 3600_000;

export function bucketHours(segments: GridSegment[], start: Date, hours: number): HourBucket[] {
  const startMs = start.getTime();
  const endMs = startMs + hours * HOUR_MS;
  const buckets: HourBucket[] = Array.from({ length: hours }, (_, i) => ({
    start: new Date(startMs + i * HOUR_MS),
    on: 0,
    off: 0,
  }));
  for (const seg of segments) {
    let s = Date.parse(seg.start);
    const e = Math.min(Date.parse(seg.end), endMs);
    if (Number.isNaN(s) || Number.isNaN(e) || e <= startMs || s >= endMs) continue;
    s = Math.max(s, startMs);
    let idx = Math.floor((s - startMs) / HOUR_MS);
    while (s < e && idx < hours) {
      const chunkEnd = Math.min(e, startMs + (idx + 1) * HOUR_MS);
      buckets[idx][seg.state] += (chunkEnd - s) / 1000;
      s = chunkEnd;
      idx += 1;
    }
  }
  return buckets;
}

function hourFloor(now: Date): Date {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  return d;
}

/** 24 buckets ending with the current (partial) local hour. */
export function last24Hours(segments: GridSegment[], now = new Date()): HourBucket[] {
  const top = hourFloor(now);
  return bucketHours(segments, new Date(top.getTime() - 23 * HOUR_MS), 24);
}

/** 7 rows (oldest first) of 24 local hours; the last row is today. */
export function last7Days(segments: GridSegment[], now = new Date()): HourBucket[][] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i), 0, 0, 0, 0);
    return bucketHours(segments, day, 24);
  });
}

/** Share of the covered part of the hour with grid power, or null if no data. */
export function onFraction(b: HourBucket): number | null {
  const covered = b.on + b.off;
  return covered < 60 ? null : b.on / covered;
}

export function hasData(buckets: HourBucket[]): boolean {
  return buckets.some((b) => onFraction(b) !== null);
}

export function totalOnHours(buckets: HourBucket[]): number {
  return buckets.reduce((sum, b) => sum + b.on, 0) / 3600;
}

/** Number of times grid power went off since `from`. */
export function countOutages(segments: GridSegment[], from: Date): number {
  let count = 0;
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.state === "off" && segments[i - 1].state === "on" && Date.parse(seg.start) >= from.getTime()) {
      count += 1;
    }
  }
  return count;
}

export function formatHours(hours: number): string {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

// Colors shared by the grid charts.
const GRID_ON_RGB = [56, 189, 248]; // sky-400
const GRID_OFF_RGB = [91, 42, 48];
export const GRID_ON_COLOR = "rgb(56 189 248)";
export const GRID_OFF_COLOR = "rgb(91 42 48)";
export const NO_DATA_COLOR = "rgb(39 39 42)"; // zinc-800

export function gridCellColor(b: HourBucket): string {
  const f = onFraction(b);
  if (f === null) return NO_DATA_COLOR;
  const c = GRID_OFF_RGB.map((v, i) => Math.round(v + (GRID_ON_RGB[i] - v) * f));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

export type GridStatus = "loading" | "ready" | "unavailable" | "error";

/** Polls GET /api/grid. "unavailable" means the backend doesn't have the endpoint yet (404). */
export function useGridHistory(getApiUrl: (path: string) => string, hours = 24 * 7, intervalMs = 120_000) {
  const [grid, setGrid] = useState<GridResponse | null>(null);
  const [status, setStatus] = useState<GridStatus>("loading");

  const load = useCallback(async () => {
    const token = localStorage.getItem("shine_token") || sessionStorage.getItem("shine_token");
    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/grid?hours=${hours}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        setStatus("unavailable");
        return;
      }
      if (!res.ok) {
        setStatus((s) => (s === "ready" ? s : "error"));
        return;
      }
      setGrid(await res.json());
      setStatus("ready");
    } catch {
      setStatus((s) => (s === "ready" ? s : "error"));
    }
  }, [getApiUrl, hours]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const id = setInterval(load, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { grid, status, reload: load };
}

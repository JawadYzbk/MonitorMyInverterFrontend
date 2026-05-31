"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TelemetryData {
  loadPower: number;
  batteryVoltage: number;
  batteryCapacity: number;
  pvVoltage: number;
  model: string;
  status: string;
  /* New Extra Fields */
  acInputVoltage?: number;
  acOutputVoltage?: number;
  acOutputFrequency?: number;
  loadPercent?: number;
  pvInputPower?: number;
  batteryChargingCurrent?: number;
  batteryDischargingCurrent?: number;
}

interface HistoryLog extends TelemetryData {
  id: number;
  timestamp: string;
}

export interface HistoryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  order?: string;
  start_date?: string;
  end_date?: string;
  min_load_power?: number;
  max_load_power?: number;
  min_battery_voltage?: number;
  max_battery_voltage?: number;
  model?: string;
}

export interface HistoryResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  data: HistoryLog[];
}

interface Device {
  serial_number: string;
  alias: string;
  is_selected: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  data: TelemetryData | null;
  history: HistoryLog[];
  devices: Device[];
  username: string;
  warningThreshold: number;
  login: (user: string, pass: string, remember: boolean) => Promise<void>;
  logout: () => void;
  fetchTelemetry: () => Promise<void>;
  fetchHistory: (params?: HistoryParams | string, manualToken?: string) => Promise<HistoryResponse | null>;
  fetchDevices: () => Promise<void>;
  selectDevice: (sn: string) => Promise<void>;
  setWarningThreshold: (val: number) => void;
  setError: (val: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TelemetryData | null>(null);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [username, setUsername] = useState("");
  const [warningThreshold, setWarningThresholdState] = useState(25);
  
  const router = useRouter();
  const pathname = usePathname();

  const getApiUrl = (path: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://monitormyinverter.onrender.com";
    const cleanedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanedPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanedBaseUrl}${cleanedPath}`;
  };

  const setWarningThreshold = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return;
    setWarningThresholdState(val);
    localStorage.setItem("shine_threshold", val.toString());
  };

  const fetchDevices = useCallback(async (manualToken?: string) => {
    const token = manualToken || localStorage.getItem("shine_token");
    if (!token) return;
    try {
      const res = await fetch(getApiUrl("/api/devices"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const payload = await res.json();
        setDevices(payload);
      }
    } catch (e) {}
  }, []);

  const fetchHistory = useCallback(async (paramsOrToken?: HistoryParams | string, manualToken?: string): Promise<HistoryResponse | null> => {
    let token = localStorage.getItem("shine_token") || sessionStorage.getItem("shine_token");
    let params: HistoryParams | undefined;

    if (typeof paramsOrToken === "string") {
      token = paramsOrToken;
    } else if (paramsOrToken) {
      params = paramsOrToken;
      if (manualToken) token = manualToken;
    }

    if (!token) return null;
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            queryParams.append(key, val.toString());
          }
        });
      }
      const queryString = queryParams.toString();
      const url = getApiUrl(`/api/history${queryString ? `?${queryString}` : ""}`);
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)) {
          setHistory(payload.data);
          return payload as HistoryResponse;
        } else if (Array.isArray(payload)) {
          setHistory(payload);
          return {
            total: payload.length,
            page: 1,
            limit: payload.length,
            pages: 1,
            data: payload
          };
        }
      }
    } catch (err) {
      console.error("History sync failure:", err);
    }
    return null;
  }, []);

  const fetchTelemetry = useCallback(async (manualToken?: string) => {
    const token = manualToken || localStorage.getItem("shine_token");
    if (!token) return;
    setRefreshing(true);
    try {
      const res = await fetch(getApiUrl("/api/telemetry"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Sync failed.");
      }
      const payload = await res.json();
      setData(payload);
      fetchHistory(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchHistory]);

  const login = async (user: string, pass: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Access Tunnel Refused: Invalid Credentials.");
      }
      
      const payload = await res.json();
      const token = payload.token;

      if (remember) {
        localStorage.setItem("shine_user", user);
        localStorage.setItem("shine_pass", pass);
        localStorage.setItem("shine_token", token);
      } else {
        sessionStorage.setItem("shine_token", token);
      }

      setUsername(user);
      setIsAuthenticated(true);
      await Promise.all([
        fetchTelemetry(token),
        fetchDevices(token)
      ]);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Link established failure.");
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    const token = localStorage.getItem("shine_token") || sessionStorage.getItem("shine_token");
    try {
      await fetch(getApiUrl("/api/auth/logout"), { 
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {}
    localStorage.removeItem("shine_user");
    localStorage.removeItem("shine_pass");
    localStorage.removeItem("shine_token");
    sessionStorage.removeItem("shine_token");
    setIsAuthenticated(false);
    setData(null);
    setHistory([]);
    setDevices([]);
    router.push("/");
  }, [router]);

  const selectDevice = async (sn: string) => {
    const token = localStorage.getItem("shine_token") || sessionStorage.getItem("shine_token");
    try {
      const res = await fetch(getApiUrl("/api/devices/select"), {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ serial_number: sn })
      });
      if (res.ok) {
        await Promise.all([
          fetchDevices(),
          fetchTelemetry()
        ]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("shine_user");
    const savedPass = localStorage.getItem("shine_pass");
    const savedToken = localStorage.getItem("shine_token") || sessionStorage.getItem("shine_token");
    const savedThreshold = localStorage.getItem("shine_threshold");
    
    if (savedThreshold) {
      const parsed = parseInt(savedThreshold);
      if (!isNaN(parsed)) setWarningThresholdState(parsed);
    }
    
    if (savedToken) {
      if (savedUser) setUsername(savedUser);
      setIsAuthenticated(true);
      fetchTelemetry(savedToken);
      fetchDevices(savedToken);
      if (pathname === "/") router.push("/dashboard");
    } else if (pathname !== "/") {
      router.push("/");
    }

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [fetchTelemetry, fetchDevices, pathname, router]);

  // Real-time polling
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchTelemetry]);

  // Battery Alert Logic
  useEffect(() => {
    if (data && data.batteryCapacity < warningThreshold) {
      const lastAlert = sessionStorage.getItem("last_battery_alert");
      const now = Date.now();
      
      // Alert once every 2 minutes if still low
      if (!lastAlert || now - parseInt(lastAlert) > 120000) {
        // Notification
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification("CRITICAL BATTERY ALERT", {
            body: `Battery level is at ${data.batteryCapacity}%, which is below your threshold of ${warningThreshold}%!`,
            icon: "/favicon.ico"
          });
        }

        // Sound (using a simple beep if no file)
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {
          console.error("Audio alert failed", e);
        }

        sessionStorage.setItem("last_battery_alert", now.toString());
      }
    } else if (data && data.batteryCapacity >= warningThreshold) {
      sessionStorage.removeItem("last_battery_alert");
    }
  }, [data?.batteryCapacity, warningThreshold]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, loading, refreshing, error, data, history, devices, username, warningThreshold,
      login, logout, fetchTelemetry, fetchHistory, fetchDevices, selectDevice, setWarningThreshold, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

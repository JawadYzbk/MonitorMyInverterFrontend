"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/DatePicker";
import { 
  Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, 
  ArrowUpDown, RefreshCw, X, Search, SlidersHorizontal 
} from "lucide-react";

export default function ArchivePage() {
  const { fetchHistory, warningThreshold } = useAuth();
  
  // Local Telemetry Grid State
  const [logs, setLogs] = React.useState<any[]>([]);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  
  // Pagination & Layout State
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortBy, setSortBy] = React.useState("timestamp");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  
  // Filtering Panels
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [filters, setFilters] = React.useState({
    startDate: "",
    endDate: "",
    minLoadPower: "",
    maxLoadPower: "",
    minBatteryVoltage: "",
    maxBatteryVoltage: "",
    model: "",
  });

  // Safe Data Sync Loop
  const loadData = React.useCallback(async (
    page = currentPage, 
    limit = pageSize, 
    sort = sortBy, 
    order = sortOrder, 
    activeFilters = filters
  ) => {
    setIsSyncing(true);
    try {
      const params: any = {
        page,
        limit,
        sort_by: sort,
        order,
      };

      if (activeFilters.startDate) params.start_date = activeFilters.startDate;
      if (activeFilters.endDate) params.end_date = activeFilters.endDate;
      
      if (activeFilters.minLoadPower) {
        const val = parseFloat(activeFilters.minLoadPower);
        if (!isNaN(val)) params.min_load_power = val;
      }
      if (activeFilters.maxLoadPower) {
        const val = parseFloat(activeFilters.maxLoadPower);
        if (!isNaN(val)) params.max_load_power = val;
      }
      
      if (activeFilters.minBatteryVoltage) {
        const val = parseFloat(activeFilters.minBatteryVoltage);
        if (!isNaN(val)) params.min_battery_voltage = val;
      }
      if (activeFilters.maxBatteryVoltage) {
        const val = parseFloat(activeFilters.maxBatteryVoltage);
        if (!isNaN(val)) params.max_battery_voltage = val;
      }
      
      if (activeFilters.model) params.model = activeFilters.model;

      const result = await fetchHistory(params);
      if (result) {
        setLogs(result.data || []);
        setTotalRecords(result.total || 0);
        setTotalPages(result.pages || 0);
      }
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchHistory, currentPage, pageSize, sortBy, sortOrder, filters]);

  // Load telemetry logs on component mount
  React.useEffect(() => {
    loadData(1, pageSize, sortBy, sortOrder, filters);
  }, []);

  const handleSort = (column: string) => {
    let nextOrder: "asc" | "desc" = "desc";
    if (sortBy === column) {
      nextOrder = sortOrder === "desc" ? "asc" : "desc";
    }
    setSortBy(column);
    setSortOrder(nextOrder);
    setCurrentPage(1);
    loadData(1, pageSize, column, nextOrder, filters);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadData(page, pageSize, sortBy, sortOrder, filters);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    loadData(1, size, sortBy, sortOrder, filters);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadData(1, pageSize, sortBy, sortOrder, filters);
  };

  const handleResetFilters = () => {
    const cleared = {
      startDate: "",
      endDate: "",
      minLoadPower: "",
      maxLoadPower: "",
      minBatteryVoltage: "",
      maxBatteryVoltage: "",
      model: "",
    };
    setFilters(cleared);
    setCurrentPage(1);
    loadData(1, pageSize, sortBy, sortOrder, cleared);
  };

  const handleRefresh = () => {
    loadData(currentPage, pageSize, sortBy, sortOrder, filters);
  };

  // Interactive sorting header builder
  const renderSortableHeader = (column: string, label: string) => {
    const isCurrent = sortBy === column;
    return (
      <TableHead 
        onClick={() => handleSort(column)}
        className="px-6 h-14 text-muted-foreground font-bold uppercase text-[9px] tracking-[0.2em] cursor-pointer hover:text-white transition-colors group select-none"
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span className="transition-transform duration-200 group-hover:scale-110">
            {!isCurrent ? (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
            ) : sortOrder === "asc" ? (
              <ArrowUp className="h-3 w-3 text-primary drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]" />
            ) : (
              <ArrowDown className="h-3 w-3 text-primary drop-shadow-[0_0_8px_rgba(0,255,204,0.5)]" />
            )}
          </span>
        </div>
      </TableHead>
    );
  };

  // Render sliding window pagination controls
  const renderPaginationNumbers = () => {
    const pages: React.ReactNode[] = [];
    const windowSize = 1;
    
    const pushPageBtn = (p: number) => {
      pages.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`h-8 min-w-[32px] px-2 rounded-lg border text-[10px] font-bold transition-all cursor-pointer select-none flex items-center justify-center ${
            currentPage === p
              ? "bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(0,255,204,0.15)]"
              : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
          }`}
        >
          {p}
        </button>
      );
    };

    const pushDots = (key: string) => {
      pages.push(
        <span key={key} className="text-muted-foreground/40 text-xs px-1 select-none font-mono">
          ...
        </span>
      );
    };

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pushPageBtn(i);
      }
    } else {
      pushPageBtn(1);

      if (currentPage > windowSize + 2) {
        pushDots("dots-start");
      }

      const start = Math.max(2, currentPage - windowSize);
      const end = Math.min(totalPages - 1, currentPage + windowSize);

      for (let i = start; i <= end; i++) {
        pushPageBtn(i);
      }

      if (currentPage < totalPages - windowSize - 1) {
        pushDots("dots-end");
      }

      pushPageBtn(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">
            Telemetry <span className="text-primary">Archive</span>
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Satellite Data Retrieval Grid
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isSyncing}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[10px] gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          Sync Grid
        </Button>
      </div>

      {/* Compact, Always-Visible Filter Bar */}
      <Card className="bg-card/25 border-white/5 p-4.5 backdrop-blur-xl relative z-30 overflow-visible">
        <div className="flex flex-wrap items-end gap-4.5">
          {/* Date Range Group */}
          <div className="flex items-center gap-2">
            <div className="space-y-1 w-[125px]">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Start Date</span>
              <DatePicker
                value={filters.startDate}
                onChange={(val) => setFilters({ ...filters, startDate: val })}
                placeholder="Start Date"
              />
            </div>
            <span className="text-muted-foreground/30 text-[10px] self-end mb-2">to</span>
            <div className="space-y-1 w-[125px]">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">End Date</span>
              <DatePicker
                value={filters.endDate}
                onChange={(val) => setFilters({ ...filters, endDate: val })}
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Load Matrix Limits */}
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Min Load</span>
              <input
                type="number"
                placeholder="Min W"
                value={filters.minLoadPower}
                onChange={(e) => setFilters({ ...filters, minLoadPower: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[75px]"
              />
            </div>
            <span className="text-muted-foreground/30 text-[10px] self-end mb-2">-</span>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Max Load</span>
              <input
                type="number"
                placeholder="Max W"
                value={filters.maxLoadPower}
                onChange={(e) => setFilters({ ...filters, maxLoadPower: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[75px]"
              />
            </div>
          </div>

          {/* Battery Voltage Limits */}
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Min Bat Volt</span>
              <input
                type="number"
                step="0.1"
                placeholder="Min V"
                value={filters.minBatteryVoltage}
                onChange={(e) => setFilters({ ...filters, minBatteryVoltage: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[75px]"
              />
            </div>
            <span className="text-muted-foreground/30 text-[10px] self-end mb-2">-</span>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Max Bat Volt</span>
              <input
                type="number"
                step="0.1"
                placeholder="Max V"
                value={filters.maxBatteryVoltage}
                onChange={(e) => setFilters({ ...filters, maxBatteryVoltage: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-[75px]"
              />
            </div>
          </div>

          {/* Model Match */}
          <div className="space-y-1 flex-1 min-w-[130px]">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Model Search</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Inverter..."
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded pl-8 pr-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-white/5 bg-white/[0.02] hover:bg-white/5 text-white font-bold uppercase tracking-widest text-[8px] h-8 px-3 cursor-pointer"
            >
              Reset
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white font-bold uppercase tracking-widest text-[8px] h-8 px-3 cursor-pointer shadow-[0_0_10px_rgba(0,255,204,0.05)] transition-all"
            >
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Database Telemetry Table Card */}
      <Card className="bg-card/40 border-white/5 overflow-hidden backdrop-blur-xl relative">
        {isSyncing && logs.length > 0 && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300 animate-in fade-in" />
        )}

        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white uppercase italic">Historical Stream</h3>
          </div>
          <div className="bg-primary/5 border border-primary/20 px-4 py-1.5 rounded-lg flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
              {totalRecords} Signals Logged
            </span>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              {renderSortableHeader("timestamp", "Temporal Stamp")}
              {renderSortableHeader("model", "Inverter Model")}
              {renderSortableHeader("loadPower", "Load Matrix (W)")}
              {renderSortableHeader("batteryCapacity", "Reserves (%)")}
              {renderSortableHeader("batteryVoltage", "Battery Volt (V)")}
              {renderSortableHeader("pvVoltage", "PV Input (V)")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, i) => (
              <TableRow key={log.id || i} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="px-6 py-4.5 font-mono text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                  {new Date(log.timestamp.endsWith("Z") ? log.timestamp : log.timestamp + "Z").toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-white/80 uppercase">
                  {log.model || "Off Grid"}
                </TableCell>
                <TableCell className="font-bold text-white">
                  {log.loadPower} W
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold w-10 ${log.batteryCapacity < warningThreshold ? "text-destructive" : "text-white"}`}>
                      {log.batteryCapacity}%
                    </span>
                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${log.batteryCapacity < warningThreshold ? "bg-destructive animate-pulse" : "bg-primary"}`} 
                        style={{ width: `${log.batteryCapacity}%` }} 
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-[11px] text-white/90">
                  {log.batteryVoltage?.toFixed(1) || "0.0"} V
                </TableCell>
                <TableCell className="font-bold text-white">
                  {log.pvVoltage?.toFixed(1) || "0.0"} V
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        {logs.length > 0 && (
          <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Showing {Math.min(totalRecords, (currentPage - 1) * pageSize + 1)} - {Math.min(totalRecords, currentPage * pageSize)} of {totalRecords} Logs
              </span>
              <span className="text-white/10">|</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 text-white rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                >
                  <option value="10" className="bg-[#0a0a0b] text-white">10</option>
                  <option value="25" className="bg-[#0a0a0b] text-white">25</option>
                  <option value="50" className="bg-[#0a0a0b] text-white">50</option>
                  <option value="100" className="bg-[#0a0a0b] text-white">100</option>
                  <option value="200" className="bg-[#0a0a0b] text-white">200</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 border-white/5 bg-white/5 hover:bg-white/10 text-white cursor-pointer disabled:opacity-30 disabled:hover:bg-white/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1.5">
                {renderPaginationNumbers()}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 border-white/5 bg-white/5 hover:bg-white/10 text-white cursor-pointer disabled:opacity-30 disabled:hover:bg-white/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {logs.length === 0 && !isSyncing && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-3 uppercase text-[10px] font-bold tracking-widest italic opacity-50">
            <div>No telemetry signatures found in current sector</div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[9px] cursor-pointer mt-2"
            >
              Scan Again
            </Button>
          </div>
        )}

        {logs.length === 0 && isSyncing && (
          <div className="h-64 flex flex-col items-center justify-center text-primary gap-4 uppercase text-[10px] font-bold tracking-widest italic animate-pulse">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <div>Scanning Sector Telemetry...</div>
          </div>
        )}
      </Card>
    </div>
  );
}

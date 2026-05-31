"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select Date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(() => {
    if (value) return new Date(value);
    return new Date();
  });

  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Sync internal state with prop value changes
  React.useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  // Click outside to close popover
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    // Format as YYYY-MM-DD local date
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate calendar grid array
  const cells: { day: number; isCurrentMonth: boolean; key: string }[] = [];

  // Previous month fallback days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      key: `prev-${daysInPrevMonth - i}`
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      key: `curr-${i}`
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      key: `next-${i}`
    });
  }

  const formattedDisplay = React.useMemo(() => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${m}/${d}/${y}`;
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-white/5 border border-white/10 text-white rounded px-2.5 py-1.5 text-xs font-mono focus-within:ring-1 focus-within:ring-primary w-full cursor-pointer h-8 select-none hover:bg-white/10 transition-colors"
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {formattedDisplay || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <X
              onClick={handleClear}
              className="h-3 w-3 text-muted-foreground hover:text-white cursor-pointer transition-colors"
            />
          )}
          <CalendarIcon className="h-3.5 w-3.5 text-primary opacity-80" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[260px] bg-[#0c0c0e] border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 right-0 sm:left-0">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 select-none text-[10px] font-bold">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/5 rounded border border-white/5 hover:border-white/10 transition-all text-muted-foreground hover:text-white cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-white uppercase tracking-wider font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/5 rounded border border-white/5 hover:border-white/10 transition-all text-muted-foreground hover:text-white cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ day, isCurrentMonth, key }) => {
              const isSelected = value && 
                new Date(value).getFullYear() === year &&
                new Date(value).getMonth() === month &&
                new Date(value).getDate() === day &&
                isCurrentMonth;

              return (
                <button
                  key={key}
                  disabled={!isCurrentMonth}
                  onClick={() => handleDateClick(day)}
                  className={`h-7 w-7 text-[10px] font-mono rounded flex items-center justify-center transition-all select-none border border-transparent ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-[0_0_8px_rgba(0,255,204,0.15)]"
                      : isCurrentMonth
                        ? "text-white/80 hover:bg-white/5 hover:border-white/5 hover:text-white cursor-pointer"
                        : "text-white/10"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

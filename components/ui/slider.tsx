"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

export const Slider = (props: any) => {
  const { className, value, defaultValue, min = 0, max = 100, ...rest } = props;
  
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [value ?? defaultValue ?? min];

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      {...rest}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center h-10">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <SliderPrimitive.Indicator className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {_values.map((_: any, index: number) => (
          <SliderPrimitive.Thumb
            key={index}
            className="block h-4 w-4 rounded-full border border-primary bg-slate-950 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
};

export default Slider;

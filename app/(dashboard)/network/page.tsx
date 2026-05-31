"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ShieldCheck, Zap } from "lucide-react";

export default function NetworkPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">Network <span className="text-primary">Topography</span></h2>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Global Mesh Node Visualization</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/40 border-white/5 p-12 border-dashed flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <Globe className="h-24 w-24 text-primary relative z-10" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white uppercase">Sector Visualization Pending</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
              The orbital node mapping module is currently undergoing synchronization. Real-time geospatial tracking of inverter nodes will be available in the next system update.
            </p>
          </div>
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 uppercase tracking-widest text-[10px] font-bold h-12 px-8">
            Initialize Scan
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/40 border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Node Health</CardTitle>
            </div>
            <div className="space-y-4">
              {[
                { label: "SATELLITE-A42", status: "ONLINE", power: "346W" },
                { label: "ORBITAL-B12", status: "OFFLINE", power: "0W" },
                { label: "GROUND-G07", status: "ONLINE", power: "1.2kW" }
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] font-bold text-white">{node.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-muted-foreground">{node.power}</span>
                    <div className={`h-1.5 w-1.5 rounded-full ${node.status === "ONLINE" ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-primary/5 border border-primary/20 p-6 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Grid Power</p>
                <p className="text-lg font-bold text-white uppercase">1.546 kW</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

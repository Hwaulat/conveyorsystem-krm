import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Clock3,
  Eye,
  Pause,
  Play,
  Radio,
  ScanLine,
  Zap,
} from "lucide-react";
import type { Cabin } from "./shared-types";
import { PanelTitle, StatusBadge } from "./DashboardView";
import { StatCardGrid } from "@/components/ui/stat-card";

type StationData = {
  code: string;
  name: string;
  cabinCount: number;
  activeCabin: string | null;
  elapsed: string;
  status: "active" | "idle" | "delayed";
  load: number;
};

const areaDetails: {
  name: string;
  areaCode: string;
  stations: StationData[];
  targetMinutes: number;
  state: "good" | "warn";
}[] = [
  {
    name: "PTED", areaCode: "Area 01", targetMinutes: 18, state: "good",
    stations: [
      { code: "PT-01", name: "Pre-treatment 1", cabinCount: 3, activeCabin: "CAB-240930-1870", elapsed: "07m 12s", status: "active", load: 55 },
      { code: "PT-02", name: "Pre-treatment 2", cabinCount: 2, activeCabin: "CAB-240930-1871", elapsed: "04m 30s", status: "active", load: 40 },
      { code: "PT-03", name: "E-coat", cabinCount: 4, activeCabin: "CAB-240930-1864", elapsed: "04m 06s", status: "active", load: 72 },
      { code: "PT-04", name: "Oven", cabinCount: 3, activeCabin: null, elapsed: "—", status: "idle", load: 0 },
    ],
  },
  {
    name: "Sanding", areaCode: "Area 02", targetMinutes: 14, state: "good",
    stations: [
      { code: "SD-01", name: "Sanding 1", cabinCount: 2, activeCabin: "CAB-240930-1866", elapsed: "10m 44s", status: "active", load: 60 },
      { code: "SD-02", name: "Sanding 2", cabinCount: 3, activeCabin: "CAB-240930-1867", elapsed: "16m 08s", status: "delayed", load: 88 },
      { code: "SD-03", name: "Dust removal", cabinCount: 2, activeCabin: "CAB-240930-1868", elapsed: "05m 21s", status: "active", load: 45 },
      { code: "SD-04", name: "Inspection", cabinCount: 2, activeCabin: "CAB-240930-1861", elapsed: "06m 51s", status: "active", load: 52 },
    ],
  },
  {
    name: "Sealing", areaCode: "Area 03", targetMinutes: 22, state: "warn",
    stations: [
      { code: "SL-01", name: "Sealer prep", cabinCount: 4, activeCabin: "CAB-240930-1872", elapsed: "18m 33s", status: "active", load: 85 },
      { code: "SL-02", name: "Interior seal", cabinCount: 3, activeCabin: "CAB-240930-1873", elapsed: "12m 17s", status: "active", load: 70 },
      { code: "SL-03", name: "Exterior seal", cabinCount: 5, activeCabin: "CAB-240930-1847", elapsed: "31m 42s", status: "delayed", load: 96 },
      { code: "SL-04", name: "Sealer oven", cabinCount: 3, activeCabin: "CAB-240930-1874", elapsed: "09m 58s", status: "active", load: 60 },
    ],
  },
  {
    name: "Topcoat", areaCode: "Area 04", targetMinutes: 28, state: "good",
    stations: [
      { code: "TC-01", name: "Primer", cabinCount: 2, activeCabin: "CAB-240930-1875", elapsed: "15m 02s", status: "active", load: 55 },
      { code: "TC-02", name: "Basecoat", cabinCount: 3, activeCabin: "CAB-240930-1852", elapsed: "09m 18s", status: "active", load: 48 },
      { code: "TC-03", name: "Clearcoat", cabinCount: 2, activeCabin: "CAB-240930-1876", elapsed: "20m 41s", status: "active", load: 72 },
      { code: "TC-04", name: "Flash-off", cabinCount: 2, activeCabin: "CAB-240930-1877", elapsed: "32m 16s", status: "delayed", load: 92 },
      { code: "TC-05", name: "Topcoat oven", cabinCount: 2, activeCabin: "CAB-240930-1878", elapsed: "11m 28s", status: "active", load: 50 },
    ],
  },
  {
    name: "Touch-up", areaCode: "Area 05", targetMinutes: 12, state: "good",
    stations: [
      { code: "TU-01", name: "Inspection", cabinCount: 2, activeCabin: "CAB-240930-1879", elapsed: "03m 44s", status: "active", load: 35 },
      { code: "TU-02", name: "Touch-up", cabinCount: 2, activeCabin: "CAB-240930-1880", elapsed: "07m 16s", status: "active", load: 55 },
      { code: "TU-03", name: "Final release", cabinCount: 2, activeCabin: null, elapsed: "—", status: "idle", load: 0 },
    ],
  },
];

const liveFeed = [
  { cabin: "CAB-240930-1864", station: "PT-03", event: "START", time: "17:24:51", ago: "12s" },
  { cabin: "CAB-240930-1852", station: "TC-02", event: "ARRIVE", time: "17:23:38", ago: "1m 25s" },
  { cabin: "CAB-240930-1861", station: "SD-04", event: "ARRIVE", time: "17:22:09", ago: "2m 54s" },
  { cabin: "CAB-240930-1847", station: "SL-03", event: "START", time: "17:18:24", ago: "6m 39s" },
  { cabin: "CAB-240930-1870", station: "PT-01", event: "ARRIVE", time: "17:17:39", ago: "7m 24s" },
  { cabin: "CAB-240930-1873", station: "SL-02", event: "FINISH", time: "17:16:02", ago: "9m 01s" },
  { cabin: "CAB-240930-1876", station: "TC-03", event: "START", time: "17:04:22", ago: "20m 41s" },
  { cabin: "CAB-240930-1877", station: "TC-04", event: "ARRIVE", time: "16:52:47", ago: "32m 16s" },
];

export function LiveLineView({ onSelectCabin, cabins }: { onSelectCabin: (c: Cabin) => void; cabins: Cabin[] }) {
  const [expandedArea, setExpandedArea] = useState<string | null>("Sealing");
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      {/* top summary strip */}
      <div className="mb-5">
        <StatCardGrid
          columns={4}
          items={[
            { title: "Active stations", value: "17 / 20", icon: <Radio className="h-5 w-5 text-success" />, iconBg: "bg-green-50 dark:bg-green-900/20", valueColor: "text-success", variant: "compact" },
            { title: "Throughput", value: "4.8 /hr", icon: <Zap className="h-5 w-5 text-primary" />, iconBg: "bg-blue-50 dark:bg-blue-900/20", valueColor: "text-primary", variant: "compact" },
            { title: "Avg. cycle", value: "14m 22s", icon: <Clock3 className="h-5 w-5 text-info" />, iconBg: "bg-sky-50 dark:bg-sky-900/20", valueColor: "text-info", variant: "compact" },
            { title: "Delayed", value: "3", icon: <AlertTriangle className="h-5 w-5 text-destructive" />, iconBg: "bg-red-50 dark:bg-red-900/20", valueColor: "text-destructive", variant: "compact" },
          ]}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* main conveyor track */}
        <div className="space-y-3">
          {/* progress track header */}
          <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 cabin-pulse rounded-full bg-success" />
              <span className="text-xs font-semibold text-success">Live</span>
            </div>
            <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary via-info to-success" style={{ width: "76%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground">76% line progress</span>
            <button onClick={() => setIsPaused(!isPaused)} className="ml-2 grid h-8 w-8 place-items-center rounded-md border hover:bg-muted" title={isPaused ? "Resume" : "Pause"}>
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* area sections */}
          {areaDetails.map((area) => {
            const isExpanded = expandedArea === area.name;
            const totalCabins = area.stations.reduce((s, st) => s + st.cabinCount, 0);
            const delayed = area.stations.filter(st => st.status === "delayed").length;
            return (
              <section key={area.name} className={`overflow-hidden rounded-md border shadow-sm transition-colors ${area.state === "warn" ? "border-warning/50 bg-warning-soft/30" : "bg-card"}`}>
                <button
                  onClick={() => setExpandedArea(isExpanded ? null : area.name)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${area.state === "warn" ? "bg-warning text-foreground" : "bg-primary text-primary-foreground"}`}>
                    {totalCabins}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-semibold">{area.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{area.areaCode}</span>
                      {delayed > 0 && <span className="flex items-center gap-1 rounded bg-danger-soft px-1.5 py-0.5 text-[9px] font-semibold text-destructive"><AlertTriangle className="h-3 w-3" />{delayed} delayed</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{area.stations.length} stations</span>
                      <span>Target {area.targetMinutes}m</span>
                      <span>{totalCabins} cabins</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden w-24 sm:block">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${area.state === "warn" ? "bg-warning" : "bg-primary"}`} style={{ width: `${Math.round(area.stations.reduce((a, s) => a + s.load, 0) / area.stations.length)}%` }} />
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t">
                    <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                      {area.stations.map((st) => (
                        <div key={st.code} className={`bg-card p-4 ${st.status === "delayed" ? "bg-danger-soft/40" : ""}`}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${st.status === "active" ? "bg-success cabin-pulse" : st.status === "delayed" ? "bg-destructive cabin-pulse" : "bg-muted-foreground"}`} />
                              <span className="font-display text-xs font-bold">{st.code}</span>
                            </div>
                            {st.status === "delayed" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          </div>
                          <p className="mb-2 text-[10px] text-muted-foreground">{st.name}</p>
                          <div className="mb-2 h-1 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${st.status === "delayed" ? "bg-destructive" : "bg-primary"}`} style={{ width: `${st.load}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{st.cabinCount} cabin{st.cabinCount !== 1 ? "s" : ""}</span>
                            <span className={`font-semibold tabular-nums ${st.status === "delayed" ? "text-destructive" : ""}`}>{st.elapsed}</span>
                          </div>
                          {st.activeCabin && (
                            <button
                              onClick={() => {
                                const c = cabins.find(cab => cab.serial === st.activeCabin);
                                if (c) onSelectCabin(c);
                              }}
                              className="mt-2 flex w-full items-center gap-1 rounded border bg-muted/50 px-2 py-1.5 text-[10px] hover:bg-muted transition-colors"
                            >
                              <ScanLine className="h-3 w-3 text-primary" />
                              <span className="truncate font-semibold">{st.activeCabin}</span>
                              <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* right sidebar — live feed */}
        <div className="space-y-5">
          <section className="overflow-hidden rounded-md border bg-card shadow-sm">
            <PanelTitle title="Live scan feed" subtitle="Real-time scanner events" action={isPaused ? "Paused" : "Streaming"} />
            <div className="max-h-[520px] overflow-y-auto p-4">
              {liveFeed.map((ev, i) => (
                <div key={`${ev.cabin}-${ev.time}`} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className={`relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${ev.event === "START" ? "bg-success-soft text-success" : ev.event === "FINISH" ? "bg-info-soft text-info" : "bg-warning-soft text-warning"}`}>
                    {ev.event === "FINISH" ? <Eye className="h-3.5 w-3.5" /> : <ScanLine className="h-3.5 w-3.5" />}
                  </div>
                  {i < liveFeed.length - 1 && <div className="absolute bottom-0 left-[13px] top-7 w-px bg-border" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <b className="truncate text-[11px]">{ev.cabin}</b>
                      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{ev.ago}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      <span className={`font-semibold ${ev.event === "START" ? "text-success" : ev.event === "FINISH" ? "text-info" : "text-warning"}`}>{ev.event}</span> at {ev.station} · {ev.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-md border bg-card shadow-sm">
            <PanelTitle title="Area summary" subtitle="Cabin distribution" action="5 areas" />
            <div className="p-4 space-y-3">
              {areaDetails.map(area => {
                const total = area.stations.reduce((s, st) => s + st.cabinCount, 0);
                return (
                  <div key={area.name}>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="font-semibold">{area.name}</span>
                      <span className="text-muted-foreground">{total} cabins</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${area.state === "warn" ? "bg-warning" : "bg-primary"}`} style={{ width: `${Math.min(100, total * 5)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

import {
  AlertTriangle,
  Boxes,
  CircleGauge,
  Clock3,
  PackageCheck,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import type { Cabin } from "./shared-types";
import { StatCardGrid } from "@/components/ui/stat-card";

const areas = [
  { name: "PTED", count: 12, stations: 4, load: 64, target: "18m", state: "good" },
  { name: "Sanding", count: 9, stations: 4, load: 71, target: "14m", state: "good" },
  { name: "Sealing", count: 15, stations: 4, load: 92, target: "22m", state: "warn" },
  { name: "Topcoat", count: 11, stations: 5, load: 78, target: "28m", state: "good" },
  { name: "Touch-up", count: 6, stations: 3, load: 48, target: "12m", state: "good" },
];

const scans = [
  ["CAB-240930-1864", "PT-03", "START", "17:24:51"],
  ["CAB-240930-1852", "TC-02", "ARRIVE", "17:23:38"],
  ["CAB-240930-1861", "SD-04", "ARRIVE", "17:22:09"],
  ["CAB-240930-1847", "SL-03", "START", "17:18:24"],
];

export function DashboardView({
  cabins,
  onSelectCabin,
  onNavigate,
}: {
  cabins: Cabin[];
  onSelectCabin: (c: Cabin) => void;
  onNavigate: (view: string) => void;
}) {
  return (
    <>
      <section className="mb-5">
        <StatCardGrid
          columns={5}
          items={[
            { title: "Cabins on line", value: "53", subtitle: "+4 this hour", icon: <Boxes className="h-5 w-5 text-gray-500" />, valueColor: "text-info", variant: "compact" },
            { title: "Processing", value: "21", subtitle: "39.6% of line", icon: <CircleGauge className="h-5 w-5 text-gray-500" />, valueColor: "text-success", variant: "compact" },
            { title: "Waiting", value: "29", subtitle: "Avg. 8m 14s", icon: <Clock3 className="h-5 w-5 text-gray-500" />, valueColor: "text-warning", variant: "compact" },
            { title: "Delayed", value: "3", subtitle: "Over target time", icon: <AlertTriangle className="h-5 w-5 text-gray-500" />, valueColor: "text-destructive", variant: "compact" },
            { title: "Completed today", value: "118", subtitle: "92% of target", icon: <PackageCheck className="h-5 w-5 text-gray-500" />, valueColor: "text-info", variant: "compact" },
          ]}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.75fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-md border bg-card shadow-sm">
            <PanelTitle title="Live conveyor flow" subtitle="53 cabins across 20 stations" action="Line overview" onClick={() => onNavigate("Live Line")} />
            <div className="overflow-x-auto p-4 pb-5">
              <div className="relative min-w-[760px] pt-5">
                <div className="absolute left-[8%] right-[8%] top-[47px] h-1 rounded-full bg-muted"><div className="h-full w-[76%] rounded-full bg-primary/35" /></div>
                <div className="relative grid grid-cols-5 gap-3">
                  {areas.map((area, index) => <button key={area.name} onClick={() => onNavigate("Live Line")} className="group text-left">
                    <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-4 border-card text-sm font-bold shadow-md transition-transform group-hover:-translate-y-1 ${area.state === "warn" ? "bg-warning text-foreground ring-2 ring-warning/20" : "bg-primary text-primary-foreground"}`}>{area.count}</div>
                    <div className={`rounded-md border p-3 ${area.state === "warn" ? "border-warning bg-warning-soft" : "bg-card"}`}>
                      <div className="mb-2 flex items-center justify-between"><h3 className="font-display text-xs font-semibold">{area.name}</h3>{area.state === "warn" && <AlertTriangle className="h-4 w-4 text-warning" />}</div>
                      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${area.state === "warn" ? "bg-warning" : "bg-primary"}`} style={{ width: `${area.load}%` }} /></div>
                      <div className="flex justify-between text-[10px] text-muted-foreground"><span>{area.stations} stations</span><span>Target {area.target}</span></div>
                    </div>
                    <p className="mt-2 text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Area 0{index + 1}</p>
                  </button>)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 border-t bg-muted/40 px-4 py-3 text-[10px] text-muted-foreground"><Legend color="bg-primary" label="Processing" /><Legend color="bg-warning" label="Near / over target" /><Legend color="bg-success" label="Departed scan" /><span className="ml-auto hidden sm:block">Movement reflects station scans, not physical position</span></div>
          </section>

          <section className="overflow-hidden rounded-md border bg-card shadow-sm">
            <PanelTitle title="Station queue" subtitle="Priority and elapsed time" action="View all stations" onClick={() => onNavigate("Station View")} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Cabin</th><th className="px-4 py-3">Model / Color</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Elapsed</th></tr></thead>
                <tbody>{cabins.map((cabin) => <tr key={cabin.serial} onClick={() => onSelectCabin(cabin)} className="cursor-pointer border-t transition-colors hover:bg-muted/50"><td className="px-4 py-3 font-semibold">{cabin.serial}</td><td className="px-4 py-3"><span className="block">{cabin.model}</span><span className="text-[10px] text-muted-foreground">{cabin.code} · {cabin.color}</span></td><td className="px-4 py-3"><b>{cabin.area}</b><span className="ml-2 text-muted-foreground">{cabin.station}</span></td><td className="px-4 py-3"><StatusBadge value={cabin.status} /></td><td className={`px-4 py-3 text-right font-semibold tabular-nums ${cabin.status === "Delayed" ? "text-destructive" : ""}`}>{cabin.elapsed}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="overflow-hidden rounded-md border bg-card shadow-sm"><PanelTitle title="Bottleneck watch" subtitle="Target time variance" action="3 active" onClick={() => onNavigate("Exceptions")} />
            <div className="divide-y">
              {[ ["SL-03", "Sealing", "+9m 42s", 92], ["TC-04", "Topcoat", "+4m 16s", 78], ["SD-02", "Sanding", "+2m 08s", 65] ].map(([station, area, value, width]) => <button key={station as string} className="block w-full p-4 text-left hover:bg-muted/40"><div className="mb-2 flex items-center justify-between"><span><b className="text-xs">{station}</b><small className="ml-2 text-muted-foreground">{area}</small></span><b className="text-xs text-destructive">{value}</b></div><div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-destructive" style={{ width: `${width}%` }} /></div></button>)}
            </div>
          </section>
          <section className="overflow-hidden rounded-md border bg-card shadow-sm"><PanelTitle title="Recent scan activity" subtitle="Latest accepted events" action="Live feed" />
            <div className="p-4">{scans.map((scan, index) => <div key={scan[0]} className="relative flex gap-3 pb-5 last:pb-0"><div className={`relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-info-soft text-info" : "bg-muted text-muted-foreground"}`}><ScanLine className="h-3.5 w-3.5" /></div>{index < scans.length - 1 && <div className="absolute bottom-0 left-[13px] top-7 w-px bg-border" />}<div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><b className="truncate text-[11px]">{scan[0]}</b><span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{scan[3]}</span></div><p className="mt-0.5 text-[10px] text-muted-foreground"><span className="font-semibold text-primary">{scan[2]}</span> at {scan[1]}</p></div></div>)}</div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ─── shared small components ─── */

function Metric({ icon: Icon, label, value, note, tone }: { icon: LucideIcon; label: string; value: string; note: string; tone: "info" | "success" | "warning" | "danger" }) {
  const toneClass = { info: "bg-info-soft text-info", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-destructive" }[tone];
  return <article className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{note}</p></div><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${toneClass}`}><Icon className="h-5 w-5" /></div></article>;
}

export function PanelTitle({ title, subtitle, action, onClick }: { title: string; subtitle: string; action: string; onClick?: () => void }) {
  return <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4"><div className="min-w-0"><h2 className="truncate font-display text-sm font-semibold">{title}</h2><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p></div><button onClick={onClick} className="shrink-0 text-[10px] font-semibold text-primary hover:underline">{action}</button></div>;
}

export function StatusBadge({ value }: { value: Cabin["status"] }) {
  const cls = value === "Processing" ? "bg-info-soft text-info" : value === "Waiting" ? "bg-warning-soft text-warning" : "bg-danger-soft text-destructive";
  return <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold ${cls}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}

export function LiveStatusBadge() {
  return <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs"><span className="h-2 w-2 cabin-pulse rounded-full bg-success" /><span className="font-semibold text-success">Live</span><span className="hidden text-muted-foreground sm:inline">Updated 1s ago</span></div>;
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>; }

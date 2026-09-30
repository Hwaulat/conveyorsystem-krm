import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Boxes,
  ChevronDown,
  ChevronsLeft,
  CircleGauge,
  Clock3,
  FileBarChart,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  PackageCheck,
  Radio,
  ScanLine,
  Search,
  Settings2,
  ShieldAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Line Dashboard — PaintFlow" },
      { name: "description", content: "Monitor cabin locations, station queues, elapsed times, and paint-line bottlenecks in real time." },
      { property: "og:title", content: "Live Line Dashboard — PaintFlow" },
      { property: "og:description", content: "Monitor cabin locations, station queues, elapsed times, and paint-line bottlenecks in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConveyorDashboard,
});

type NavItem = { label: string; icon: LucideIcon; badge?: number };
type Cabin = {
  serial: string;
  model: string;
  color: string;
  code: string;
  lot: string;
  area: string;
  station: string;
  status: "Processing" | "Waiting" | "Delayed";
  elapsed: string;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: "Core functions", items: [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Live Line", icon: Radio },
    { label: "Station View", icon: ScanLine },
    { label: "Cabin History", icon: History },
    { label: "Exceptions", icon: ShieldAlert, badge: 3 },
  ] },
  { title: "Report & documentation", items: [
    { label: "Reports", icon: FileBarChart },
  ] },
  { title: "Setup system", items: [
    { label: "Master Data", icon: Boxes },
    { label: "Users Management", icon: Users },
  ] },
];

const areas = [
  { name: "PTED", count: 12, stations: 4, load: 64, target: "18m", state: "good" },
  { name: "Sanding", count: 9, stations: 4, load: 71, target: "14m", state: "good" },
  { name: "Sealing", count: 15, stations: 4, load: 92, target: "22m", state: "warn" },
  { name: "Topcoat", count: 11, stations: 5, load: 78, target: "28m", state: "good" },
  { name: "Touch-up", count: 6, stations: 3, load: 48, target: "12m", state: "good" },
];

const cabins: Cabin[] = [
  { serial: "CAB-240930-1847", model: "FMX", color: "Arctic White", code: "WHT-01", lot: "L2409-18", area: "Sealing", station: "SL-03", status: "Delayed", elapsed: "31m 42s" },
  { serial: "CAB-240930-1852", model: "FH16", color: "Ocean Blue", code: "BLU-12", lot: "L2409-18", area: "Topcoat", station: "TC-02", status: "Processing", elapsed: "09m 18s" },
  { serial: "CAB-240930-1861", model: "FM", color: "Graphite", code: "GRY-07", lot: "L2409-19", area: "Sanding", station: "SD-04", status: "Waiting", elapsed: "06m 51s" },
  { serial: "CAB-240930-1864", model: "FMX", color: "Signal Red", code: "RED-04", lot: "L2409-19", area: "PTED", station: "PT-03", status: "Processing", elapsed: "04m 06s" },
];

const scans = [
  ["CAB-240930-1864", "PT-03", "START", "17:24:51"],
  ["CAB-240930-1852", "TC-02", "ARRIVE", "17:23:38"],
  ["CAB-240930-1861", "SD-04", "ARRIVE", "17:22:09"],
  ["CAB-240930-1847", "SL-03", "START", "17:18:24"],
];

function ConveyorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Cabin | null>(null);
  const [now, setNow] = useState(new Date("2026-09-30T10:25:46Z"));

  useEffect(() => {
    const id = window.setInterval(() => setNow((value) => new Date(value.getTime() + 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const results = useMemo(() => {
    const needle = query.toLowerCase().trim();
    if (!needle) return [];
    return cabins.filter((cabin) => Object.values(cabin).some((value) => value.toLowerCase().includes(needle)));
  }, [query]);

  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" });

  return (
    <div className="min-h-screen bg-background lg:flex">
      {sidebarOpen && <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-foreground/35 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 lg:sticky ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "w-[76px]" : "w-[254px]"}`}>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary shadow-lg shadow-primary/20">
              <span className="h-5 w-5 rounded-full border-2 border-primary-foreground/80" />
              <span className="absolute inset-1 rounded-full border border-cyan/70" />
            </div>
            {!collapsed && <div className="min-w-0"><p className="truncate font-display text-[15px] font-bold text-primary-foreground">PaintFlow</p><p className="truncate text-[11px] text-primary">Conveyor Monitoring</p></div>}
            <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="ml-auto grid h-10 w-10 place-items-center lg:hidden"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-5">
                {!collapsed && <div className="mb-2 flex items-center gap-3 px-3"><span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">{group.title}</span><span className="h-px flex-1 bg-sidebar-border" /></div>}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.label;
                    return <button key={item.label} title={collapsed ? item.label : undefined} onClick={() => { setActive(item.label); setSidebarOpen(false); }} className={`relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-[13px] transition-colors ${isActive ? "bg-sidebar-accent font-semibold text-primary-foreground before:absolute before:-left-2 before:h-7 before:w-1 before:rounded-r before:bg-primary" : "hover:bg-sidebar-accent/60 hover:text-primary-foreground"}`}>
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{item.badge}</span>}</>}
                    </button>;
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="flex h-12 shrink-0 items-center justify-between border-t border-sidebar-border px-4 text-[10px] text-sidebar-muted">
            <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-success" />{!collapsed && "System Online"}</span>{!collapsed && <span>v0.1.0</span>}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 grid h-[68px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-card px-4 shadow-sm lg:px-6">
          <button aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="grid h-11 w-11 place-items-center rounded-md border lg:hidden"><Menu className="h-5 w-5" /></button>
          <button aria-label="Collapse sidebar" onClick={() => setCollapsed((value) => !value)} className="hidden h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted lg:grid"><ChevronsLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} /></button>
          <div className="hidden min-w-0 md:block"><p className="truncate font-display text-sm font-semibold">Paint Line 01</p><p className="text-[10px] text-muted-foreground">Plant Operations · Shift 2</p></div>
          <div className="col-start-3 flex items-center gap-2 sm:gap-4">
            <Moon className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <div className="hidden text-right sm:block"><p className="text-xs font-bold tabular-nums">{time}</p><p className="text-[10px] text-muted-foreground">Wednesday, September 30, 2026</p></div>
            <div className="h-8 w-px bg-border" />
            <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-muted"><Bell className="h-[18px] w-[18px] text-muted-foreground" /><span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">3</span></button>
            <div className="hidden items-center gap-2 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar text-xs font-bold text-primary-foreground">AD</div><div><p className="text-xs font-semibold">admin</p><p className="text-[10px] text-muted-foreground">Super Admin</p></div><ChevronDown className="h-4 w-4 text-muted-foreground" /></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 lg:p-6">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0"><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Operations control</p><h1 className="truncate font-display text-xl font-bold sm:text-2xl">{active}</h1><p className="mt-1 hidden text-xs text-muted-foreground sm:block">Live paint-line status and cabin flow across all production areas</p></div>
            <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs"><span className="h-2 w-2 cabin-pulse rounded-full bg-success" /><span className="font-semibold text-success">Live</span><span className="hidden text-muted-foreground sm:inline">Updated 1s ago</span></div>
          </div>

          <section className="relative mb-5">
            <div className="flex min-h-12 items-center rounded-md border bg-card shadow-sm focus-within:ring-2 focus-within:ring-ring/20">
              <Search className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find cabin by serial number, color, model, or lot..." className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground" /><kbd className="mr-3 hidden rounded border bg-muted px-2 py-1 text-[10px] text-muted-foreground sm:block">⌘ K</kbd>
            </div>
            {query && <div className="absolute inset-x-0 top-14 z-10 max-h-64 overflow-auto rounded-md border bg-popover p-2 shadow-xl">
              {results.length ? results.map((cabin) => <button key={cabin.serial} onClick={() => { setSelected(cabin); setQuery(""); }} className="grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded px-3 text-left hover:bg-muted"><span className="min-w-0"><b className="block truncate text-xs">{cabin.serial}</b><small className="text-muted-foreground">{cabin.model} · {cabin.color} · {cabin.lot}</small></span><span className="text-right text-xs"><b className="block text-primary">{cabin.area}</b><small className="text-muted-foreground">{cabin.station}</small></span></button>) : <p className="p-4 text-center text-xs text-muted-foreground">No cabins found</p>}
            </div>}
          </section>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
            <Metric icon={Boxes} label="Cabins on line" value="53" note="+4 this hour" tone="info" />
            <Metric icon={CircleGauge} label="Processing" value="21" note="39.6% of line" tone="success" />
            <Metric icon={Clock3} label="Waiting" value="29" note="Avg. 8m 14s" tone="warning" />
            <Metric icon={AlertTriangle} label="Delayed" value="3" note="Over target time" tone="danger" />
            <Metric icon={PackageCheck} label="Completed today" value="118" note="92% of target" tone="info" />
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(310px,.75fr)]">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-md border bg-card shadow-sm">
                <PanelTitle title="Live conveyor flow" subtitle="53 cabins across 20 stations" action="Line overview" />
                <div className="overflow-x-auto p-4 pb-5">
                  <div className="relative min-w-[760px] pt-5">
                    <div className="absolute left-[8%] right-[8%] top-[47px] h-1 rounded-full bg-muted"><div className="h-full w-[76%] rounded-full bg-primary/35" /></div>
                    <div className="relative grid grid-cols-5 gap-3">
                      {areas.map((area, index) => <button key={area.name} onClick={() => setActive("Live Line")} className="group text-left">
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
                <PanelTitle title="Station queue" subtitle="Priority and elapsed time" action="View all stations" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Cabin</th><th className="px-4 py-3">Model / Color</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Elapsed</th></tr></thead>
                    <tbody>{cabins.map((cabin) => <tr key={cabin.serial} onClick={() => setSelected(cabin)} className="cursor-pointer border-t transition-colors hover:bg-muted/50"><td className="px-4 py-3 font-semibold">{cabin.serial}</td><td className="px-4 py-3"><span className="block">{cabin.model}</span><span className="text-[10px] text-muted-foreground">{cabin.code} · {cabin.color}</span></td><td className="px-4 py-3"><b>{cabin.area}</b><span className="ml-2 text-muted-foreground">{cabin.station}</span></td><td className="px-4 py-3"><Status value={cabin.status} /></td><td className={`px-4 py-3 text-right font-semibold tabular-nums ${cabin.status === "Delayed" ? "text-destructive" : ""}`}>{cabin.elapsed}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="overflow-hidden rounded-md border bg-card shadow-sm"><PanelTitle title="Bottleneck watch" subtitle="Target time variance" action="3 active" />
                <div className="divide-y">
                  {[ ["SL-03", "Sealing", "+9m 42s", 92], ["TC-04", "Topcoat", "+4m 16s", 78], ["SD-02", "Sanding", "+2m 08s", 65] ].map(([station, area, value, width]) => <button key={station} className="block w-full p-4 text-left hover:bg-muted/40"><div className="mb-2 flex items-center justify-between"><span><b className="text-xs">{station}</b><small className="ml-2 text-muted-foreground">{area}</small></span><b className="text-xs text-destructive">{value}</b></div><div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-destructive" style={{ width: `${width}%` }} /></div></button>)}
                </div>
              </section>
              <section className="overflow-hidden rounded-md border bg-card shadow-sm"><PanelTitle title="Recent scan activity" subtitle="Latest accepted events" action="Live feed" />
                <div className="p-4">{scans.map((scan, index) => <div key={scan[0]} className="relative flex gap-3 pb-5 last:pb-0"><div className={`relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-info-soft text-info" : "bg-muted text-muted-foreground"}`}><ScanLine className="h-3.5 w-3.5" /></div>{index < scans.length - 1 && <div className="absolute bottom-0 left-[13px] top-7 w-px bg-border" />}<div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><b className="truncate text-[11px]">{scan[0]}</b><span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{scan[3]}</span></div><p className="mt-0.5 text-[10px] text-muted-foreground"><span className="font-semibold text-primary">{scan[2]}</span> at {scan[1]}</p></div></div>)}</div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={() => setSelected(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-card shadow-2xl animate-in slide-in-from-right duration-200" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b p-5"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Cabin detail</p><h2 className="mt-1 font-display text-lg font-bold">{selected.serial}</h2><p className="mt-1 text-xs text-muted-foreground">{selected.model} · {selected.color} · {selected.lot}</p></div><button aria-label="Close cabin detail" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted"><X className="h-5 w-5" /></button></div>
        <div className="grid grid-cols-2 gap-px bg-border"><Detail label="Current area" value={selected.area} /><Detail label="Station" value={selected.station} /><Detail label="Status" value={selected.status} /><Detail label="Elapsed" value={selected.elapsed} /></div>
        <div className="p-5"><h3 className="mb-4 font-display text-sm font-semibold">Station timeline</h3>{[ ["PTED", "PT-04", "14m 21s", true], ["Sanding", "SD-04", "11m 08s", true], [selected.area, selected.station, selected.elapsed, false] ].map(([area, station, elapsed, done], index) => <div key={`${area}-${index}`} className="relative flex gap-3 pb-6 last:pb-0"><div className={`relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full ${done ? "bg-success" : "cabin-pulse bg-primary"}`} />{index < 2 && <div className="absolute bottom-0 left-[5px] top-3 w-px bg-border" />}<div className="flex min-w-0 flex-1 justify-between"><div><b className="block text-xs">{area}</b><small className="text-muted-foreground">{station} · {done ? "Departed" : selected.status}</small></div><span className="text-xs font-semibold tabular-nums">{elapsed}</span></div></div>)}</div>
      </aside></div>}
    </div>
  );
}

function Metric({ icon: Icon, label, value, note, tone }: { icon: LucideIcon; label: string; value: string; note: string; tone: "info" | "success" | "warning" | "danger" }) {
  const toneClass = { info: "bg-info-soft text-info", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-destructive" }[tone];
  return <article className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-md border bg-card p-4 shadow-sm"><div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{note}</p></div><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${toneClass}`}><Icon className="h-5 w-5" /></div></article>;
}

function PanelTitle({ title, subtitle, action }: { title: string; subtitle: string; action: string }) {
  return <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4"><div className="min-w-0"><h2 className="truncate font-display text-sm font-semibold">{title}</h2><p className="mt-0.5 truncate text-[10px] text-muted-foreground">{subtitle}</p></div><button className="shrink-0 text-[10px] font-semibold text-primary hover:underline">{action}</button></div>;
}

function Status({ value }: { value: Cabin["status"] }) {
  const cls = value === "Processing" ? "bg-info-soft text-info" : value === "Waiting" ? "bg-warning-soft text-warning" : "bg-danger-soft text-destructive";
  return <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold ${cls}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>;
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="bg-card p-4"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>; }
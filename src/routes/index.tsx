import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronsLeft,
  FileBarChart,
  History,
  LayoutDashboard,
  Menu,
  Moon,
  Radio,
  ScanLine,
  ShieldAlert,
  Sun,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Cabin } from "../components/views/shared-types";
import { DashboardView } from "../components/views/DashboardView";
import { LiveLineView } from "../components/views/LiveLineView";
import { StationView } from "../components/views/StationView";
import { CabinHistoryView } from "../components/views/CabinHistoryView";
import { ExceptionsView } from "../components/views/ExceptionsView";
import { ReportsView } from "../components/views/ReportsView";
import { MasterDataView } from "../components/views/MasterDataView";
import { UsersManagementView } from "../components/views/UsersManagementView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaintFlow Operations" },
      { name: "description", content: "Real-time conveyor and cabin monitoring for paint-line operations." },
      { property: "og:title", content: "PaintFlow Operations" },
      { property: "og:description", content: "Real-time conveyor and cabin monitoring for paint-line operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConveyorDashboard,
});

type NavItem = { label: string; icon: LucideIcon; badge?: number };

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

const cabins: Cabin[] = [
  { serial: "CAB-240930-1847", model: "FMX", color: "Arctic White", code: "WHT-01", lot: "L2409-18", area: "Sealing", station: "SL-03", status: "Delayed", elapsed: "31m 42s" },
  { serial: "CAB-240930-1852", model: "FH16", color: "Ocean Blue", code: "BLU-12", lot: "L2409-18", area: "Topcoat", station: "TC-02", status: "Processing", elapsed: "09m 18s" },
  { serial: "CAB-240930-1861", model: "FM", color: "Graphite", code: "GRY-07", lot: "L2409-19", area: "Sanding", station: "SD-04", status: "Waiting", elapsed: "06m 51s" },
  { serial: "CAB-240930-1864", model: "FMX", color: "Signal Red", code: "RED-04", lot: "L2409-19", area: "PTED", station: "PT-03", status: "Processing", elapsed: "04m 06s" },
];

const viewSubtitles: Record<string, string> = {
  "Dashboard": "Live paint-line status and cabin flow across all production areas",
  "Live Line": "Real-time conveyor visualization with station-level tracking",
  "Station View": "Individual station status, queue depth, and cycle times",
  "Cabin History": "Complete cabin journey timeline through all stations",
  "Exceptions": "Alerts, violations, and corrective actions",
  "Reports": "Production metrics, throughput analysis, and shift summaries",
  "Master Data": "Manage areas, stations, cabins, and scanner devices",
  "Users Management": "User accounts, roles, and system audit trail",
};

function ConveyorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [selected, setSelected] = useState<Cabin | null>(null);
  const [now, setNow] = useState(new Date("2026-09-30T10:25:46Z"));

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        return true;
      } else if (savedTheme === "light") {
        document.documentElement.classList.remove("dark");
        return false;
      }
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newTheme;
    });
  };

  useEffect(() => {
    const id = window.setInterval(() => setNow((value) => new Date(value.getTime() + 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);


  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" });

  const handleNavigate = (view: string) => {
    setActive(view);
    setSidebarOpen(false);
  };

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
                    return <button key={item.label} title={collapsed ? item.label : undefined} onClick={() => handleNavigate(item.label)} className={`relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-[13px] transition-colors ${isActive ? "bg-sidebar-accent font-semibold text-primary-foreground before:absolute before:-left-2 before:h-7 before:w-1 before:rounded-r before:bg-primary" : "hover:bg-sidebar-accent/60 hover:text-primary-foreground"}`}>
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
            <button onClick={toggleTheme} aria-label="Toggle Theme" className="hidden sm:grid h-10 w-10 place-items-center rounded-md hover:bg-muted">
              {isDarkMode ? <Sun className="h-[18px] w-[18px] text-muted-foreground" /> : <Moon className="h-[18px] w-[18px] text-muted-foreground" />}
            </button>
            <div className="hidden text-right sm:block"><p className="text-xs font-bold tabular-nums">{time}</p><p className="text-[10px] text-muted-foreground">Wednesday, September 30, 2026</p></div>
            <div className="h-8 w-px bg-border" />
            <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-muted"><Bell className="h-[18px] w-[18px] text-muted-foreground" /><span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[8px] font-bold text-destructive-foreground">3</span></button>
            <div className="hidden items-center gap-2 sm:flex"><div className="grid h-9 w-9 place-items-center rounded-full bg-sidebar text-xs font-bold text-primary-foreground">AD</div><div><p className="text-xs font-semibold">admin</p><p className="text-[10px] text-muted-foreground">Super Admin</p></div><ChevronDown className="h-4 w-4 text-muted-foreground" /></div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 lg:p-6">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0"><h1 className="truncate font-display text-xl font-bold sm:text-2xl">{active}</h1><p className="mt-1 hidden text-xs text-muted-foreground sm:block">{viewSubtitles[active]}</p></div>
            <div className="flex items-center gap-2">
              <div id="header-actions-left" className="flex items-center gap-2"></div>
              <div id="header-actions-right" className="flex items-center gap-2"></div>
            </div>
          </div>


          {/* View content — switches based on active nav item */}
          {active === "Dashboard" && <DashboardView cabins={cabins} onSelectCabin={setSelected} onNavigate={handleNavigate} />}
          {active === "Live Line" && <LiveLineView cabins={cabins} onSelectCabin={setSelected} />}
          {active === "Station View" && <StationView cabins={cabins} onSelectCabin={setSelected} />}
          {active === "Cabin History" && <CabinHistoryView cabins={cabins} onSelectCabin={setSelected} />}
          {active === "Exceptions" && <ExceptionsView />}
          {active === "Reports" && <ReportsView />}
          {active === "Master Data" && <MasterDataView />}
          {active === "Users Management" && <UsersManagementView />}
        </main>
      </div>

      {/* Cabin detail slide-over */}
      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={() => setSelected(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-card shadow-2xl animate-in slide-in-from-right duration-200" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b p-5"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Cabin detail</p><h2 className="mt-1 font-display text-lg font-bold">{selected.serial}</h2><p className="mt-1 text-xs text-muted-foreground">{selected.model} · {selected.color} · {selected.lot}</p></div><button aria-label="Close cabin detail" onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted"><X className="h-5 w-5" /></button></div>
        <div className="grid grid-cols-2 gap-px bg-border"><Detail label="Current area" value={selected.area} /><Detail label="Station" value={selected.station} /><Detail label="Status" value={selected.status} /><Detail label="Elapsed" value={selected.elapsed} /></div>
        <div className="p-5"><h3 className="mb-4 font-display text-sm font-semibold">Station timeline</h3>{[ ["PTED", "PT-04", "14m 21s", true], ["Sanding", "SD-04", "11m 08s", true], [selected.area, selected.station, selected.elapsed, false] ].map(([area, station, elapsed, done], index) => <div key={`${area}-${index}`} className="relative flex gap-3 pb-6 last:pb-0"><div className={`relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full ${done ? "bg-success" : "cabin-pulse bg-primary"}`} />{index < 2 && <div className="absolute bottom-0 left-[5px] top-3 w-px bg-border" />}<div className="flex min-w-0 flex-1 justify-between"><div><b className="block text-xs">{area as string}</b><small className="text-muted-foreground">{station as string} · {done ? "Departed" : selected.status}</small></div><span className="text-xs font-semibold tabular-nums">{elapsed as string}</span></div></div>)}</div>
      </aside></div>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="bg-card p-4"><p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>; }
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock3,
  Filter,
  Loader2,
  ScanLine,
  Settings2,
} from "lucide-react";
import type { Cabin } from "./shared-types";
import { PanelTitle, StatusBadge } from "./DashboardView";
import { SelectInput } from "@/components/ui/select-input";
import { StatCardGrid } from "@/components/ui/stat-card";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { TableLayout } from "@/components/ui/table-layout";
import { Search } from "@/components/ui/search-input";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type Station = {
  code: string;
  name: string;
  area: string;
  activeCabins: number;
  queueDepth: number;
  avgCycleTime: string;
  targetTime: string;
  status: "online" | "idle" | "delayed" | "maintenance";
  load: number;
  currentCabin: string | null;
  elapsed: string;
  completedToday: number;
};

const allStations: Station[] = [
  { code: "PT-01", name: "Pre-treatment 1", area: "PTED", activeCabins: 1, queueDepth: 2, avgCycleTime: "14m 22s", targetTime: "18m", status: "online", load: 55, currentCabin: "CAB-240930-1870", elapsed: "07m 12s", completedToday: 14 },
  { code: "PT-02", name: "Pre-treatment 2", area: "PTED", activeCabins: 1, queueDepth: 1, avgCycleTime: "13m 08s", targetTime: "18m", status: "online", load: 40, currentCabin: "CAB-240930-1871", elapsed: "04m 30s", completedToday: 16 },
  { code: "PT-03", name: "E-coat", area: "PTED", activeCabins: 1, queueDepth: 3, avgCycleTime: "16m 45s", targetTime: "18m", status: "online", load: 72, currentCabin: "CAB-240930-1864", elapsed: "04m 06s", completedToday: 12 },
  { code: "PT-04", name: "Oven", area: "PTED", activeCabins: 0, queueDepth: 0, avgCycleTime: "17m 11s", targetTime: "18m", status: "idle", load: 0, currentCabin: null, elapsed: "—", completedToday: 15 },
  { code: "SD-01", name: "Sanding 1", area: "Sanding", activeCabins: 1, queueDepth: 1, avgCycleTime: "12m 55s", targetTime: "14m", status: "online", load: 60, currentCabin: "CAB-240930-1866", elapsed: "10m 44s", completedToday: 18 },
  { code: "SD-02", name: "Sanding 2", area: "Sanding", activeCabins: 1, queueDepth: 2, avgCycleTime: "15m 48s", targetTime: "14m", status: "delayed", load: 88, currentCabin: "CAB-240930-1867", elapsed: "16m 08s", completedToday: 11 },
  { code: "SD-03", name: "Dust removal", area: "Sanding", activeCabins: 1, queueDepth: 1, avgCycleTime: "11m 30s", targetTime: "14m", status: "online", load: 45, currentCabin: "CAB-240930-1868", elapsed: "05m 21s", completedToday: 20 },
  { code: "SD-04", name: "Inspection", area: "Sanding", activeCabins: 1, queueDepth: 1, avgCycleTime: "10m 04s", targetTime: "14m", status: "online", load: 52, currentCabin: "CAB-240930-1861", elapsed: "06m 51s", completedToday: 22 },
  { code: "SL-01", name: "Sealer prep", area: "Sealing", activeCabins: 1, queueDepth: 3, avgCycleTime: "19m 15s", targetTime: "22m", status: "online", load: 85, currentCabin: "CAB-240930-1872", elapsed: "18m 33s", completedToday: 10 },
  { code: "SL-02", name: "Interior seal", area: "Sealing", activeCabins: 1, queueDepth: 2, avgCycleTime: "17m 42s", targetTime: "22m", status: "online", load: 70, currentCabin: "CAB-240930-1873", elapsed: "12m 17s", completedToday: 12 },
  { code: "SL-03", name: "Exterior seal", area: "Sealing", activeCabins: 1, queueDepth: 4, avgCycleTime: "28m 36s", targetTime: "22m", status: "delayed", load: 96, currentCabin: "CAB-240930-1847", elapsed: "31m 42s", completedToday: 7 },
  { code: "SL-04", name: "Sealer oven", area: "Sealing", activeCabins: 1, queueDepth: 2, avgCycleTime: "20m 08s", targetTime: "22m", status: "online", load: 60, currentCabin: "CAB-240930-1874", elapsed: "09m 58s", completedToday: 11 },
  { code: "TC-01", name: "Primer", area: "Topcoat", activeCabins: 1, queueDepth: 1, avgCycleTime: "24m 30s", targetTime: "28m", status: "online", load: 55, currentCabin: "CAB-240930-1875", elapsed: "15m 02s", completedToday: 9 },
  { code: "TC-02", name: "Basecoat", area: "Topcoat", activeCabins: 1, queueDepth: 2, avgCycleTime: "22m 14s", targetTime: "28m", status: "online", load: 48, currentCabin: "CAB-240930-1852", elapsed: "09m 18s", completedToday: 10 },
  { code: "TC-03", name: "Clearcoat", area: "Topcoat", activeCabins: 1, queueDepth: 1, avgCycleTime: "25m 50s", targetTime: "28m", status: "online", load: 72, currentCabin: "CAB-240930-1876", elapsed: "20m 41s", completedToday: 8 },
  { code: "TC-04", name: "Flash-off", area: "Topcoat", activeCabins: 1, queueDepth: 1, avgCycleTime: "30m 02s", targetTime: "28m", status: "delayed", load: 92, currentCabin: "CAB-240930-1877", elapsed: "32m 16s", completedToday: 6 },
  { code: "TC-05", name: "Topcoat oven", area: "Topcoat", activeCabins: 1, queueDepth: 1, avgCycleTime: "26m 18s", targetTime: "28m", status: "online", load: 50, currentCabin: "CAB-240930-1878", elapsed: "11m 28s", completedToday: 9 },
  { code: "TU-01", name: "Inspection", area: "Touch-up", activeCabins: 1, queueDepth: 1, avgCycleTime: "09m 15s", targetTime: "12m", status: "online", load: 35, currentCabin: "CAB-240930-1879", elapsed: "03m 44s", completedToday: 24 },
  { code: "TU-02", name: "Touch-up", area: "Touch-up", activeCabins: 1, queueDepth: 1, avgCycleTime: "10m 30s", targetTime: "12m", status: "online", load: 55, currentCabin: "CAB-240930-1880", elapsed: "07m 16s", completedToday: 20 },
  { code: "TU-03", name: "Final release", area: "Touch-up", activeCabins: 0, queueDepth: 0, avgCycleTime: "08m 42s", targetTime: "12m", status: "maintenance", load: 0, currentCabin: null, elapsed: "—", completedToday: 18 },
];

const areaNames = ["All", "PTED", "Sanding", "Sealing", "Topcoat", "Touch-up"];

export function StationView({ cabins, onSelectCabin }: { cabins: Cabin[]; onSelectCabin: (c: Cabin) => void }) {
  const [areaFilter, setAreaFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"code" | "load" | "elapsed">("code");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sheetStation, setSheetStation] = useState<Station | null>(null);
  
  // Use a state that updates to force re-render if nodes change during HMR
  const [nodes, setNodes] = useState({ left: document.getElementById("header-actions-left"), right: document.getElementById("header-actions-right") });

  useEffect(() => {
    const updateNodes = () => setNodes({ left: document.getElementById("header-actions-left"), right: document.getElementById("header-actions-right") });
    updateNodes();
    // In dev, sometimes HMR needs a small delay
    const t = setTimeout(updateNodes, 100);
    return () => clearTimeout(t);
  }, []);

  const filtered = allStations
    .filter(s => areaFilter === "All" || s.area === areaFilter)
    .filter(s => statusFilter === "All" || s.status === statusFilter.toLowerCase())
    .filter(s => !searchQuery || s.code.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "load") return b.load - a.load;
    if (sortBy === "elapsed") return b.load - a.load;
    return a.code.localeCompare(b.code);
  });

  const displayData = viewMode === "table" ? sorted.slice(0, 10) : sorted;

  const online = sorted.filter(s => s.status === "online").length;
  const delayed = sorted.filter(s => s.status === "delayed").length;
  const idle = sorted.filter(s => s.status === "idle").length;
  const maint = sorted.filter(s => s.status === "maintenance").length;

  return (
    <>
      {/* header actions portal - left */}
      {nodes.left && createPortal(
        <CustomTabs
          value={areaFilter}
          onValueChange={setAreaFilter}
          variant="primary"
          items={areaNames.map(a => ({ value: a, label: a, content: null }))}
          className="mr-2"
        />,
        nodes.left
      )}

      {/* header actions portal - right */}
      {nodes.right && createPortal(
        <div className="flex items-center gap-2">
          <button onClick={() => setSortBy(sortBy === "code" ? "load" : "code")} className="flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-[11px] font-semibold hover:bg-muted transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />{sortBy === "code" ? "By code" : "By load"}
          </button>
          <button onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")} className="flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-[11px] font-semibold hover:bg-muted transition-colors">
            <Filter className="h-3.5 w-3.5" />{viewMode === "cards" ? "Cards" : "Table"}
          </button>
        </div>,
        nodes.right
      )}


      {/* summary */}
      <div className="mb-5">
        <StatCardGrid
          columns={6}
          items={[
            { title: "Total Stations", value: allStations.length, variant: "stat" },
            { title: "Active", value: allStations.length - idle - maint, valueColor: "text-primary", variant: "stat" },
            { title: "Idle", value: idle, valueColor: "text-warning", variant: "stat" },
            { title: "Maintenance", value: maint, valueColor: "text-muted-foreground", variant: "stat" },
            { title: "Avg Cycle", value: "4.2m", variant: "stat" },
            { title: "Total Queue", value: allStations.reduce((acc, s) => acc + s.activeCabins, 0), variant: "stat" },
          ]}
        />
      </div>

      {viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayData.map(st => (
            <article 
              key={st.code} 
              onClick={() => setSheetStation(st)}
              className={`cursor-pointer overflow-hidden rounded-md border shadow-sm transition-all hover:shadow-md ${st.status === "delayed" ? "border-destructive/30 bg-danger-soft/20" : st.status === "maintenance" ? "border-dashed opacity-70" : "bg-card"}`}
            >
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${st.status === "online" ? "bg-success" : st.status === "delayed" ? "bg-destructive cabin-pulse" : st.status === "idle" ? "bg-warning" : "bg-muted-foreground"}`} />
                    <span className="font-display text-sm font-bold">{st.code}</span>
                  </div>
                  <span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase ${st.status === "online" ? "bg-success-soft text-success" : st.status === "delayed" ? "bg-danger-soft text-destructive" : st.status === "idle" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"}`}>{st.status}</span>
                </div>
                <p className="mb-1 text-xs text-muted-foreground">{st.name}</p>
                <p className="mb-3 text-[10px] text-primary font-semibold">{st.area}</p>

                <div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${st.status === "delayed" ? "bg-destructive" : "bg-primary"}`} style={{ width: `${st.load}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-muted-foreground">Queue</span><p className="font-semibold">{st.queueDepth} cabins</p></div>
                  <div><span className="text-muted-foreground">Avg. cycle</span><p className="font-semibold">{st.avgCycleTime}</p></div>
                  <div><span className="text-muted-foreground">Target</span><p className="font-semibold">{st.targetTime}</p></div>
                  <div><span className="text-muted-foreground">Today</span><p className="font-semibold">{st.completedToday} done</p></div>
                </div>

                {st.currentCabin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const c = cabins.find(cab => cab.serial === st.currentCabin);
                      if (c) onSelectCabin(c);
                    }}
                    className="mt-3 flex w-full items-center gap-2 rounded border bg-muted/50 px-2.5 py-2 text-[10px] hover:bg-muted transition-colors"
                  >
                    <ScanLine className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate font-semibold">{st.currentCabin}</span>
                    <span className={`ml-auto font-semibold tabular-nums ${st.status === "delayed" ? "text-destructive" : ""}`}>{st.elapsed}</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <TableLayout
          totalItems={sorted.length}
          hideDateRange
          toolbarFilters={
            <>
              <div className="flex-1 min-w-[200px]">
                <Search value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} placeholder="Search by station code or name..." />
              </div>
              <div className="w-[180px]">
                <SelectInput
                  datalist={[
                    { label: "All Status", value: "All" },
                    { label: "Online", value: "Online" },
                    { label: "Delayed", value: "Delayed" },
                    { label: "Idle", value: "Idle" },
                    { label: "Maintenance", value: "Maintenance" }
                  ]}
                  defValue={statusFilter}
                  onChange={(val) => val && setStatusFilter(val as string)}
                  hideClear
                />
              </div>
            </>
          }
        >
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:bg-muted/50">
              <tr>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Avg. Cycle</th>
                <th className="px-4 py-3">Current Cabin</th>
                <th className="px-4 py-3 text-right">Load</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map(st => (
                <tr key={st.code} className="border-t transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3"><span className="font-semibold">{st.code}</span><span className="ml-2 text-[10px] text-muted-foreground">{st.name}</span></td>
                  <td className="px-4 py-3 font-semibold text-primary">{st.area}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${st.status === "online" ? "bg-success-soft text-success" : st.status === "delayed" ? "bg-danger-soft text-destructive" : st.status === "idle" ? "bg-warning-soft text-warning" : "bg-muted text-muted-foreground"}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{st.status}</span></td>
                  <td className="px-4 py-3">{st.queueDepth}</td>
                  <td className="px-4 py-3 tabular-nums">{st.avgCycleTime}</td>
                  <td className="px-4 py-3 font-semibold">{st.currentCabin ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${st.status === "delayed" ? "bg-destructive" : "bg-primary"}`} style={{ width: `${st.load}%` }} /></div>
                      <span className="tabular-nums font-semibold">{st.load}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableLayout>
      )}

      {/* Station Cabins History Sheet */}
      <Sheet open={!!sheetStation} onOpenChange={(open) => !open && setSheetStation(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{sheetStation?.name} ({sheetStation?.code})</SheetTitle>
            <SheetDescription>
              List of cabins processed at this station.
            </SheetDescription>
          </SheetHeader>

          {sheetStation && (
            <div className="space-y-4">
              <div className="rounded-md border bg-card overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Cabin ID</th>
                      <th className="px-3 py-2 font-medium">Started</th>
                      <th className="px-3 py-2 font-medium">Finished</th>
                      <th className="px-3 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {/* Dummy list of cabins processed in this station */}
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => {
                      const isFirst = i === 1;
                      const isActive = isFirst && sheetStation.status !== 'idle' && sheetStation.status !== 'maintenance';
                      
                      return (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-semibold text-primary">CAB-240930-{1800 + i * 7 + (sheetStation.code.charCodeAt(0))}</td>
                          <td className="px-3 py-2 text-muted-foreground">0{7 + i}:1{i}</td>
                          <td className="px-3 py-2 text-muted-foreground">{isActive ? '—' : `0${7 + i}:2${i + 5}`}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold ${isActive ? "bg-info-soft text-info" : "bg-success-soft text-success"}`}>
                              {isActive ? "Processing" : "Completed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function SumCard({ icon: Icon, label, value, color }: { icon: typeof CheckCircle2; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm">
      <Icon className={`h-5 w-5 shrink-0 ${color}`} />
      <div><p className="text-[10px] text-muted-foreground">{label}</p><p className={`font-display text-lg font-bold ${color}`}>{value}</p></div>
    </div>
  );
}

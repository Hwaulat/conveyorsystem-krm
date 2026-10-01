import { useState, useMemo, Fragment } from "react";
import { Search as SearchInput } from "@/components/ui/search-input";
import { TableLayout } from "@/components/ui/table-layout";
import { StatCardGrid } from "@/components/ui/stat-card";
import { SelectInput } from "@/components/ui/select-input";
import {
  ArrowUpDown,
  Calendar,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Search,
} from "lucide-react";
import type { Cabin } from "./shared-types";
import { PanelTitle, StatusBadge } from "./DashboardView";

type HistoryCabin = {
  serial: string;
  model: string;
  color: string;
  code: string;
  lot: string;
  entryTime: string;
  exitTime: string | null;
  totalTime: string;
  stationsVisited: number;
  status: "Completed" | "In Progress" | "Exception";
  timeline: { area: string; station: string; arrived: string; started: string; finished: string | null; duration: string; status: "done" | "active" | "skipped" }[];
};

const historyCabins: HistoryCabin[] = [
  {
    serial: "CAB-240930-1842", model: "FH16", color: "Midnight Black", code: "BLK-02", lot: "L2409-17",
    entryTime: "06:14:22", exitTime: "11:48:35", totalTime: "5h 34m", stationsVisited: 20, status: "Completed",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "06:14", started: "06:18", finished: "06:32", duration: "14m", status: "done" },
      { area: "PTED", station: "PT-02", arrived: "06:34", started: "06:36", finished: "06:48", duration: "12m", status: "done" },
      { area: "PTED", station: "PT-03", arrived: "06:50", started: "06:52", finished: "07:08", duration: "16m", status: "done" },
      { area: "PTED", station: "PT-04", arrived: "07:10", started: "07:12", finished: "07:29", duration: "17m", status: "done" },
      { area: "Sanding", station: "SD-01", arrived: "07:32", started: "07:35", finished: "07:48", duration: "13m", status: "done" },
      { area: "Sanding", station: "SD-02", arrived: "07:50", started: "07:53", finished: "08:07", duration: "14m", status: "done" },
    ],
  },
  {
    serial: "CAB-240930-1845", model: "FM", color: "Sapphire Blue", code: "BLU-08", lot: "L2409-17",
    entryTime: "07:02:11", exitTime: "12:41:08", totalTime: "5h 39m", stationsVisited: 20, status: "Completed",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "07:02", started: "07:05", finished: "07:19", duration: "14m", status: "done" },
      { area: "PTED", station: "PT-02", arrived: "07:21", started: "07:23", finished: "07:36", duration: "13m", status: "done" },
    ],
  },
  {
    serial: "CAB-240930-1847", model: "FMX", color: "Arctic White", code: "WHT-01", lot: "L2409-18",
    entryTime: "08:15:03", exitTime: null, totalTime: "9h 10m", stationsVisited: 11, status: "In Progress",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "08:15", started: "08:18", finished: "08:33", duration: "15m", status: "done" },
      { area: "PTED", station: "PT-02", arrived: "08:35", started: "08:38", finished: "08:50", duration: "12m", status: "done" },
      { area: "PTED", station: "PT-03", arrived: "08:52", started: "08:55", finished: "09:12", duration: "17m", status: "done" },
      { area: "PTED", station: "PT-04", arrived: "09:14", started: "09:16", finished: "09:30", duration: "14m", status: "done" },
      { area: "Sealing", station: "SL-03", arrived: "16:43", started: "16:47", finished: null, duration: "31m 42s", status: "active" },
    ],
  },
  {
    serial: "CAB-240930-1852", model: "FH16", color: "Ocean Blue", code: "BLU-12", lot: "L2409-18",
    entryTime: "09:30:45", exitTime: null, totalTime: "7h 55m", stationsVisited: 14, status: "In Progress",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "09:30", started: "09:33", finished: "09:47", duration: "14m", status: "done" },
      { area: "Topcoat", station: "TC-02", arrived: "17:14", started: "17:16", finished: null, duration: "09m 18s", status: "active" },
    ],
  },
  {
    serial: "CAB-240930-1861", model: "FM", color: "Graphite", code: "GRY-07", lot: "L2409-19",
    entryTime: "10:42:18", exitTime: null, totalTime: "6h 43m", stationsVisited: 8, status: "In Progress",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "10:42", started: "10:45", finished: "10:59", duration: "14m", status: "done" },
      { area: "Sanding", station: "SD-04", arrived: "17:18", started: null!, finished: null, duration: "06m 51s", status: "active" },
    ],
  },
  {
    serial: "CAB-240930-1864", model: "FMX", color: "Signal Red", code: "RED-04", lot: "L2409-19",
    entryTime: "11:08:34", exitTime: null, totalTime: "6h 17m", stationsVisited: 3, status: "In Progress",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "11:08", started: "11:11", finished: "11:25", duration: "14m", status: "done" },
      { area: "PTED", station: "PT-03", arrived: "17:20", started: "17:21", finished: null, duration: "04m 06s", status: "active" },
    ],
  },
  {
    serial: "CAB-240930-1838", model: "FMX", color: "Forest Green", code: "GRN-03", lot: "L2409-16",
    entryTime: "05:02:44", exitTime: "10:18:52", totalTime: "5h 16m", stationsVisited: 18, status: "Exception",
    timeline: [
      { area: "PTED", station: "PT-01", arrived: "05:02", started: "05:05", finished: "05:18", duration: "13m", status: "done" },
      { area: "Sanding", station: "SD-02", arrived: "06:48", started: "06:51", finished: null, duration: "—", status: "skipped" },
      { area: "Sanding", station: "SD-03", arrived: "07:02", started: "07:05", finished: "07:18", duration: "13m", status: "done" },
    ],
  },
];

export function CabinHistoryView({ onSelectCabin, cabins }: { onSelectCabin: (c: Cabin) => void; cabins: Cabin[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Completed" | "In Progress" | "Exception">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    return historyCabins
      .filter(c => statusFilter === "All" || c.status === statusFilter)
      .filter(c => !needle || c.serial.toLowerCase().includes(needle) || c.model.toLowerCase().includes(needle) || c.color.toLowerCase().includes(needle) || c.lot.toLowerCase().includes(needle))
      .sort((a, b) => sortAsc ? a.entryTime.localeCompare(b.entryTime) : b.entryTime.localeCompare(a.entryTime));
  }, [query, statusFilter, sortAsc]);

  const completed = historyCabins.filter(c => c.status === "Completed").length;
  const inProgress = historyCabins.filter(c => c.status === "In Progress").length;
  const exceptions = historyCabins.filter(c => c.status === "Exception").length;

  return (
    <>
      {/* summary strip */}
      <div className="mb-5">
        <StatCardGrid
          columns={3}
          items={[
            { title: "Completed", value: completed, valueColor: "text-success" },
            { title: "In Progress", value: inProgress, valueColor: "text-info" },
            { title: "Exceptions", value: exceptions, valueColor: "text-destructive" },
          ]}
        />
      </div>

      {/* table section */}
      <TableLayout
        totalItems={filtered.length}
        toolbarFilters={
          <>
            <div className="flex-1 min-w-[200px]">
              <SearchInput value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by item name..." />
            </div>
            <div className="w-[180px]">
              <SelectInput
                datalist={[
                  { label: "All Status", value: "All" },
                  { label: "Completed", value: "Completed" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Exception", value: "Exception" },
                ]}
                defValue={statusFilter}
                onChange={(val) => val && setStatusFilter(val as any)}
                hideClear
              />
            </div>
          </>
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F9FA] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Serial / Details</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Entry</th>
              <th className="px-4 py-3 text-right font-medium">Exit</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Stations</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y bg-card text-xs">
            {filtered.map(cab => {
              const isExpanded = expanded === cab.serial;
              const statusColor = cab.status === "Completed" ? "bg-success-soft text-success" : cab.status === "In Progress" ? "bg-info-soft text-info" : "bg-danger-soft text-destructive";
              
              return (
                <Fragment key={cab.serial}>
                  <tr 
                    onClick={() => setExpanded(isExpanded ? null : cab.serial)} 
                    className="group cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="font-display font-bold text-foreground">{cab.serial}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{cab.model} · {cab.color} ({cab.code}) · Lot {cab.lot}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${statusColor}`}>{cab.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{cab.entryTime}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{cab.exitTime ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{cab.totalTime}</td>
                    <td className="px-4 py-3 text-right font-medium">{cab.stationsVisited}</td>
                    <td className="px-4 py-3 text-center">
                      <ChevronRight className={`inline-block h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={7} className="p-0">
                        <div className="border-l-2 border-primary p-4 px-8">
                          <h3 className="mb-3 font-display text-xs font-semibold">Station timeline</h3>
                          <div className="space-y-0">
                            {cab.timeline.map((step, i) => (
                              <div key={`${step.station}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                                <div className={`relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full ${step.status === "done" ? "bg-success" : step.status === "active" ? "bg-primary cabin-pulse" : "bg-muted-foreground"}`} />
                                {i < cab.timeline.length - 1 && <div className="absolute bottom-0 left-[5px] top-3 w-px bg-border" />}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <b className="text-xs">{step.area}</b>
                                      <span className="ml-2 text-[10px] text-muted-foreground">{step.station}</span>
                                    </div>
                                    <span className="text-xs font-semibold tabular-nums">{step.duration}</span>
                                  </div>
                                  <div className="mt-0.5 flex gap-3 text-[10px] text-muted-foreground">
                                    <span>Arrived {step.arrived}</span>
                                    <span>Started {step.started ?? "—"}</span>
                                    <span>Finished {step.finished ?? "—"}</span>
                                    <span className={`font-semibold ${step.status === "done" ? "text-success" : step.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
                                      {step.status === "done" ? "✓ Departed" : step.status === "active" ? "● Active" : "⊘ Skipped"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-xs text-muted-foreground">No cabins match your search criteria</p>}
      </TableLayout>
    </>
  );
}

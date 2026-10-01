import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { PanelTitle } from "./DashboardView";
import { SelectInput } from "@/components/ui/select-input";
import { StatCardGrid } from "@/components/ui/stat-card";
import { TableLayout } from "@/components/ui/table-layout";
import { Fragment } from "react";

type Exception = {
  id: string;
  type: "delayed" | "sequence_violation" | "missed_scan" | "duplicate_scan" | "void";
  severity: "critical" | "warning" | "info";
  cabin: string;
  station: string;
  area: string;
  description: string;
  detectedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  details: string;
};

const exceptions: Exception[] = [
  {
    id: "EXC-001", type: "delayed", severity: "critical",
    cabin: "CAB-240930-1847", station: "SL-03", area: "Sealing",
    description: "Cabin exceeded target time by 9m 42s",
    detectedAt: "17:08:24", resolvedAt: null, resolvedBy: null,
    details: "Target: 22m · Actual: 31m 42s · Exterior seal process running over expected duration. Possible cause: nozzle blockage or material viscosity issue.",
  },
  {
    id: "EXC-002", type: "delayed", severity: "critical",
    cabin: "CAB-240930-1877", station: "TC-04", area: "Topcoat",
    description: "Cabin exceeded target time by 4m 16s",
    detectedAt: "16:56:47", resolvedAt: null, resolvedBy: null,
    details: "Target: 28m · Actual: 32m 16s · Flash-off taking longer than expected. Ambient temperature 2°C below normal range.",
  },
  {
    id: "EXC-003", type: "delayed", severity: "warning",
    cabin: "CAB-240930-1867", station: "SD-02", area: "Sanding",
    description: "Cabin exceeded target time by 2m 08s",
    detectedAt: "17:18:09", resolvedAt: null, resolvedBy: null,
    details: "Target: 14m · Actual: 16m 08s · Minor delay due to operator changeover.",
  },
  {
    id: "EXC-004", type: "sequence_violation", severity: "warning",
    cabin: "CAB-240930-1838", station: "SD-02", area: "Sanding",
    description: "Station SD-02 was skipped in sequence",
    detectedAt: "06:48:33", resolvedAt: "07:15:22", resolvedBy: "supervisor_mk",
    details: "Cabin moved from SD-01 directly to SD-03, bypassing SD-02. Supervisor approved exception — sanding step not required for this color type (Forest Green GRN-03).",
  },
  {
    id: "EXC-005", type: "missed_scan", severity: "info",
    cabin: "CAB-240930-1870", station: "PT-01", area: "PTED",
    description: "FINISH scan missing at PT-01",
    detectedAt: "17:17:39", resolvedAt: null, resolvedBy: null,
    details: "Cabin arrived at next station without FINISH scan recorded. Manual verification needed.",
  },
  {
    id: "EXC-006", type: "duplicate_scan", severity: "info",
    cabin: "CAB-240930-1864", station: "PT-03", area: "PTED",
    description: "Duplicate ARRIVE scan detected",
    detectedAt: "17:20:51", resolvedAt: "17:21:05", resolvedBy: "system",
    details: "Two ARRIVE events recorded within 3 seconds. Auto-voided the duplicate.",
  },
  {
    id: "EXC-007", type: "void", severity: "info",
    cabin: "CAB-240930-1866", station: "SD-01", area: "Sanding",
    description: "Scan event voided by supervisor",
    detectedAt: "15:42:18", resolvedAt: "15:44:30", resolvedBy: "supervisor_mk",
    details: "Incorrect START scan voided. Cabin had not actually begun processing at SD-01. Corrected with new event.",
  },
];

const typeLabels: Record<Exception["type"], string> = {
  delayed: "Delayed",
  sequence_violation: "Sequence Violation",
  missed_scan: "Missed Scan",
  duplicate_scan: "Duplicate Scan",
  void: "Void",
};

export function ExceptionsView() {
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "resolved">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = exceptions.filter(e => {
    if (statusFilter === "open" && e.resolvedAt) return false;
    if (statusFilter === "resolved" && !e.resolvedAt) return false;
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    return true;
  });

  const openCount = exceptions.filter(e => !e.resolvedAt).length;
  const criticalCount = exceptions.filter(e => e.severity === "critical" && !e.resolvedAt).length;
  const resolvedToday = exceptions.filter(e => e.resolvedAt).length;

  return (
    <>
      {/* summary */}
      <div className="mb-5">
        <StatCardGrid
          columns={4}
          items={[
            { title: "Open", value: openCount, valueColor: "text-destructive", variant: "stat" },
            { title: "Critical", value: criticalCount, valueColor: "text-destructive", variant: "stat" },
            { title: "Resolved today", value: resolvedToday, valueColor: "text-success", variant: "stat" },
            { title: "Total", value: exceptions.length, variant: "stat" },
          ]}
        />
      </div>

      {/* table section */}
      <TableLayout
        totalItems={filtered.length}
        hideDateRange
        toolbarFilters={
          <>
            <div className="w-[150px]">
              <SelectInput
                datalist={[
                  { label: "All Status", value: "all" },
                  { label: "Open", value: "open" },
                  { label: "Resolved", value: "resolved" },
                ]}
                defValue={statusFilter}
                onChange={(val) => val && setStatusFilter(val as any)}
                hideClear
              />
            </div>
            <div className="w-[150px]">
              <SelectInput
                datalist={[
                  { label: "All Severity", value: "all" },
                  { label: "Critical", value: "critical" },
                  { label: "Warning", value: "warning" },
                  { label: "Info", value: "info" },
                ]}
                defValue={severityFilter}
                onChange={(val) => val && setSeverityFilter(val as any)}
                hideClear
              />
            </div>
          </>
        }
      >
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F9FA] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground dark:bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Exception ID & Details</th>
              <th className="px-4 py-3 font-medium">Cabin & Station</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y bg-card text-xs">
            {filtered.map(exc => {
              const isExpanded = expanded === exc.id;
              
              return (
                <Fragment key={exc.id}>
                  <tr 
                    onClick={() => setExpanded(isExpanded ? null : exc.id)} 
                    className={`group cursor-pointer transition-colors hover:bg-muted/40 ${exc.severity === "critical" && !exc.resolvedAt ? "bg-danger-soft/10" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-display font-bold text-foreground">{exc.id}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{exc.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{exc.cabin}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{exc.area} → {exc.station}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${exc.severity === "critical" ? "bg-danger-soft text-destructive" : exc.severity === "warning" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"}`}>{exc.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{typeLabels[exc.type]}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {exc.resolvedAt ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success"><CheckCircle2 className="h-3 w-3" />Resolved</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-danger-soft px-2 py-0.5 text-[10px] font-semibold text-destructive"><AlertTriangle className="h-3 w-3" />Open</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ChevronRight className={`inline-block h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-muted/10">
                      <td colSpan={6} className="p-0">
                        <div className={`border-l-2 p-4 px-8 ${exc.severity === "critical" ? "border-destructive" : exc.severity === "warning" ? "border-warning" : "border-info"}`}>
                          <div className="mb-3 rounded-md bg-muted/50 p-3 text-xs leading-relaxed">{exc.details}</div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-[10px]">
                            <div><span className="text-muted-foreground">Detected</span><p className="font-semibold">{exc.detectedAt}</p></div>
                            <div><span className="text-muted-foreground">Resolved</span><p className="font-semibold">{exc.resolvedAt ?? "Pending"}</p></div>
                            {exc.resolvedBy && <div><span className="text-muted-foreground">Resolved By</span><p className="font-semibold">{exc.resolvedBy}</p></div>}
                          </div>
                          {!exc.resolvedAt && (
                            <div className="mt-4 flex gap-2">
                              <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                <CheckCircle2 className="h-3.5 w-3.5" />Resolve
                              </button>
                              <button className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-[11px] font-semibold hover:bg-muted transition-colors">
                                <XCircle className="h-3.5 w-3.5" />Void scan
                              </button>
                              <button className="flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-[11px] font-semibold hover:bg-muted transition-colors">
                                <ArrowRight className="h-3.5 w-3.5" />View cabin
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                  No exceptions match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableLayout>
    </>
  );
}

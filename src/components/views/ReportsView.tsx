import { useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock3,
  Download,
  FileBarChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PanelTitle } from "./DashboardView";
import { SelectInput } from "@/components/ui/select-input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ReportPeriod = "today" | "week" | "month";

const throughputData = {
  today: [
    { hour: "06:00", count: 8 }, { hour: "07:00", count: 12 }, { hour: "08:00", count: 15 },
    { hour: "09:00", count: 14 }, { hour: "10:00", count: 16 }, { hour: "11:00", count: 13 },
    { hour: "12:00", count: 8 }, { hour: "13:00", count: 14 }, { hour: "14:00", count: 15 },
    { hour: "15:00", count: 16 }, { hour: "16:00", count: 12 }, { hour: "17:00", count: 5 },
  ],
  week: [
    { hour: "Mon", count: 118 }, { hour: "Tue", count: 124 }, { hour: "Wed", count: 112 },
    { hour: "Thu", count: 131 }, { hour: "Fri", count: 128 }, { hour: "Sat", count: 65 },
  ],
  month: [
    { hour: "W1", count: 620 }, { hour: "W2", count: 645 }, { hour: "W3", count: 598 },
    { hour: "W4", count: 670 },
  ],
};

const cycleTimeByArea = [
  { area: "PTED", avg: "15m 22s", target: "18m", variance: -14.6, trend: "down" },
  { area: "Sanding", avg: "12m 44s", target: "14m", variance: -9.0, trend: "down" },
  { area: "Sealing", avg: "23m 18s", target: "22m", variance: +5.9, trend: "up" },
  { area: "Topcoat", avg: "25m 41s", target: "28m", variance: -8.3, trend: "down" },
  { area: "Touch-up", avg: "9m 10s", target: "12m", variance: -23.6, trend: "down" },
];

const shiftSummary = [
  { shift: "Shift 1 (06:00–14:00)", completed: 82, target: 88, efficiency: 93.2, exceptions: 2, avgCycle: "14m 08s" },
  { shift: "Shift 2 (14:00–22:00)", completed: 36, target: 44, efficiency: 81.8, exceptions: 3, avgCycle: "16m 33s" },
  { shift: "Shift 3 (22:00–06:00)", completed: 0, target: 40, efficiency: 0, exceptions: 0, avgCycle: "—" },
];

const dailyProduction = [
  { date: "Sep 30", produced: 118, target: 128, defects: 3, oee: 88.2 },
  { date: "Sep 29", produced: 124, target: 128, defects: 2, oee: 91.5 },
  { date: "Sep 28", produced: 112, target: 128, defects: 5, oee: 83.1 },
  { date: "Sep 27", produced: 131, target: 128, defects: 1, oee: 96.4 },
  { date: "Sep 26", produced: 128, target: 128, defects: 2, oee: 93.8 },
  { date: "Sep 25", produced: 119, target: 128, defects: 4, oee: 86.3 },
  { date: "Sep 24", produced: 125, target: 128, defects: 2, oee: 92.1 },
];

export function ReportsView() {
  const [period, setPeriod] = useState<ReportPeriod>("today");
  const data = throughputData[period];
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <>
      {/* period selector */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-[150px]">
          <SelectInput
            datalist={[
              { label: "Today", value: "today" },
              { label: "This Week", value: "week" },
              { label: "This Month", value: "month" },
            ]}
            defValue={period}
            onChange={(val) => val && setPeriod(val as any)}
            hideClear
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>September 30, 2026</span>
        </div>
        <button className="ml-auto flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-[11px] hover:bg-muted">
          <Download className="h-3.5 w-3.5" />Export PDF
        </button>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total produced" value="118" change="+4.4%" positive />
        <KpiCard label="Avg. cycle time" value="15m 38s" change="-6.2%" positive />
        <KpiCard label="OEE" value="88.2%" change="-3.3%" positive={false} />
        <KpiCard label="Exceptions" value="5" change="+2" positive={false} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* throughput chart */}
        <section className="overflow-hidden rounded-md border bg-card shadow-sm">
          <PanelTitle title="Throughput" subtitle={`Cabins completed per ${period === "today" ? "hour" : period === "week" ? "day" : "week"}`} action={`${data.reduce((s, d) => s + d.count, 0)} total`} />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  label={{ value: period === "today" ? "Hours" : "Days", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Total", angle: -90, position: "insideLeft", offset: 16, fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* cycle time by area */}
        <section className="overflow-hidden rounded-md border bg-card shadow-sm">
          <PanelTitle title="Cycle time by area" subtitle="Average vs target" action="5 areas" />
          <div className="divide-y">
            {cycleTimeByArea.map(a => (
              <div key={a.area} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs font-semibold">{a.area}</span>
                    <div className="flex items-center gap-1.5">
                      {a.trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-success" /> : <TrendingUp className="h-3.5 w-3.5 text-destructive" />}
                      <span className={`text-[10px] font-semibold ${a.variance < 0 ? "text-success" : "text-destructive"}`}>{a.variance > 0 ? "+" : ""}{a.variance}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Avg: <b className="text-foreground">{a.avg}</b></span>
                    <span>Target: {a.target}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${a.variance > 0 ? "bg-destructive" : "bg-success"}`} style={{ width: `${Math.min(100, 100 - Math.abs(a.variance))}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* shift summary */}
      <section className="mt-5 overflow-hidden rounded-md border bg-card shadow-sm">
        <PanelTitle title="Shift summary" subtitle="Production by shift" action="Today" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Efficiency</th>
                <th className="px-4 py-3">Avg. Cycle</th>
                <th className="px-4 py-3 text-right">Exceptions</th>
              </tr>
            </thead>
            <tbody>
              {shiftSummary.map(s => (
                <tr key={s.shift} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{s.shift}</td>
                  <td className="px-4 py-3">{s.completed}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.target}</td>
                  <td className="px-4 py-3"><span className={`font-semibold ${s.efficiency >= 90 ? "text-success" : s.efficiency >= 80 ? "text-warning" : "text-muted-foreground"}`}>{s.efficiency}%</span></td>
                  <td className="px-4 py-3 tabular-nums">{s.avgCycle}</td>
                  <td className="px-4 py-3 text-right">{s.exceptions > 0 ? <span className="text-destructive font-semibold">{s.exceptions}</span> : <span className="text-muted-foreground">0</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* daily production */}
      <section className="mt-5 overflow-hidden rounded-md border bg-card shadow-sm">
        <PanelTitle title="Daily production" subtitle="Last 7 days" action="View all" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Produced</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Defects</th>
                <th className="px-4 py-3">OEE</th>
                <th className="px-4 py-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody>
              {dailyProduction.map(d => (
                <tr key={d.date} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-semibold">{d.date}</td>
                  <td className="px-4 py-3">{d.produced}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.target}</td>
                  <td className="px-4 py-3">{d.defects > 3 ? <span className="text-destructive font-semibold">{d.defects}</span> : d.defects}</td>
                  <td className="px-4 py-3"><span className={`font-semibold ${d.oee >= 90 ? "text-success" : d.oee >= 85 ? "text-warning" : "text-destructive"}`}>{d.oee}%</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${d.produced >= d.target ? "bg-success" : "bg-primary"}`} style={{ width: `${Math.min(100, (d.produced / d.target) * 100)}%` }} /></div>
                      <span className="tabular-nums font-semibold">{Math.round((d.produced / d.target) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function KpiCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="rounded-md border bg-card p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${positive ? "text-success" : "text-destructive"}`}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{change}
      </p>
    </div>
  );
}

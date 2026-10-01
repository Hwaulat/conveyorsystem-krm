import { useState } from "react";
import {
  Boxes,
  ChevronDown,
  Edit2,
  Layers,
  Plus,
  ScanLine,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { PanelTitle } from "./DashboardView";
import { Search as SearchInput } from "@/components/ui/search-input";
import { CustomTabs } from "@/components/ui/custom-tabs";

type Tab = "areas" | "stations" | "cabins" | "scanners";

/* ─── Demo data ─── */

const demoAreas = [
  { id: "10000000-0000-0000-0000-000000000001", name: "PTED", sequence: 1, stationCount: 4, cabinCount: 12 },
  { id: "10000000-0000-0000-0000-000000000002", name: "Sanding", sequence: 2, stationCount: 4, cabinCount: 9 },
  { id: "10000000-0000-0000-0000-000000000003", name: "Sealing", sequence: 3, stationCount: 4, cabinCount: 15 },
  { id: "10000000-0000-0000-0000-000000000004", name: "Topcoat", sequence: 4, stationCount: 5, cabinCount: 11 },
  { id: "10000000-0000-0000-0000-000000000005", name: "Touch-up", sequence: 5, stationCount: 3, cabinCount: 6 },
];

const demoStations = [
  { code: "PT-01", name: "Pre-treatment 1", area: "PTED", sequence: 1, target: "18m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "PT-02", name: "Pre-treatment 2", area: "PTED", sequence: 2, target: "18m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "PT-03", name: "E-coat", area: "PTED", sequence: 3, target: "18m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "PT-04", name: "Oven", area: "PTED", sequence: 4, target: "18m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SD-01", name: "Sanding 1", area: "Sanding", sequence: 1, target: "14m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SD-02", name: "Sanding 2", area: "Sanding", sequence: 2, target: "14m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SD-03", name: "Dust removal", area: "Sanding", sequence: 3, target: "14m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SD-04", name: "Inspection", area: "Sanding", sequence: 4, target: "14m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SL-01", name: "Sealer prep", area: "Sealing", sequence: 1, target: "22m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SL-02", name: "Interior seal", area: "Sealing", sequence: 2, target: "22m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SL-03", name: "Exterior seal", area: "Sealing", sequence: 3, target: "22m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "SL-04", name: "Sealer oven", area: "Sealing", sequence: 4, target: "22m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TC-01", name: "Primer", area: "Topcoat", sequence: 1, target: "28m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TC-02", name: "Basecoat", area: "Topcoat", sequence: 2, target: "28m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TC-03", name: "Clearcoat", area: "Topcoat", sequence: 3, target: "28m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TC-04", name: "Flash-off", area: "Topcoat", sequence: 4, target: "28m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TC-05", name: "Topcoat oven", area: "Topcoat", sequence: 5, target: "28m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TU-01", name: "Inspection", area: "Touch-up", sequence: 1, target: "12m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TU-02", name: "Touch-up", area: "Touch-up", sequence: 2, target: "12m", active: true, events: ["ARRIVE", "START", "FINISH"] },
  { code: "TU-03", name: "Final release", area: "Touch-up", sequence: 3, target: "12m", active: false, events: ["ARRIVE", "FINISH"] },
];

const demoCabins = [
  { serial: "CAB-240930-1847", model: "FMX", color: "Arctic White", code: "WHT-01", lot: "L2409-18" },
  { serial: "CAB-240930-1852", model: "FH16", color: "Ocean Blue", code: "BLU-12", lot: "L2409-18" },
  { serial: "CAB-240930-1861", model: "FM", color: "Graphite", code: "GRY-07", lot: "L2409-19" },
  { serial: "CAB-240930-1864", model: "FMX", color: "Signal Red", code: "RED-04", lot: "L2409-19" },
  { serial: "CAB-240930-1838", model: "FMX", color: "Forest Green", code: "GRN-03", lot: "L2409-16" },
  { serial: "CAB-240930-1842", model: "FH16", color: "Midnight Black", code: "BLK-02", lot: "L2409-17" },
  { serial: "CAB-240930-1845", model: "FM", color: "Sapphire Blue", code: "BLU-08", lot: "L2409-17" },
];

const demoScanners = [
  { id: "s1", name: "Scanner PT-03-A", station: "PT-03", active: true, lastSeen: "17:24:51" },
  { id: "s2", name: "Scanner SL-03-A", station: "SL-03", active: true, lastSeen: "17:18:24" },
  { id: "s3", name: "Scanner TC-02-A", station: "TC-02", active: true, lastSeen: "17:23:38" },
  { id: "s4", name: "Scanner SD-04-A", station: "SD-04", active: true, lastSeen: "17:22:09" },
  { id: "s5", name: "Scanner TU-01-A", station: "TU-01", active: false, lastSeen: "16:45:12" },
];

const tabs: { key: Tab; label: string; icon: typeof Boxes; count: number }[] = [
  { key: "areas", label: "Areas", icon: Layers, count: demoAreas.length },
  { key: "stations", label: "Stations", icon: Settings2, count: demoStations.length },
  { key: "cabins", label: "Cabins", icon: Boxes, count: demoCabins.length },
  { key: "scanners", label: "Scanners", icon: ScanLine, count: demoScanners.length },
];

export function MasterDataView() {
  const [activeTab, setActiveTab] = useState<Tab>("areas");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <CustomTabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as Tab);
          setSearchQuery("");
        }}
        variant="primary"
        rightElement={
          <div className="flex items-center gap-2">
            <div className="w-48">
              <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." />
            </div>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-3.5 w-3.5" />Add {activeTab.slice(0, -1)}
            </button>
          </div>
        }
        items={tabs.map((t) => {
          const Icon = t.icon;
          let content = null;
          if (t.key === "areas") content = <AreasTable query={searchQuery} />;
          if (t.key === "stations") content = <StationsTable query={searchQuery} />;
          if (t.key === "cabins") content = <CabinsTable query={searchQuery} />;
          if (t.key === "scanners") content = <ScannersTable query={searchQuery} />;

          return {
            value: t.key,
            label: t.label,
            badge: t.count,
            icon: <Icon />,
            content,
          };
        })}
      />
    </>
  );
}

function AreasTable({ query }: { query: string }) {
  const filtered = demoAreas.filter(a => !query || a.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="overflow-hidden rounded-md border bg-card shadow-sm">
      <PanelTitle title="Areas" subtitle={`${filtered.length} production areas`} action="Manage sequence" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Seq</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Stations</th><th className="px-4 py-3">Active Cabins</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-t hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{a.sequence}</span></td>
                <td className="px-4 py-3 font-semibold">{a.name}</td>
                <td className="px-4 py-3">{a.stationCount}</td>
                <td className="px-4 py-3">{a.cabinCount}</td>
                <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="grid h-8 w-8 place-items-center rounded hover:bg-muted" title="Edit"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StationsTable({ query }: { query: string }) {
  const filtered = demoStations.filter(s => !query || s.code.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()) || s.area.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="overflow-hidden rounded-md border bg-card shadow-sm">
      <PanelTitle title="Stations" subtitle={`${filtered.length} stations across all areas`} action="Bulk edit" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Seq</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Events</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.code} className="border-t hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-semibold">{s.code}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-primary font-semibold">{s.area}</td>
                <td className="px-4 py-3">{s.sequence}</td>
                <td className="px-4 py-3 tabular-nums">{s.target}</td>
                <td className="px-4 py-3"><div className="flex gap-1">{s.events.map(e => <span key={e} className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold">{e}</span>)}</div></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${s.active ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{s.active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="grid h-8 w-8 place-items-center rounded hover:bg-muted" title="Edit"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CabinsTable({ query }: { query: string }) {
  const filtered = demoCabins.filter(c => !query || c.serial.toLowerCase().includes(query.toLowerCase()) || c.model.toLowerCase().includes(query.toLowerCase()) || c.color.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="overflow-hidden rounded-md border bg-card shadow-sm">
      <PanelTitle title="Cabins" subtitle={`${filtered.length} registered cabins`} action="Import CSV" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Serial</th><th className="px-4 py-3">Model</th><th className="px-4 py-3">Color</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Lot</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.serial} className="border-t hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-semibold">{c.serial}</td>
                <td className="px-4 py-3">{c.model}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border" style={{ backgroundColor: colorMap[c.code] ?? "#888" }} />{c.color}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{c.code}</td>
                <td className="px-4 py-3">{c.lot}</td>
                <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="grid h-8 w-8 place-items-center rounded hover:bg-muted" title="Edit"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScannersTable({ query }: { query: string }) {
  const filtered = demoScanners.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.station.toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="overflow-hidden rounded-md border bg-card shadow-sm">
      <PanelTitle title="Scanners" subtitle={`${filtered.length} registered devices`} action="Register new" />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Station</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-primary font-semibold">{s.station}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${s.active ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{s.active ? "Online" : "Offline"}</span></td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{s.lastSeen}</td>
                <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="grid h-8 w-8 place-items-center rounded hover:bg-muted" title="Edit"><Edit2 className="h-3.5 w-3.5 text-muted-foreground" /></button><button className="grid h-8 w-8 place-items-center rounded hover:bg-destructive/10" title="Revoke"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const colorMap: Record<string, string> = {
  "WHT-01": "#f0f0f0",
  "BLU-12": "#1e60a0",
  "GRY-07": "#666",
  "RED-04": "#cc2020",
  "GRN-03": "#2d7a3a",
  "BLK-02": "#222",
  "BLU-08": "#2244aa",
};

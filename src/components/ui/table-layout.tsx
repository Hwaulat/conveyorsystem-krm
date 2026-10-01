import { ReactNode } from "react";
import { Calendar } from "lucide-react";
import { SelectInput } from "@/components/ui/select-input";

interface TableLayoutProps {
  toolbarFilters: ReactNode;
  children: ReactNode;
  totalItems: number;
  hideDateRange?: boolean;
  header?: ReactNode;
}

export function TableLayout({ toolbarFilters, children, totalItems, hideDateRange, header }: TableLayoutProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
      {header && <div className="border-b">{header}</div>}
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        {toolbarFilters}
        {!hideDateRange && (
          <div className="ml-auto flex h-10 w-[240px] items-center gap-2 rounded-lg border border-gray-200 bg-neutral-3 px-3 text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
            <Calendar className="h-4 w-4" />
            <span>dd/mm/yyyy - dd/mm/yyyy</span>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {children}
      </div>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between border-t p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>Rows per page</span>
          <div className="w-[75px]">
            <SelectInput 
              datalist={[{label:"10", value:"10"}, {label:"20", value:"20"}, {label:"50", value:"50"}]} 
              defValue="10" 
              hideClear 
            />
          </div>
          <span>1-{Math.min(10, totalItems)} of {totalItems}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-transparent hover:bg-muted disabled:opacity-50 text-muted-foreground" disabled>«</button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-transparent hover:bg-muted disabled:opacity-50 text-muted-foreground" disabled>‹</button>
          <button className="flex h-7 w-7 items-center justify-center rounded bg-[#1e40af] text-white font-medium">1</button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-transparent hover:bg-muted disabled:opacity-50 text-muted-foreground" disabled>›</button>
          <button className="flex h-7 w-7 items-center justify-center rounded border bg-transparent hover:bg-muted disabled:opacity-50 text-muted-foreground" disabled>»</button>
        </div>
      </div>
    </div>
  );
}

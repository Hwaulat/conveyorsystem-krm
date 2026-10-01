import { useState } from "react";
import {
  Edit2,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { SelectInput } from "@/components/ui/select-input";
import { Search } from "@/components/ui/search-input";
import { TableLayout } from "@/components/ui/table-layout";
import { StatCardGrid } from "@/components/ui/stat-card";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type AppUser = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  city: string;
  country: string;
  isActive: boolean;
};

const users: AppUser[] = [
  { id: "u1", displayName: "Khanan", email: "khanan@mail.com", role: "Operator", department: "MECHANICAL - ENTRY", position: "Operator", phone: "085710484690", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u2", displayName: "Heri Kiswanto", email: "heri-kiswanto@jsgi.co.id", role: "Group Head", department: "MECHANICAL - TECHNOLOGY", position: "Manager", phone: "0813-8236-2977", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u3", displayName: "Tester01", email: "tester01@gmail.com", role: "Warehouse", department: "MECHANICAL - DELIVERY", position: "Manager", phone: "085263547687", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u4", displayName: "Tester PIC", email: "qwerty@gmail.com", role: "PIC", department: "MECHANICAL - FURNACE", position: "Supervisor", phone: "081200000", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u5", displayName: "Aditya", email: "aditya@mail.com", role: "Operator", department: "MECHANICAL - DELIVERY", position: "Operator", phone: "081220212136", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u6", displayName: "Yuda", email: "muhammad.yuda@mail.co.id", role: "Operator", department: "MECHANICAL - UTILITY", position: "Operator", phone: "085172273580", city: "BEKASI", country: "INDONESIA", isActive: true },
  { id: "u7", displayName: "Fajar", email: "fajar@mail.com", role: "Operator", department: "MECHANICAL - ENTRY", position: "Operator", phone: "081234567890", city: "BEKASI", country: "INDONESIA", isActive: false },
];

export function UsersManagementView() {
  const [tab, setTab] = useState<string>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [posFilter, setPosFilter] = useState("all");

  const filteredUsers = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (deptFilter !== "all" && u.department !== deptFilter) return false;
    if (posFilter !== "all" && u.position !== posFilter) return false;
    const q = searchQuery.toLowerCase();
    if (q && !u.displayName.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <>


      <CustomTabs
        value={tab}
        onValueChange={setTab}
        variant="primary"
        items={[
          {
            value: "users",
            label: "User Account",
            content: (
              <>
                <div className="mb-5 mt-5">
                  <StatCardGrid
                    columns={3}
                    items={[
                      { title: "Total Users", value: users.length, icon: <Users className="h-5 w-5" />, valueColor: "text-primary", variant: "stat" },
                      { title: "Active Users", value: activeCount, icon: <UserCheck className="h-5 w-5" />, valueColor: "text-success", variant: "stat" },
                      { title: "Inactive Users", value: inactiveCount, icon: <UserX className="h-5 w-5" />, valueColor: "text-destructive", variant: "stat" },
                    ]}
                  />
                </div>
                
                <TableLayout
                  totalItems={filteredUsers.length}
                  hideDateRange
                  toolbarFilters={
                    <>
                      <div className="flex-1 min-w-[250px]">
                        <Search value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} placeholder="Search by username or email" />
                      </div>
                      <div className="w-[140px]">
                        <SelectInput
                          datalist={[{ label: "All Role", value: "all" }, ...Array.from(new Set(users.map(u => u.role))).map(r => ({ label: r, value: r }))]}
                          defValue={roleFilter}
                          onChange={(val) => val && setRoleFilter(val as string)}
                          hideClear
                        />
                      </div>
                      <div className="w-[160px]">
                        <SelectInput
                          datalist={[{ label: "All Department", value: "all" }, ...Array.from(new Set(users.map(u => u.department))).map(d => ({ label: d, value: d }))]}
                          defValue={deptFilter}
                          onChange={(val) => val && setDeptFilter(val as string)}
                          hideClear
                        />
                      </div>
                      <div className="w-[140px]">
                        <SelectInput
                          datalist={[{ label: "All Position", value: "all" }, ...Array.from(new Set(users.map(u => u.position))).map(p => ({ label: p, value: p }))]}
                          defValue={posFilter}
                          onChange={(val) => val && setPosFilter(val as string)}
                          hideClear
                        />
                      </div>
                      <Button variant="primary" icon={<Plus className="h-4 w-4" />} text="Create New User" />
                    </>
                  }
                >
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8F9FA] text-[10px] uppercase tracking-wider text-muted-foreground dark:bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-center">Action</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-card text-xs">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-t hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button variant="iconView" icon={<Eye className="size-4" />} title="View" />
                              <Button variant="iconView" icon={<RefreshCw className="size-4" />} title="Reset/Reload" />
                              <Button variant="iconEdit" icon={<Edit2 className="size-4" />} title="Edit" />
                              <Button variant="iconDelete" icon={<Trash2 className="size-4" />} title="Delete" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Switch checked={u.isActive} className={u.isActive ? "data-[state=checked]:bg-[#1e40af]" : ""} />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold">{u.displayName}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">{u.role}</td>
                          <td className="px-4 py-3">{u.department}</td>
                          <td className="px-4 py-3">{u.position}</td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TableLayout>
              </>
            ),
          },
          {
            value: "role",
            label: "Role Permission",
            content: (
              <div className="mt-5 p-8 text-center text-muted-foreground bg-card border rounded-lg shadow-sm">
                Role Permission settings will be displayed here.
              </div>
            ),
          },
        ]}
      />
    </>
  );
}


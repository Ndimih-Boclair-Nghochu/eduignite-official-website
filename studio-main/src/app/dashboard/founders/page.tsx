"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useExecutives } from "@/lib/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Crown,
  ShieldCheck,
  Mail,
  Smartphone,
  PieChart,
  History,
  Building2,
  Loader2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FOUNDER_ROLES = ["CEO", "CTO"];
const EXECUTIVE_ORDER = ["CEO", "CTO", "SUPER_ADMIN", "COO", "INV", "DESIGNER"];

type FounderRecord = {
  id: string;
  matricule: string;
  name: string;
  email: string;
  contact: string;
  role: string;
  avatar?: string;
  shares: string;
  relationship: string;
  isFounder: boolean;
  status: string;
  permissions: {
    manageSchools: boolean;
    manageTeam: boolean;
    viewAnalytics: boolean;
    manageSupport: boolean;
  };
};

const mapExecutiveRecord = (executive: any): FounderRecord => {
  const role = executive.role || "";
  const isFounder = FOUNDER_ROLES.includes(role);

  return {
    id: executive.id,
    matricule: executive.matricule || executive.id,
    name: executive.name || "",
    email: executive.email || "",
    contact: executive.phone || executive.whatsapp || "",
    role,
    avatar: executive.avatar,
    shares: role === "CEO" || role === "CTO" ? "50%" : "—",
    relationship:
      role === "CEO"
        ? "Co-Founder with equal ownership and full platform authority."
        : role === "CTO"
          ? "Co-Founder with equal ownership and full platform authority."
          : role === "SUPER_ADMIN"
            ? "Platform super administrator supporting founder governance."
            : role === "COO"
              ? "Executive operations leader reporting into the founder board."
              : role === "INV"
                ? "Strategic investor visible to the founder board."
                : "Executive design lead visible to the founder board.",
    isFounder,
    status: executive.is_active === false ? "Suspended" : "Active",
    permissions: {
      manageSchools: ["CEO", "CTO", "COO", "SUPER_ADMIN"].includes(role),
      manageTeam: ["CEO", "CTO", "SUPER_ADMIN"].includes(role),
      viewAnalytics: true,
      manageSupport: ["CEO", "CTO", "COO", "SUPER_ADMIN"].includes(role),
    },
  };
};

export default function FoundersManagementPage() {
  const { user } = useAuth();
  const { data: executivesData, isLoading: executivesLoading } = useExecutives();
  const [records, setRecords] = useState<FounderRecord[]>([]);

  const isFounderOwner = ["SUPER_ADMIN", "CEO", "CTO"].includes(user?.role || "");
  const executiveRecords = executivesData?.results ?? [];

  useEffect(() => {
    const mapped = executiveRecords.map(mapExecutiveRecord).sort((a, b) => {
      return EXECUTIVE_ORDER.indexOf(a.role) - EXECUTIVE_ORDER.indexOf(b.role);
    });
    setRecords(mapped);
  }, [executiveRecords]);

  const founders = useMemo(() => records.filter((record) => record.isFounder), [records]);
  const executiveMembers = useMemo(() => records.filter((record) => !record.isFounder), [records]);

  if (executivesLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-primary font-headline">
            <div className="rounded-xl bg-primary p-2 shadow-lg text-white">
              <Crown className="h-6 w-6 text-secondary" />
            </div>
            Founder Governance
          </h1>
          <p className="mt-1 text-muted-foreground">
            The CEO and CTO are protected co-founders with equal authority across the entire EduIgnite platform.
          </p>
        </div>
        <Badge className="h-10 w-fit rounded-xl bg-secondary/20 px-4 text-[10px] font-black uppercase tracking-widest text-primary">
          {records.length} Executive Accounts Visible
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {founders.map((founder) => (
          <Card key={founder.id} className="overflow-hidden rounded-[2.5rem] border-none bg-white shadow-xl">
            <CardHeader className="bg-primary p-8 text-white">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={founder.avatar} />
                  <AvatarFallback className="bg-white text-primary text-2xl font-black">
                    {founder.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">{founder.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-none bg-secondary px-4 py-1 text-[8px] font-black uppercase text-primary">Founder</Badge>
                    <Badge variant="secondary" className="border-none bg-white/10 px-4 py-1 text-[8px] font-black uppercase text-white">
                      {founder.role}
                    </Badge>
                    <Badge className="border-none bg-white px-4 py-1 text-[8px] font-black uppercase text-primary">
                      {founder.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ownership</p>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary/40" />
                    <span className="text-lg font-black text-primary">{founder.shares}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Matricule</p>
                  <p className="truncate text-sm font-mono font-bold text-primary/70">{founder.matricule}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-accent bg-accent/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Founder Relationship</p>
                <p className="mt-2 text-sm font-bold text-primary">{founder.relationship}</p>
                <p className="mt-2 text-[10px] font-bold text-primary/60">
                  Protected founder account: cannot be deleted, suspended, or downgraded by the other founder or any other role.
                </p>
              </div>

              <div className="space-y-3 border-t border-accent pt-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/5 p-2 text-primary/60">
                    <Mail className="h-4 w-4" />
                  </div>
                  <p className="truncate text-xs font-bold text-primary/80">{founder.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/5 p-2 text-primary/60">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-primary/80">{founder.contact || "No contact configured"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Manage Schools", active: founder.permissions.manageSchools },
                  { label: "Manage Team", active: founder.permissions.manageTeam },
                  { label: "View Analytics", active: founder.permissions.viewAnalytics },
                  { label: "Manage Support", active: founder.permissions.manageSupport },
                ].map((permission) => (
                  <div
                    key={permission.label}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest",
                      permission.active
                        ? "border-primary/10 bg-primary/5 text-primary"
                        : "border-accent bg-white text-muted-foreground"
                    )}
                  >
                    {permission.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] border-none bg-white shadow-sm">
        <CardHeader className="border-b bg-white p-8">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary">
            <Building2 className="h-6 w-6 text-secondary" />
            Executive Relationship Map
          </CardTitle>
          <CardDescription>
                    Everyone below is visible to both founder accounts, with the CEO and CTO always shown together as protected co-founders.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-b transition-colors hover:bg-primary/5 last:border-0">
                  <TableCell className="pl-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl border border-primary/10 bg-white p-2.5 shadow-sm">
                        {record.isFounder ? <Crown className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary/60" />}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-primary">{record.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">Role: {record.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-none text-[8px] font-black uppercase",
                        record.isFounder ? "bg-secondary/20 text-primary" : "bg-primary/5 text-primary"
                      )}
                    >
                      {record.isFounder ? "Protected Founder" : "Visible to Founder Board"}
                    </Badge>
                    <p className="mt-1 text-[9px] font-bold italic text-muted-foreground">{record.relationship}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-none bg-white shadow-sm">
        <CardHeader className="border-b bg-white p-8">
          <CardTitle className="flex items-center gap-2 text-xl font-black uppercase text-primary">
            <History className="h-6 w-6 text-secondary" />
            Founder Protection Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-8 md:grid-cols-3">
          {[
                    "CEO can see the CTO as the other founder and can view all platform-wide stats.",
                    "CTO can see the CEO as the other founder and can view the same founder-level platform scope.",
                    "Both founders share the same dashboard tab access across the platform executive workspace.",
            "Founder accounts are protected from deletion, suspension, role downgrade, and superuser removal.",
          ].map((rule) => (
            <div key={rule} className="rounded-2xl border border-accent bg-accent/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Founder Rule</span>
              </div>
              <p className="text-sm font-bold text-primary/80">{rule}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {!isFounderOwner && executiveMembers.length > 0 && (
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Founder-level destructive controls are intentionally hidden for non-founder roles.
        </div>
      )}
    </div>
  );
}

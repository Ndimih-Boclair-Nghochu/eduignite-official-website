"use client";

import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useExecutives,
  useFounders,
  useCreateFounder,
  useUpdateFounder,
  useAddFounderShares,
  useDeleteFounder,
} from "@/lib/hooks/useUsers";
import type { FounderProfile } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Crown,
  History,
  Loader2,
  Lock,
  Mail,
  Pencil,
  PieChart,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXECUTIVE_ORDER = ["CEO", "CTO", "SUPER_ADMIN", "COO", "INV", "DESIGNER"];
const FOUNDER_ROLE_OPTIONS = [
  { value: "COO", label: "COO" },
  { value: "INV", label: "Investor" },
  { value: "DESIGNER", label: "Designer" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
] as const;

type FounderFormState = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  founderTitle: string;
  primarySharePercentage: string;
};

type ShareFormState = {
  percentage: string;
  note: string;
};

type ExecutiveRecord = {
  id: string;
  name: string;
  role: string;
  relationship: string;
  isFounder: boolean;
};

const EMPTY_FORM: FounderFormState = {
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  role: "COO",
  founderTitle: "",
  primarySharePercentage: "",
};

const EMPTY_SHARE_FORM: ShareFormState = {
  percentage: "",
  note: "",
};

const mapExecutiveRecord = (executive: any): ExecutiveRecord => {
  const role = executive.role || "";
  const isFounder = ["CEO", "CTO"].includes(role);

  return {
    id: executive.id,
    name: executive.name || "",
    role,
    relationship:
      role === "CEO"
        ? "Primary co-founder with protected governance authority, 40% base shares, and full platform oversight."
        : role === "CTO"
          ? "Primary co-founder with protected governance authority, 27% base shares, and full technical oversight."
          : role === "SUPER_ADMIN"
            ? "Executive operator supporting the founder board across platform administration."
            : role === "COO"
              ? "Operational executive collaborating with the founder board on execution."
              : role === "INV"
                ? "Strategic founder-board stakeholder with investment visibility."
                : "Design leadership stakeholder visible within the founder board.",
    isFounder,
  };
};

const founderStatusLabel = (founder: FounderProfile) => (founder.is_active ? "Active" : "Inactive");

export default function FoundersManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: founders = [], isLoading: foundersLoading } = useFounders();
  const { data: executivesData, isLoading: executivesLoading } = useExecutives();
  const createFounderMutation = useCreateFounder();
  const updateFounderMutation = useUpdateFounder();
  const addSharesMutation = useAddFounderShares();
  const deleteFounderMutation = useDeleteFounder();

  const isPrimaryFounder = ["CEO", "CTO"].includes(user?.role || "");
  const executiveRecords = executivesData?.results ?? [];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSharesOpen, setIsSharesOpen] = useState(false);
  const [form, setForm] = useState<FounderFormState>(EMPTY_FORM);
  const [shareForm, setShareForm] = useState<ShareFormState>(EMPTY_SHARE_FORM);
  const [selectedFounder, setSelectedFounder] = useState<FounderProfile | null>(null);

  const sortedFounders = useMemo(
    () =>
      [...founders].sort((a, b) => {
        const aIndex = EXECUTIVE_ORDER.indexOf(a.role);
        const bIndex = EXECUTIVE_ORDER.indexOf(b.role);
        if (a.is_primary_founder !== b.is_primary_founder) {
          return a.is_primary_founder ? -1 : 1;
        }
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      }),
    [founders]
  );

  const executiveMap = useMemo(
    () => executiveRecords.map(mapExecutiveRecord).sort((a, b) => EXECUTIVE_ORDER.indexOf(a.role) - EXECUTIVE_ORDER.indexOf(b.role)),
    [executiveRecords]
  );

  useEffect(() => {
    if (!isEditOpen) {
      setSelectedFounder(null);
      setForm(EMPTY_FORM);
    }
  }, [isEditOpen]);

  useEffect(() => {
    if (!isSharesOpen) {
      setSelectedFounder(null);
      setShareForm(EMPTY_SHARE_FORM);
    }
  }, [isSharesOpen]);

  const openEditDialog = (founder: FounderProfile) => {
    setSelectedFounder(founder);
    setForm({
      name: founder.name,
      email: founder.email,
      phone: founder.phone || "",
      whatsapp: founder.whatsapp || "",
      role: founder.role,
      founderTitle: founder.founder_title,
      primarySharePercentage: founder.primary_share_percentage,
    });
    setIsEditOpen(true);
  };

  const openSharesDialog = (founder: FounderProfile) => {
    setSelectedFounder(founder);
    setShareForm(EMPTY_SHARE_FORM);
    setIsSharesOpen(true);
  };

  const handleCreateFounder = async () => {
    try {
      const created = await createFounderMutation.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        role: form.role as "SUPER_ADMIN" | "COO" | "INV" | "DESIGNER",
        founder_title: form.founderTitle,
        primary_share_percentage: form.primarySharePercentage,
      });
      toast({
        title: "Founder Added",
        description: `${created.name} can now activate their account using matricule ${created.matricule}.`,
      });
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Could not add founder",
        description: error?.response?.data?.detail || "Please verify the founder information and try again.",
      });
    }
  };

  const handleUpdateFounder = async () => {
    if (!selectedFounder) return;
    try {
      await updateFounderMutation.mutateAsync({
        id: selectedFounder.id,
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp || form.phone,
          role: form.role as "SUPER_ADMIN" | "COO" | "INV" | "DESIGNER",
          founder_title: form.founderTitle,
          primary_share_percentage: form.primarySharePercentage,
        },
      });
      toast({
        title: "Founder Updated",
        description: "Founder information and share configuration were updated successfully.",
      });
      setIsEditOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error?.response?.data?.detail || "We could not update this founder right now.",
      });
    }
  };

  const handleAddShares = async () => {
    if (!selectedFounder) return;
    try {
      await addSharesMutation.mutateAsync({
        id: selectedFounder.id,
        data: {
          percentage: shareForm.percentage,
          note: shareForm.note,
        },
      });
      toast({
        title: "Additional Shares Added",
        description: `${selectedFounder.name} now has an updated additional share balance.`,
      });
      setIsSharesOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Share update failed",
        description: error?.response?.data?.detail || "We could not record that share adjustment.",
      });
    }
  };

  const handleDeleteFounder = async (founder: FounderProfile) => {
    if (!founder.can_be_removed) {
      toast({
        variant: "destructive",
        title: "Protected Founder",
        description: "Primary founders cannot be removed from the system.",
      });
      return;
    }

    try {
      await deleteFounderMutation.mutateAsync(founder.id);
      toast({
        title: "Founder Removed",
        description: `${founder.name} was removed from the system.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Removal failed",
        description: error?.response?.data?.detail || "We could not remove this founder right now.",
      });
    }
  };

  const isLoading = foundersLoading || executivesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-primary font-headline">
            <div className="rounded-xl bg-primary p-2 text-white shadow-lg">
              <Crown className="h-6 w-6 text-secondary" />
            </div>
            Founder Governance
          </h1>
          <p className="mt-1 max-w-3xl text-muted-foreground">
            CEO and CTO remain the protected primary founders. From here they can add secondary founders, assign roles,
            define shareholding, grant additional shares over time, and manage activation-ready matricules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge className="h-10 rounded-xl bg-secondary/20 px-4 text-[10px] font-black uppercase tracking-widest text-primary">
            {sortedFounders.length} Founder Accounts
          </Badge>
          {isPrimaryFounder && (
            <Button
              className="h-11 rounded-xl bg-primary px-5 text-xs font-black uppercase tracking-widest text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Founder
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {sortedFounders.map((founder) => (
          <Card key={founder.id} className="overflow-hidden rounded-[2rem] border-none bg-white shadow-xl">
            <CardHeader className="bg-primary p-6 text-white sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={founder.avatar} />
                  <AvatarFallback className="bg-white text-2xl font-black text-primary">
                    {founder.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">{founder.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-none bg-secondary px-4 py-1 text-[8px] font-black uppercase text-primary">
                      {founder.is_primary_founder ? "Primary Founder" : "Board Founder"}
                    </Badge>
                    <Badge variant="secondary" className="border-none bg-white/10 px-4 py-1 text-[8px] font-black uppercase text-white">
                      {founder.role}
                    </Badge>
                    <Badge className="border-none bg-white px-4 py-1 text-[8px] font-black uppercase text-primary">
                      {founderStatusLabel(founder)}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm font-bold text-white/80">
                    {founder.founder_title}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <ShareBlock label="Primary Shares" value={`${founder.primary_share_percentage}%`} />
                <ShareBlock label="Additional Shares" value={`${founder.additional_share_percentage}%`} accent />
                <ShareBlock label="Total Shares" value={`${founder.total_share_percentage}%`} />
              </div>

              <div className="rounded-2xl border border-accent bg-accent/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activation Matricule</p>
                    <p className="mt-1 text-sm font-mono font-bold text-primary/80">{founder.matricule}</p>
                  </div>
                  {!founder.can_be_removed && (
                    <Badge className="border-none bg-primary/10 px-3 py-1 text-[8px] font-black uppercase text-primary">
                      Protected Founder
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-xs font-bold text-primary/70">
                  {founder.is_primary_founder
                    ? "Primary founder account: role and base shares stay protected. Additional shares can still be granted over time."
                    : "Secondary founder account: editable and removable by the CEO or CTO at any time."}
                </p>
              </div>

              <div className="space-y-3 border-t border-accent pt-4">
                <InfoRow icon={<Mail className="h-4 w-4" />} value={founder.email} />
                <InfoRow icon={<Smartphone className="h-4 w-4" />} value={founder.phone || "No contact configured"} />
                <InfoRow icon={<Wallet className="h-4 w-4" />} value={`${founder.share_adjustments.length} additional share grants recorded`} />
              </div>

              {founder.share_adjustments.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-accent bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Share Adjustments</p>
                  <div className="space-y-2">
                    {founder.share_adjustments.slice(0, 3).map((adjustment) => (
                      <div key={adjustment.id} className="flex flex-col gap-1 rounded-xl bg-accent/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black text-primary">+{adjustment.percentage}%</p>
                          <p className="text-[10px] font-bold text-muted-foreground">{adjustment.note || "Additional founder allocation"}</p>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{adjustment.added_by_name || "Founder Board"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isPrimaryFounder && (
                <div className="flex flex-wrap gap-3 border-t border-accent pt-4">
                  <Button variant="outline" className="rounded-xl" onClick={() => openEditDialog(founder)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Founder
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => openSharesDialog(founder)}>
                    <PieChart className="mr-2 h-4 w-4" />
                    Add Shares
                  </Button>
                  {founder.can_be_removed && (
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => handleDeleteFounder(founder)}
                      disabled={deleteFounderMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Founder
                    </Button>
                  )}
                </div>
              )}
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
            Both primary founders can see every executive account and every founder record from the same governance view.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Executive</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="min-w-[280px]">Relationship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executiveMap.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-primary/10 bg-white p-2.5 shadow-sm">
                        {record.isFounder ? <Crown className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary/60" />}
                      </div>
                      <p className="text-xs font-black uppercase text-primary">{record.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="border-none bg-primary/5 text-[8px] font-black uppercase text-primary">
                      {record.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] font-bold text-muted-foreground">{record.relationship}</TableCell>
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
        <CardContent className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-4">
          {[
            "CEO remains fixed at 40% primary shares and CTO remains fixed at 27% primary shares.",
            "CEO and CTO can add secondary founders, define titles, assign roles, and generate activation-ready matricules.",
            "Additional shares can be granted over time without overwriting the founder’s protected primary shares.",
            "Only secondary founders can be removed from the system. Primary founder accounts remain protected.",
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

      <FounderDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Add Founder"
        description="Create a founder account, define their role and base shares, then share the generated matricule so they can activate their account."
        form={form}
        setForm={setForm}
        onSubmit={handleCreateFounder}
        submitLabel={createFounderMutation.isPending ? "Creating..." : "Create Founder"}
        loading={createFounderMutation.isPending}
      />

      <FounderDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Founder"
        description="Update founder contact details, board title, and editable share setup."
        form={form}
        setForm={setForm}
        onSubmit={handleUpdateFounder}
        submitLabel={updateFounderMutation.isPending ? "Saving..." : "Save Changes"}
        loading={updateFounderMutation.isPending}
        disableRoleAndPrimaryShare={selectedFounder?.is_primary_founder}
      />

      <Dialog open={isSharesOpen} onOpenChange={setIsSharesOpen}>
        <DialogContent className="max-w-xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-primary">
              Add Additional Shares
            </DialogTitle>
            <DialogDescription>
              {selectedFounder
                ? `${selectedFounder.name} currently holds ${selectedFounder.primary_share_percentage}% primary shares and ${selectedFounder.additional_share_percentage}% additional shares.`
                : "Record a new share allocation."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <ShareBlock label="Primary Shares" value={`${selectedFounder?.primary_share_percentage || "0.00"}%`} />
              <ShareBlock label="Additional Shares" value={`${selectedFounder?.additional_share_percentage || "0.00"}%`} accent />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-share">New Additional Share (%)</Label>
              <Input
                id="additional-share"
                inputMode="decimal"
                placeholder="e.g. 2.50"
                value={shareForm.percentage}
                onChange={(event) => setShareForm((prev) => ({ ...prev, percentage: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-note">Reason / Note</Label>
              <Textarea
                id="share-note"
                placeholder="e.g. Additional governance shares approved after Series A close."
                value={shareForm.note}
                onChange={(event) => setShareForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-end">
            <Button variant="outline" onClick={() => setIsSharesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShares} disabled={addSharesMutation.isPending || !shareForm.percentage.trim()}>
              {addSharesMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PieChart className="mr-2 h-4 w-4" />}
              Add Shares
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShareBlock({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", accent ? "border-secondary/20 bg-secondary/10" : "border-accent bg-accent/20")}>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <PieChart className="h-4 w-4 text-primary/50" />
        <span className="text-lg font-black text-primary">{value}</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-primary/5 p-2 text-primary/60">{icon}</div>
      <p className="break-all text-xs font-bold text-primary/80">{value}</p>
    </div>
  );
}

function FounderDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  setForm,
  onSubmit,
  submitLabel,
  loading,
  disableRoleAndPrimaryShare = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: FounderFormState;
  setForm: Dispatch<SetStateAction<FounderFormState>>;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  loading: boolean;
  disableRoleAndPrimaryShare?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase text-primary">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="Full Name" htmlFor={`${title}-name`}>
            <Input
              id={`${title}-name`}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>

          <Field label="Founder Title" htmlFor={`${title}-founder-title`}>
            <Input
              id={`${title}-founder-title`}
              value={form.founderTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, founderTitle: event.target.value }))}
              placeholder="e.g. Strategic Growth Founder"
            />
          </Field>

          <Field label="Email" htmlFor={`${title}-email`}>
            <Input
              id={`${title}-email`}
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </Field>

          <Field label="Phone Number" htmlFor={`${title}-phone`}>
            <Input
              id={`${title}-phone`}
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </Field>

          <Field label="WhatsApp" htmlFor={`${title}-whatsapp`}>
            <Input
              id={`${title}-whatsapp`}
              value={form.whatsapp}
              onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
            />
          </Field>

          <Field label="System Role" htmlFor={`${title}-role`}>
            <Select
              value={form.role}
              onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
              disabled={disableRoleAndPrimaryShare}
            >
              <SelectTrigger id={`${title}-role`}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {FOUNDER_ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Primary Share (%)" htmlFor={`${title}-shares`}>
            <Input
              id={`${title}-shares`}
              inputMode="decimal"
              value={form.primarySharePercentage}
              onChange={(event) => setForm((prev) => ({ ...prev, primarySharePercentage: event.target.value }))}
              disabled={disableRoleAndPrimaryShare}
              placeholder="e.g. 8.50"
            />
          </Field>
        </div>

        <DialogFooter className="gap-3 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              loading ||
              !form.name.trim() ||
              !form.email.trim() ||
              !form.phone.trim() ||
              !form.founderTitle.trim() ||
              !form.primarySharePercentage.trim()
            }
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

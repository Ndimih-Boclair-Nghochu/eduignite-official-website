"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { usePlatformSettings, usePlatformFees, usePublicEvents, useUpdatePlatformSettings, useCreatePublicEvent, useDeletePublicEvent } from "@/lib/hooks";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings2,
  Save,
  Loader2,
  Coins,
  Globe,
  Plus,
  Trash2,
  Star,
  Upload,
  Layout,
  Users,
  Building2,
  Wallet,
  Heart,
  BookOpen,
  Video,
  Image as ImageIcon,
  GraduationCap,
  Link as LinkIcon,
  PlayCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PlatformSettingsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: settings, isLoading: settingsLoading } = usePlatformSettings();
  const { data: feesResponse } = usePlatformFees();
  const { data: eventsResponse } = usePublicEvents();

  const updateMutation = useUpdatePlatformSettings();
  const createEventMutation = useCreatePublicEvent();
  const deleteEventMutation = useDeletePublicEvent();

  const fees = feesResponse?.results ?? [];
  const events = eventsResponse?.results ?? [];

  const [formData, setFormData] = useState({
    platformName: "",
    platformLogo: "",
    paymentDeadline: "",
    honourRollThreshold: 0,
    maintenanceMode: false,
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    url: "",
    type: "video" as "video" | "image",
  });

  const isDesigner = user?.role === "DESIGNER";
  const isSuperUser = ["SUPER_ADMIN", "CEO", "CTO", "COO"].includes(user?.role || "");

  useEffect(() => {
    if (!settings) return;

    setFormData({
      platformName: settings.name || "",
      platformLogo: settings.logo || "",
      paymentDeadline: settings.payment_deadline || "",
      honourRollThreshold: settings.honour_roll_threshold || 0,
      maintenanceMode: settings.maintenance_mode || false,
    });
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Please select an image smaller than 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, platformLogo: reader.result as string }));
      toast({ title: "Logo Processed", description: "Identity preview updated locally." });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateSettings = () => {
    if (!isSuperUser) return;

    updateMutation.mutate(
      {
        name: formData.platformName,
        logo: formData.platformLogo,
        payment_deadline: formData.paymentDeadline,
        honour_roll_threshold: formData.honourRollThreshold,
        maintenance_mode: formData.maintenanceMode,
      },
      {
        onSuccess: () => {
          toast({
            title: "Platform Policy Updated",
            description: "All branding, financial, and training parameters have been synchronized.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.response?.data?.message || "Failed to update settings",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handlePublishEvent = () => {
    if (!newEvent.title || !newEvent.url) {
      toast({ variant: "destructive", title: "Missing Information", description: "Title and media URL are required." });
      return;
    }

    createEventMutation.mutate(newEvent, {
      onSuccess: () => {
        setNewEvent({ title: "", description: "", url: "", type: "video" });
        toast({ title: "Portfolio Updated", description: "New content added to community portal." });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to add event",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId, {
      onSuccess: () => {
        toast({ title: "Event Removed", description: "Portfolio content has been deleted." });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to delete event",
          variant: "destructive",
        });
      },
    });
  };

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
      </div>
    );
  }

  const tutorialLinks = settings?.tutorial_links || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary font-headline flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              {isDesigner ? <Star className="w-6 h-6 text-secondary" /> : <Settings2 className="w-6 h-6 text-secondary" />}
            </div>
            {isDesigner ? "Creative Portfolio Suite" : t("platformSettings")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isDesigner
              ? "Manage public institutional highlights and marketing media."
              : "Govern global SaaS identity, revenue models, and educational content."}
          </p>
        </div>
        {isSuperUser && (
          <Button onClick={handleUpdateSettings} disabled={updateMutation.isPending} className="h-14 px-10 shadow-2xl font-black uppercase tracking-widest text-xs gap-3 rounded-2xl bg-primary text-white hover:bg-primary/90">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Commit Global Policy
          </Button>
        )}
      </div>

      <Tabs defaultValue={isDesigner ? "marketing" : "branding"} className="w-full">
        <TabsList className={cn("grid w-full mb-10 bg-white shadow-sm border h-auto p-1.5 rounded-3xl", isDesigner ? "grid-cols-1 md:w-[300px]" : "grid-cols-4 md:w-[900px]")}>
          {!isDesigner && (
            <>
              <TabsTrigger value="branding" className="gap-2 py-3 rounded-2xl font-bold text-xs sm:text-sm">
                <Layout className="w-4 h-4" /> <span className="hidden sm:inline">Identity</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2 py-3 rounded-2xl font-bold text-xs sm:text-sm">
                <Coins className="w-4 h-4" /> <span className="hidden sm:inline">Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2 py-3 rounded-2xl font-bold text-xs sm:text-sm">
                <PlayCircle className="w-4 h-4" /> <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="marketing" className="gap-2 py-3 rounded-2xl font-bold text-xs sm:text-sm">
            <Star className="w-4 h-4" /> <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
        </TabsList>

        {!isDesigner && (
          <>
            <TabsContent value="branding" className="space-y-8">
              <Card className="border-none shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary p-10 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <Globe className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter">Strategic Branding</CardTitle>
                      <CardDescription className="text-white/60">Customize the visual identity of the SaaS platform.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-4 space-y-4 text-center">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block">Platform Logo</Label>
                      <div
                        className={cn("group relative w-48 h-48 mx-auto bg-accent/20 rounded-[2.5rem] border-2 border-dashed border-accent flex items-center justify-center overflow-hidden transition-all shadow-inner", isSuperUser ? "cursor-pointer hover:border-primary" : "cursor-default")}
                        onClick={() => isSuperUser && logoInputRef.current?.click()}
                      >
                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                        {formData.platformLogo ? (
                          <img src={formData.platformLogo} alt="Logo" className="w-full h-full object-contain p-6" />
                        ) : (
                          <Upload className="w-10 h-10 text-primary/20" />
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Platform Market Name</Label>
                        <Input
                          value={formData.platformName}
                          onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                          placeholder="e.g. EduIgnite"
                          className="h-14 bg-accent/30 border-none rounded-2xl font-black text-2xl text-primary focus-visible:ring-primary px-6"
                          disabled={!isSuperUser}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Deadline</Label>
                          <Input
                            type="date"
                            value={formData.paymentDeadline}
                            onChange={(e) => setFormData({ ...formData, paymentDeadline: e.target.value })}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                            disabled={!isSuperUser}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Honour Roll Threshold</Label>
                          <Input
                            type="number"
                            value={formData.honourRollThreshold}
                            onChange={(e) => setFormData({ ...formData, honourRollThreshold: Number(e.target.value) })}
                            className="h-12 bg-accent/30 border-none rounded-xl"
                            disabled={!isSuperUser}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-8">
              <Card className="border-none shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b p-10">
                  <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <Coins className="w-6 h-6 text-secondary" />
                    Annual License Structures
                  </CardTitle>
                  <CardDescription>View the platform access fees for non-executive roles.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { role: "STUDENT", label: "Student Access", icon: GraduationCap },
                      { role: "TEACHER", label: "Teacher Licensing", icon: Users },
                      { role: "PARENT", label: "Family Portal", icon: Heart },
                      { role: "BURSAR", label: "Financial Node", icon: Wallet },
                      { role: "LIBRARIAN", label: "Library Node", icon: BookOpen },
                      { role: "SCHOOL_ADMIN", label: "Primary Admin", icon: Building2 },
                    ].map(({ role, label, icon: Icon }) => {
                      const feeRecord = fees.find((fee) => fee.role === role);
                      return (
                        <div key={role} className="space-y-3 p-4 rounded-2xl bg-accent/30 border border-accent">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                            {label}
                          </Label>
                          <Input value={feeRecord ? `${feeRecord.currency} ${feeRecord.amount}` : "Not configured"} disabled className="bg-white border-none h-12 rounded-xl font-black text-primary" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-8">
              <Card className="border-none shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary p-10 text-white">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl">
                      <PlayCircle className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tighter">User Training Repository</CardTitle>
                      <CardDescription className="text-white/60">View the educational links used across user dashboards.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {["STUDENT", "TEACHER", "PARENT", "SCHOOL_ADMIN", "SUB_ADMIN", "BURSAR", "LIBRARIAN"].map((role) => (
                      <div key={role} className="space-y-3 p-4 rounded-2xl bg-accent/30 border border-accent">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-primary" />
                          {role.replace("_", " ")} Link
                        </Label>
                        <Input value={tutorialLinks[role as keyof typeof tutorialLinks] || ""} disabled placeholder="Not configured" className="bg-white border-none h-11 rounded-xl text-xs font-bold" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-accent/10 p-6 border-t flex items-center gap-3">
                  <Info className="w-5 h-5 text-primary opacity-40" />
                  <p className="text-[10px] text-muted-foreground italic">Training links are driven by backend configuration and start empty until you add them.</p>
                </CardFooter>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="marketing" className="space-y-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary p-10 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Star className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Public Portfolio Management</CardTitle>
                  <CardDescription className="text-white/60">Add institutional content via external URLs to the community highlights.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {(isSuperUser || isDesigner) && (
                <div className="p-8 bg-accent/30 rounded-[2rem] border border-accent space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 space-y-4 flex flex-col">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content Type</Label>
                      <Select value={newEvent.type} onValueChange={(value: "video" | "image") => setNewEvent({ ...newEvent, type: value, url: "" })}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-8 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Headline Title</Label>
                        <Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Annual Pedagogical Summit" className="h-12 border-none bg-white rounded-xl px-4 font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Short Summary</Label>
                        <Input value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Capturing the moments..." className="h-12 border-none bg-white rounded-xl px-4" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">{newEvent.type === "video" ? "Video Embed URL" : "Direct Image URL"}</Label>
                        <Input value={newEvent.url} onChange={(e) => setNewEvent({ ...newEvent, url: e.target.value })} placeholder="https://..." className="h-12 border-none bg-white rounded-xl px-4" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handlePublishEvent} disabled={createEventMutation.isPending} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs gap-3 rounded-2xl shadow-xl">
                    {createEventMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 text-secondary" />}
                    Add to Public Portfolio
                  </Button>
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase text-primary tracking-[0.3em] border-b pb-2 flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Active Gallery Contents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="border-none shadow-sm overflow-hidden bg-accent/10 flex flex-col group">
                      <div className="aspect-video relative bg-slate-900 overflow-hidden">
                        {event.type === "video" ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <iframe src={event.url} className="w-full h-full pointer-events-none" title={event.title} />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white uppercase text-[10px]">
                              <Video className="w-4 h-4 mr-2" />
                              VIDEO CONTENT
                            </div>
                          </div>
                        ) : (
                          <img src={event.url} alt={event.title} className="w-full h-full object-cover" />
                        )}
                        {(isSuperUser || isDesigner) && (
                          <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteEvent(event.id)} disabled={deleteEventMutation.isPending}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-base font-black truncate">{event.title}</CardTitle>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/10">{event.type}</Badge>
                        </div>
                        <CardDescription className="text-xs line-clamp-1">{event.description}</CardDescription>
                      </CardHeader>
                      {(isSuperUser || isDesigner) && (
                        <CardFooter className="p-4 pt-0 justify-end">
                          <Button variant="ghost" size="sm" className="text-destructive gap-2 text-[10px] font-black uppercase" onClick={() => handleDeleteEvent(event.id)} disabled={deleteEventMutation.isPending}>
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

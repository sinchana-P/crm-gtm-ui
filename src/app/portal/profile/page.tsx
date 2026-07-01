"use client";

import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PORTAL_CUSTOMER, PORTAL_PREFERENCES } from "@/lib/mock-data/portal";
import { formatDate } from "@/lib/format";

export default function PortalProfilePage() {
  const [prefs, setPrefs] = useState(PORTAL_PREFERENCES);

  const save = () => toast.success("Profile and preferences saved");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile & preferences"
        description="Manage your contact details, photo, and communication preferences."
        actions={<Button onClick={save}>Save changes</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Avatar className="size-24">
              <AvatarFallback className="text-2xl">{PORTAL_CUSTOMER.avatarInitials}</AvatarFallback>
            </Avatar>
            <p className="mt-4 text-lg font-semibold">
              {PORTAL_CUSTOMER.firstName} {PORTAL_CUSTOMER.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{PORTAL_CUSTOMER.title}</p>
            <p className="text-sm text-muted-foreground">{PORTAL_CUSTOMER.company}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.message("Photo upload opened")}>
                <Upload className="size-4" />
                Upload
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.message("Camera opened")}>
                <Camera className="size-4" />
                Camera
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Member since {formatDate(PORTAL_CUSTOMER.memberSince)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contact information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>First name</Label>
              <Input defaultValue={PORTAL_CUSTOMER.firstName} />
            </div>
            <div className="grid gap-2">
              <Label>Last name</Label>
              <Input defaultValue={PORTAL_CUSTOMER.lastName} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" defaultValue={PORTAL_CUSTOMER.email} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Phone</Label>
              <Input defaultValue={PORTAL_CUSTOMER.phone} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label>Company</Label>
              <Input defaultValue={PORTAL_CUSTOMER.company} disabled />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Communication preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-pref">Email updates</Label>
            <Switch id="email-pref" checked={prefs.email} onCheckedChange={(v) => setPrefs((p) => ({ ...p, email: !!v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="wa-pref">WhatsApp messages</Label>
            <Switch id="wa-pref" checked={prefs.whatsapp} onCheckedChange={(v) => setPrefs((p) => ({ ...p, whatsapp: !!v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-pref">SMS notifications</Label>
            <Switch id="sms-pref" checked={prefs.sms} onCheckedChange={(v) => setPrefs((p) => ({ ...p, sms: !!v }))} />
          </div>
          <Separator />
          <div className="grid gap-2 max-w-xs">
            <Label>Notification digest</Label>
            <Select value={prefs.digest} onValueChange={(v) => setPrefs((p) => ({ ...p, digest: (v ?? "instant") as typeof p.digest }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prefs.topics.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Account team</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">{PORTAL_CUSTOMER.accountOwner}</p>
          <p className="text-muted-foreground">{PORTAL_CUSTOMER.accountOwnerEmail}</p>
          <p className="mt-1 text-muted-foreground">Territory: {PORTAL_CUSTOMER.territory}</p>
        </CardContent>
      </Card>
    </div>
  );
}

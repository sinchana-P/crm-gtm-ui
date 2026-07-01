"use client";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PORTAL_CUSTOMER, PORTAL_FAQ } from "@/lib/mock-data/portal";
import { toast } from "sonner";

export default function PortalHelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help center"
        description="FAQs and ways to reach your account team."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email your rep</p>
              <p className="text-sm text-muted-foreground">{PORTAL_CUSTOMER.accountOwner}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${PORTAL_CUSTOMER.accountOwnerEmail}`)}>
              Send email
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <MessageSquare className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">New request</p>
              <p className="text-sm text-muted-foreground">Open a tracked support case</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/portal/requests?new=1"}>
              Create request
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <Phone className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Call support</p>
              <p className="text-sm text-muted-foreground">Mon–Fri, 9am–6pm IST</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.message("Calling support line…")}>
              Call now
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion multiple className="w-full">
            {PORTAL_FAQ.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

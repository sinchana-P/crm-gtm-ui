"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactListView } from "@/components/contacts/contact-list-view";
import { MOCK_CONTACTS } from "@/lib/mock-data";

export default function LeadsPage() {
  const leads = MOCK_CONTACTS.filter((c) => c.type === "lead");

  return (
    <ContactListView
      title="Leads"
      description="Qualify and convert inbound and outbound leads."
      contacts={leads}
      emptyIcon={UserPlus}
      emptyTitle="No leads yet"
      emptyDescription="Import leads or capture them from forms and campaigns."
      showConvert
      resourceName="Leads"
      headerActions={
        <Button>
          <UserPlus className="size-4" />
          Create lead
        </Button>
      }
    />
  );
}

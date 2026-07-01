"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactListView } from "@/components/contacts/contact-list-view";
import { MOCK_CONTACTS } from "@/lib/mock-data";

export default function ContactsPage() {
  const contacts = MOCK_CONTACTS.filter((c) => c.type === "contact");

  return (
    <ContactListView
      title="Contacts"
      description="Manage qualified contacts across the sales pipeline."
      resourceName="Contacts"
      contacts={contacts}
      emptyIcon={Users}
      emptyTitle="No contacts yet"
      emptyDescription="Convert leads or import contacts to populate this view."
      headerActions={
        <Button>
          <Users className="size-4" />
          Create contact
        </Button>
      }
    />
  );
}

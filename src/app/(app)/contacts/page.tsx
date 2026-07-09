"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactListView } from "@/components/contacts/contact-list-view";
import { AiCreateEntityDrawer } from "@/components/contacts/ai-create-entity-drawer";
import { MOCK_CONTACTS } from "@/lib/mock-data";

export default function ContactsPage() {
  const contacts = MOCK_CONTACTS.filter((c) => c.type === "contact");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <ContactListView
        title="Contacts"
        description="Manage qualified contacts across the sales pipeline."
        resourceName="Contacts"
        contacts={contacts}
        emptyIcon={Users}
        emptyTitle="No contacts yet"
        emptyDescription="Convert leads or import contacts to populate this view."
        headerActions={
          <Button onClick={() => setCreateOpen(true)}>
            <Users className="size-4" />
            Create contact
          </Button>
        }
      />
      <AiCreateEntityDrawer open={createOpen} onOpenChange={setCreateOpen} entityType="contact" />
    </>
  );
}

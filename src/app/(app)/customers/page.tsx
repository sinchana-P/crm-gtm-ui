"use client";

import { useState } from "react";
import { Building2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactListView } from "@/components/contacts/contact-list-view";
import { AiCreateEntityDrawer } from "@/components/contacts/ai-create-entity-drawer";
import { MOCK_CONTACTS } from "@/lib/mock-data";

export default function CustomersPage() {
  const customers = MOCK_CONTACTS.filter((c) => c.type === "customer");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <ContactListView
        title="Customers"
        description="Active customer accounts with health and engagement signals."
        resourceName="Customers"
        contacts={customers}
        emptyIcon={Building2}
        emptyTitle="No customers yet"
        emptyDescription="Customers appear here after conversion from the sales pipeline."
        headerActions={
          <>
            <Button variant="outline">
              <Download className="size-4" />
              Export list
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Building2 className="size-4" />
              Create customer
            </Button>
          </>
        }
      />
      <AiCreateEntityDrawer open={createOpen} onOpenChange={setCreateOpen} entityType="customer" />
    </>
  );
}

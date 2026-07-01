"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactListView } from "@/components/contacts/contact-list-view";
import { MOCK_CONTACTS } from "@/lib/mock-data";

export default function CustomersPage() {
  const customers = MOCK_CONTACTS.filter((c) => c.type === "customer");

  return (
    <ContactListView
      title="Customers"
      description="Active customer accounts with health and engagement signals."
      resourceName="Customers"
      contacts={customers}
      emptyIcon={Building2}
      emptyTitle="No customers yet"
      emptyDescription="Customers appear here after conversion from the sales pipeline."
      headerActions={
        <Button variant="outline">
          <Building2 className="size-4" />
          Export list
        </Button>
      }
    />
  );
}

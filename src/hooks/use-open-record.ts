"use client";

import { useRouter } from "next/navigation";
import { getContactById } from "@/lib/mock-data";
import { getRecordHref } from "@/lib/record-routes";

export function useOpenRecord() {
  const router = useRouter();

  return (contactId: string) => {
    const contact = getContactById(contactId);
    if (contact) {
      router.push(getRecordHref(contact));
    }
  };
}

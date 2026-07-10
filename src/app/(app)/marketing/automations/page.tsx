import { redirect } from "next/navigation";

// Automations and Sequences are unified into a single Sequences builder.
// This route is kept only to redirect any old links.
export default function AutomationsPage() {
  redirect("/marketing/sequences");
}

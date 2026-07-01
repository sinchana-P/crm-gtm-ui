"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, HelpCircle, Shield, User } from "lucide-react";
import { DocumentUploadWizard } from "@/components/portal/document-upload-wizard";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getMagicLinkSession } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function MagicLinkUploadPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token ?? "");
  const session = useMemo(() => getMagicLinkSession(token), [token]);

  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <Shield className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Link expired or invalid</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This secure upload link may have expired. Contact your account representative
          for a new link, or sign in to the customer portal.
        </p>
        <ButtonLink href="/portal/documents">Go to portal documents</ButtonLink>
      </div>
    );
  }

  const expires = new Date(session.expiresAt);
  const isExpired = expires < new Date();

  if (isExpired) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <Clock className="size-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Link expired</h1>
        <p className="text-sm text-muted-foreground">
          This link expired on {formatDate(session.expiresAt)}. Request a new link from{" "}
          {session.repName}.
        </p>
        <ButtonLink href={`mailto:${session.repEmail}`} variant="outline">
          Email {session.repName}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Secure document upload
            </p>
            <h1 className="text-lg font-semibold">{session.purpose}</h1>
          </div>
          <ButtonLink href="/portal/help" variant="ghost" size="sm">
            <HelpCircle className="size-4" />
            Help
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <Card className="shadow-none">
          <CardContent className="flex gap-4 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="size-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium">
                Hi {session.contactName.split(" ")[0]}, {session.company} asked you to upload
                documents.
              </p>
              <p className="mt-1 text-muted-foreground">
                Your representative is {session.repName}. No password needed — this link is
                unique to you and expires {formatDate(session.expiresAt)}.
              </p>
            </div>
          </CardContent>
        </Card>

        <DocumentUploadWizard
          items={session.items}
          completedItemIds={session.completedItemIds}
          onComplete={() => router.push("/portal/documents?tab=uploaded")}
          compact
        />

        <p className="text-center text-xs text-muted-foreground">
          Prefer the full portal?{" "}
          <Link href="/portal/documents?tab=requested" className="underline">
            Open document vault
          </Link>
        </p>
      </main>
    </div>
  );
}

# Connect CRM GTM UI

Standalone UI prototype for **Connect CRM V1** — plugin-based CRM with four modules:

| Module | Type | SKU |
|--------|------|-----|
| Contact Management | Core (always on) | Connect Contacts |
| Marketing & Sequences | Plugin | Connect Reach |
| Case Manager Integration | Plugin | Connect Resolve |
| E-sign | Plugin | Connect Sign |

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (black & white theme, light/dark)
- **Zustand** (plugin entitlements, persisted)
- **TanStack Table**, **Recharts**, **Lucide icons**

## Quick start

```bash
cd crm-gtm-ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Plugin model

Enable or disable plugins under **Settings → Plugins**. Sidebar and routes adapt automatically:

- **Contact-only** — Dashboard, Leads, Contacts, Lists, Import, Reports, etc.
- **+ Marketing** — Campaigns, Sequences, Forms, Inbox, Calendar, Automations
- **+ Cases** — Case dashboard, queue, templates, create-from-contact
- **+ E-sign** — Envelopes, templates, bulk send

## Project structure

```
src/
  app/(app)/          # Authenticated CRM shell
    dashboard/        # Contact Health + Work Queue
    leads|contacts|customers/
    lists|duplicates|import|documents|surveys|reports/
    marketing/        # Marketing plugin routes
    cases/            # Case Manager plugin
    esign/            # E-sign plugin
    settings/         # Org settings + plugin toggles
  components/
    layout/           # Sidebar, header, shell
    contacts/         # Record drawer, convert, merge
    cases/            # Create case dialog, timeline
    esign/            # Send envelope dialog
    marketing/        # Sequence packs, badges
    shared/           # PageHeader, DataTable, StatCard
  lib/
    mock-data/        # Demo data for all modules
    stores/           # Plugin entitlements
    navigation.ts     # Dynamic nav by plugin
    types/
```

## Feature coverage

Aligned with **Connect CRM GTM V1 Feature Catalog** (PDF):

- Contact: CRUD, conversion, dedupe/merge, assignment, scoring, AI brief, work queue, import wizard, surveys, documents
- Marketing: campaigns, sequences (marketing + sales cadence), segments, forms, templates, inbox, calendar, automations, deliverability
- Cases: Kaayaka integration UI, create case in 2 clicks, SLA badges, queue, templates
- E-sign: envelopes, templates, bulk send, sequential/parallel signing UI

## Notes

- **UI-only** — uses mock data; no backend wired
- Intended for product review, GTM demos, and handoff to engineering
- Parent monorepo: `connect-nx` (separate from production `frontend`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

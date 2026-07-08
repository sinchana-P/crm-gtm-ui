# Email Sequences — Verified Trigger & Action Catalog (Industry Research)

**Compiled:** July 8, 2026 · **For:** Connect NX Marketing Module — Email Sequences (Module 3)
**Method:** Deep-research harness (106 agents, adversarial 3-vote verification per claim) + direct official-doc fetches. Only official documentation was used as evidence.

**Confidence legend**
- ✅ **Verified** — claim survived 3-vote adversarial verification against the official doc
- 📄 **Official doc** — read directly from the official help page (fetched or quoted in search result)
- ◻︎ **Documented, unverified** — appears in the official article but our verification pass was rate-limited; treat as near-certain, re-check before public claims

**Sources (official only)**
- HubSpot: [enrollment triggers](https://knowledge.hubspot.com/workflows/set-your-workflow-enrollment-triggers), [workflow actions](https://knowledge.hubspot.com/workflows/choose-your-workflow-actions), [sequences](https://knowledge.hubspot.com/sequences/create-and-edit-sequences), [sequence enrollment via workflows](https://knowledge.hubspot.com/sequences/enroll-and-unenroll-contacts-in-sequences-using-workflows), [re-enrollment](https://knowledge.hubspot.com/workflows/add-re-enrollment-triggers-to-a-workflow), [unenrollment/suppression](https://knowledge.hubspot.com/workflows/set-unenrollment-triggers-in-company-deal-ticket-quote-based-workflows)
- ActiveCampaign: [triggers explained](https://help.activecampaign.com/hc/en-us/articles/218788707-Automation-triggers-explained), [actions explained](https://help.activecampaign.com/hc/en-us/articles/218251828-Automation-actions-explained), [date-based trigger](https://help.activecampaign.com/hc/en-us/articles/115001444070)
- Mailchimp: [all flow triggers](https://mailchimp.com/help/all-the-starting-points/), [about flows](https://mailchimp.com/help/about-customer-journeys/), [conditional split](https://mailchimp.com/help/use-if-else-rules/), [percentage split](https://mailchimp.com/help/use-percentage-split-rules/), [wait for trigger](https://mailchimp.com/help/use-wait-for-trigger-rules/)
- Salesforce Account Engagement: [Engagement Studio overview](https://help.salesforce.com/s/articleView?id=mktg.pardot_engagement_studio_overview.htm), [program triggers](https://help.salesforce.com/s/articleView?id=mktg.pardot_engagement_program_triggers.htm), [program actions](https://help.salesforce.com/s/articleView?id=mktg.pardot_engagement_program_actions.htm), [Trailhead: actions/triggers/rules](https://trailhead.salesforce.com/content/learn/modules/pardot-engagement-studio-lightning/learn-about-actions-triggers-and-rules-lightning)
- Customer.io: [campaign triggers, filters, frequencies](https://docs.customer.io/journeys/campaign-triggers/), [webhook campaigns](https://docs.customer.io/journeys/send/campaigns/data-workflows/webhook-triggered-campaigns/)
- Klaviyo: [flow triggers & filters](https://help.klaviyo.com/hc/en-us/articles/115002779051), [flow glossary](https://help.klaviyo.com/hc/en-us/articles/360054130591), [conditional split](https://help.klaviyo.com/hc/en-us/articles/115003872171), [trigger split](https://help.klaviyo.com/hc/en-us/articles/115003885632)
- Zoho: [create a journey](https://help.zoho.com/portal/en/kb/marketing-automation-2-0/user-guide/journeys/articles/create-a-journey), [list entry trigger](https://help.zoho.com/portal/en/kb/campaigns/faqs/marketing-automation/articles/what-is-list-entry-trigger), [cyclic trigger](https://help.zoho.com/portal/en/kb/campaigns/user-guide/marketing-automation/workflows/articles/how-does-cyclic-trigger-work), [time-based workflows](https://help.zoho.com/portal/en/kb/campaigns/user-guide/marketing-automation/workflows/articles/how-to-create-time-based-workflow)

Abbreviations: **HS** HubSpot, **AC** ActiveCampaign, **MC** Mailchimp, **SF** Salesforce Account Engagement (Engagement Studio), **CIO** Customer.io, **KL** Klaviyo, **ZH** Zoho MA.

---

## A. Master list — Enrollment / Start Triggers

### A1. List / segment membership
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Joins segment / meets filter criteria | ✅ (filter-criteria enrollment) | 📄 | 📄 (joins/leaves audience group) | — (uses lists) | 📄 (segment-triggered) | 📄 (added to segment) | ◻︎ | HS verified 3-0; CIO/KL/MC official pages |
| Subscribes to / added to a list | via criteria | 📄 subscribes to a list | 📄 signs up for email/SMS | 📄 list membership (as rule) | via segment | 📄 added to list | 📄 list entry trigger | AC/MC/KL/ZH official |
| Leaves segment/list | via criteria | ◻︎ (unsubscribes) | 📄 leaves audience group | — | via segment exit | — | — | MC official |

### A2. Forms & landing pages
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Form submitted | ✅ (event enrollment, e.g. form) | 📄 submits a form (any/specific) | 📄 (signup; API/integration) | 📄 form view or completion | 📄 form-triggered campaigns | via metric ("filled out a form") | ◻︎ | HS verified 3-0; AC/SF/CIO official |
| Landing page viewed/completed | ✅ (event) | via site tracking | 📄 viewed a page (Mailchimp site) | 📄 landing page trigger | via event | via metric | ◻︎ | SF official |

### A3. Tags
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Tag added | via criteria | 📄 tag is added | 📄 tag added | 📄 (tags as rule criteria) | via attribute/segment | via segment | ◻︎ | AC/MC official |
| Tag removed | via criteria | 📄 tag is removed | — | — | via segment | — | — | AC official |

### A4. CRM property / lifecycle changes
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Contact property/field changes to a value | ✅ (filter criteria, e.g. city = Dublin) | 📄 field changes | 📄 audience field changes | 📄 field value (as rule) | 📄 (attribute → segment) | via segment | ◻︎ field update | HS verified 3-0 |
| Lead score changes / crosses threshold | via criteria | 📄 score changes | — | 📄 score (rule) | via attribute | — | ◻︎ | AC/SF official |
| Deal/pipeline events (stage, value, won/lost) | via deal workflows | 📄 CRM triggers (Plus+): stage change, value change, won/lost, task completed | — | via Salesforce status | via event | — | — | AC official (tier-gated Plus+) |

### A5. Email engagement events
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Opens an email | via criteria/event | 📄 opens/reads an email | 📄 opens email | 📄 email open (trigger step) | via event | via metric | ◻︎ | AC/MC/SF official |
| Clicks a link in email (any/specific) | via criteria/event | 📄 clicks a link | 📄 clicks any / specific / doesn't click | 📄 email link click (any/specific) | via event | via metric | ◻︎ | MC official (incl. negative variants) |
| **Doesn't open within timeframe (negative trigger)** | — | — | 📄 unopened campaign | — | — | — | — | MC official — rare |
| Replies to an email | sequences: reply = unenroll | 📄 replies to an email | — | — | via event | — | — | AC official — rare as a *start* trigger |
| Forwards / shares an email | — | ◻︎ | — | — | — | — | — | AC article (unverified) |

### A6. Site / app activity
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Web page visit | ✅ (event, e.g. page visit) | 📄 webpage visit (site tracking req.) | 📄 viewed page / clicked link | 📄 file download; custom redirect | 📄 event-triggered (page view) | via metric | ◻︎ page visit | HS verified; AC/SF official |
| Custom event / API event performed | via event triggers | 📄 event tracking | 📄 Event API | — | 📄 event-triggered campaigns | 📄 metric trigger (API or integration events) | — | CIO/KL/MC official |

### A7. Date-based
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Calendar date / date property (± offset) | ✅ (calendar date or date property) | 📄 date-based (on/before/after date field) | 📄 specific date, signup date, birthday | — (uses wait steps) | 📄 date-triggered (attribute dates: birthdays, renewals) | 📄 date property trigger | 📄 time-based workflows | HS verified 3-0; AC/MC/CIO/KL official |
| Recurring/anniversary (annual) | via re-enrollment | via date-based yearly | 📄 recurring date | — | 📄 (recurring via dates) | via date property | 📄 cyclic trigger | MC/ZH official |

### A8. Commerce (reference — for our Phase 3)
Mailchimp is the richest here (all 📄 official): buys any/specific product, abandons cart (+ specific products), time since last purchase, product back in stock, churn-risk category, predicted-purchase window, order/shipping/refund notifications, review submitted/eligible. Klaviyo: metric triggers (started checkout, placed order) + **price drop** trigger (unique). Customer.io: cart/order events via event triggers.

### A9. Integration / API / manual
| Trigger | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Webhook received starts automation | ✅ (Data Hub Pro/Ent only) | via integrations | 📄 Flows API / Event API | — | 📄 webhook-triggered campaigns | via API metric | — | HS verified (tier-gated); CIO official |
| Manual enrollment (single/bulk) | ✅ (manual + via other workflows) | 📄 (add via action/import) | 📄 manual add | 📄 (list add) | broadcasts | 📄 manual add to list | ◻︎ | HS verified 3-0 |
| Enrolled by another automation | ✅ ("Go to workflow") | ◻︎ enter another automation | — | — | ◻︎ | — | — | HS verified |
| SMS keyword / channel opt-in | — | ◻︎ | 📄 texts a keyword, signs up for SMS | — | via event | via metric | — | MC official |

---

## B. Master list — Actions / Step Types

### B1. Messaging
| Action | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Send automated email | ✅ | 📄 | 📄 | 📄 | 📄 | 📄 | 📄 | All platforms — table stakes |
| Manual email task (rep sends personally) | ✅ (sequences) | — | — | — | — | — | — | HS sequences verified — sales-sequence pattern |
| Send SMS / WhatsApp / other channel | via add-ons | ◻︎ SMS action | 📄 SMS (flows) | — | 📄 (SMS/push/in-app) | 📄 SMS | — | Multichannel = differentiator space |
| Send site/in-app message | — | ◻︎ site message | — | — | 📄 in-app | — | — | AC/CIO |
| Internal notification (notify owner/team) | ✅ internal email notification | ◻︎ notification email | — | 📄 notify user/assigned user | 📄 (Slack/webhook) | 📄 notification (≤5 people) | — | HS verified; KL official |

### B2. Timing / waits
| Action | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Wait fixed duration | ✅ | ✅ | 📄 time delay | 📄 (wait on triggers/rules) | 📄 | 📄 time delay | 📄 | HS 6 delay types & AC 4 wait types both verified 3-0 |
| Wait until calendar date | ✅ | ✅ (specific day/time) | — | — | via date | — | 📄 | Verified |
| Wait until date property (± offset) | ✅ | ✅ (date field ± days) | — | — | 📄 | — | — | Verified |
| **Wait until condition/event met (with timeout)** | ✅ delay until event occurrence | ✅ wait until conditions met + time limit | 📄 wait for trigger | 📄 triggers wait for prospect actions (listen windows) | ◻︎ wait until | — | — | Verified — the "listen" pattern |
| Send-window constraints (days of week / time of day) | ✅ | via wait day/time | — | 📄 (business hours) | ◻︎ | ◻︎ smart send time | — | HS verified |
| Business-days-only delays | ✅ sequences (≤90 business days) | — | — | — | — | — | — | HS sequences verified — rare |

### B3. Logic / branching
| Action | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| If/else conditional branch | ✅ (3 branch types) | 📄 if/else (Yes/No paths) | 📄 conditional split (≤5 conditions, Standard+) | 📄 rules (criteria paths) | 📄 true/false branch | 📄 conditional split | ◻︎ | HS verified 3-0; all official |
| Multi-branch on property value | ✅ up to 250 branches | via chained if/else | — | — | 📄 multi-split | — | — | HS verified — 250 branches is best-in-class |
| Percentage / random split (A/B path) | ✅ (Marketing Pro+) | ◻︎ split action | 📄 percentage split | — | 📄 random cohort | 📄 A/B test action | — | HS verified (tier-gated); MC/KL official |
| Branch on trigger payload | — | — | — | — | via data | 📄 trigger split (metric/price-drop flows) | — | KL official — distinctive |
| Goal step (jump ahead when goal met) | via goal criteria | ◻︎ goal action | — | — | ◻︎ | — | — | AC's signature pattern (article; unverified pass) |

### B4. CRM / data operations
| Action | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Update contact property/field | ✅ edit record | ◻︎ update field | 📄 update contact | 📄 change prospect field value | 📄 update attribute | 📄 update profile property | ◻︎ | HS verified; MC/SF/KL official |
| Add / remove tag | via property | ◻︎ add/remove tag | 📄 tag/untag | 📄 apply tags | via attribute | — | ◻︎ | MC/SF official |
| Add / remove from list/segment | ✅ static list (Pro+) | ◻︎ subscribe/unsubscribe list | via groups | 📄 add/remove from list | 📄 manual segment | 📄 | ◻︎ | HS verified (tier-gated) |
| Adjust lead score | via property/score | ◻︎ add points | — | 📄 adjust score (± or set) | via attribute | — | ◻︎ | SF official |
| Create records (deal, ticket, task…) | ✅ contacts/companies/deals/tickets/leads/custom | ◻︎ add deal | — | 📄 create Salesforce task | — | — | — | HS verified — broadest |
| Create task for rep | ✅ | ◻︎ | — | 📄 | — | — | — | HS verified; SF official |
| Assign owner / rotate | ✅ (rotate/assign actions) | ◻︎ update owner | — | 📄 assign to user/group/queue/rule | — | — | — | SF official |
| Change lifecycle stage | ✅ via edit record | via field | — | via field/status | via attribute | — | — | HS verified (property edit) |
| Unsubscribe contact | — | ◻︎ | 📄 unsubscribe action | — | 📄 | — | — | MC official — rare as explicit step |

### B5. Cross-automation & integration
| Action | HS | AC | MC | SF | CIO | KL | ZH | Evidence |
|---|---|---|---|---|---|---|---|---|
| Enroll into another automation | ✅ go to workflow | ◻︎ enter another automation | — | — | ◻︎ | — | — | HS verified 3-0 |
| Unenroll from another automation | ✅ unenroll from sequence | ◻︎ end other automation | — | — | — | — | — | HS verified |
| Enroll into a sales sequence | ✅ (Sales/Service Ent only) | — | — | — | — | — | — | HS verified — heavily tier-gated |
| Fire outbound webhook | ✅ (tiered) | 📄 webhook action | — | 📄 external actions | 📄 | ◻︎ | — | AC/SF/CIO official |
| Add to Salesforce campaign | — | ◻︎ | — | 📄 | — | — | — | SF official |
| Exit / end automation step | via goals/unenroll | ◻︎ exit this automation | — | 📄 end step | 📄 exit | — | — | AC article |

---

## C. Exit / suppression / re-enrollment semantics (verified)

| Semantic | HubSpot | ActiveCampaign | Mailchimp | Salesforce AE | Customer.io | Klaviyo |
|---|---|---|---|---|---|---|
| **Pause/unenroll on reply** | ✅ Sequences auto-unenroll on reply **or meeting booked** | reply can be a trigger; goal-based exits | — | — | via event filters | — |
| **One-automation-at-a-time exclusivity** | ✅ Contact can be in only **one sequence** at a time; no concurrent duplicate workflow enrollment | — (multiple allowed) | — | — | frequency caps | flow filters ("has not been in flow") |
| **Re-enrollment** | ✅ Off by default; explicit re-enrollment triggers; event triggers can fire every occurrence | re-entry configurable per trigger ("runs once / multiple times") | — | prospects run once per program by default | 📄 trigger frequency settings per campaign | 📄 "added to list" = once unless removed+re-added |
| **Goal attainment exit** | ✅ goal met → unenrolled (contact workflows) | ◻︎ goal action jumps/exits | — | — | ◻︎ conversion goal exits | — |
| **Suppression lists/segments** | ✅ suppression segment blocks enrollment + unenrolls immediately | via segment conditions | — | 📄 suppression lists on programs | segment filters | flow filters |
| **Unenroll when criteria no longer met** | ✅ explicit setting | via wait-until/goals | — | — | 📄 segment-exit ends campaign (optional) | flow filter re-check |

---

## D. Table-stakes vs rare vs Connect NX uniques

**Table stakes (ship or lose credibility):** send email; fixed wait; wait-until-date; if/else branch; segment/form/tag/manual enrollment; property-update, tag, and list actions; per-contact enrollment states; re-enrollment controls; internal notifications; unsubscribe handling.

**Tier-gated at incumbents (opportunity to include free):** HubSpot gates % split (Marketing Pro+), static-list actions (Pro+), webhook enrollment (Data Hub Pro/Ent), sequence-enrollment action (**Enterprise only**); AC gates CRM/deal triggers (Plus+); MC gates conditional split (Standard+) and caps steps (4 on Essentials vs 200 on Standard).

**Rare / differentiators observed:**
- Negative engagement triggers (MC "unopened campaign") — almost nobody else
- Reply-to-email as a *start* trigger (AC only)
- Business-days-only delays (HS sequences only)
- Trigger-payload split (KL trigger split)
- Price-drop trigger (KL only)
- Webhook-triggered data workflows (CIO)
- 250-branch property split (HS)
- Marketing automation + sales-sequence unification exists **only in HubSpot and only at Enterprise price**

**Connect NX candidate uniques (validated whitespace):**
1. **Unified marketing sequence + sales cadence in one builder** at base tier (HS charges Enterprise for the bridge; our existing sequences already mix email/WhatsApp/task steps)
2. **WhatsApp as a first-class sequence step** — none of HS/MC/SF/KL treat WhatsApp as a native drip step
3. **Pause-on-reply + goal exits + suppression on every plan** — each exists somewhere, no one ships all three ungated
4. **Live segment-count preview at enrollment config** (reuse our Module 2 engine — no incumbent shows live audience size while configuring a sequence trigger)
5. **Per-contact timeline continuity** — sequence enrollment events on the same contact timeline as campaigns (our spec's "Sequence-to-CRM Integration")

---

## E. Recommended Connect NX v1 catalog (for the UI build)

**Enrollment triggers (8):** Segment joined (live count preview) · Form submitted · Tag added · Manual enrollment (single + bulk) · Contact property changes · Email engagement (opened/clicked prior campaign) · Date-based (calendar or date field ± offset) · Enrolled by another automation *(Phase 2: webhook, custom event)*

**Step types (9):** Send email (template) · Send WhatsApp · Wait — fixed duration · Wait — until date/date-field · Wait — until condition met w/ timeout ("listen") · If/else branch (engagement or property, Yes/No paths) · A/B percentage split · Internal action (create task / notify owner / adjust score / update property / add tag) · Goal + Exit step

**Exit semantics (all v1):** pause-on-reply toggle (existing field) · goal attainment → Completed · suppression segment · unenroll if segment-exit (toggle) · re-enrollment policy (never / once per N days / every occurrence) · one-active-sequence-per-contact guard (HubSpot semantic)

**Per-contact enrollment states:** Active → Completed / Exited (with exit reason: replied, goal met, unenrolled manually, suppression, criteria no longer met) — matches spec's Active/Completed/Exited plus auditability.

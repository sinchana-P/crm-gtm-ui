"use client";

/**
 * A/B test lifecycle actions.
 *
 * Kept separate from `campaign-store` so the A/B feature is one removable unit,
 * but it writes through to the same campaign records via `updateCampaign`.
 *
 * `simulateEngagement` exists only for this prototype — in production those
 * numbers arrive from delivery/open/click events. The scenarios let every
 * outcome state (clear winner, too close, tied, thin sample, guardrail breach)
 * be reached without waiting on real traffic.
 */

import { create } from "zustand";
import type { AbTestConfig, AbTestVariant } from "@/lib/types";
import { evaluate } from "@/lib/ab-testing";
import { useCampaignStore } from "@/lib/stores/campaign-store";

export type SimulationScenario =
  | "clear_winner"
  | "close_call"
  | "tied"
  | "thin_sample"
  | "guardrail"
  | "skewed_split";

export const SCENARIO_LABELS: Record<SimulationScenario, string> = {
  clear_winner: "Clear winner",
  close_call: "Too close to call",
  tied: "Dead heat",
  thin_sample: "Not enough data",
  guardrail: "Winner burns the list",
  skewed_split: "Split came out uneven",
};

export const SCENARIO_HELP: Record<SimulationScenario, string> = {
  clear_winner: "B pulls decisively ahead — resolves at high confidence.",
  close_call: "B leads slightly but the gap stays inside the noise.",
  tied: "Both versions land within half a point of each other.",
  thin_sample: "Engagement comes back, but too little to separate them.",
  guardrail: "B wins on the metric while doubling unsubscribes.",
  skewed_split:
    "One version reached far fewer people than configured, so the groups aren't comparable.",
};

/** Deterministic 0-1 jitter so repeated simulations stay stable. */
function jitter(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface Profile {
  open: number;
  click: number;
  conv: number;
  unsub: number;
}

/** Per-variant engagement profile for a scenario. Index 0 is always the control. */
function profileFor(scenario: SimulationScenario, index: number): Profile {
  const spread = (base: number, step: number) => base + step * index;
  switch (scenario) {
    case "clear_winner":
      return { open: spread(0.266, 0.048), click: spread(0.079, 0.009), conv: spread(0.019, 0.003), unsub: 0.002 };
    case "close_call":
      return { open: spread(0.264, 0.011), click: spread(0.078, 0.002), conv: spread(0.019, 0.001), unsub: 0.002 };
    case "tied":
      return { open: spread(0.271, 0.002), click: spread(0.080, 0.0004), conv: spread(0.020, 0.0002), unsub: 0.002 };
    case "thin_sample":
      return { open: spread(0.26, 0.05), click: spread(0.07, 0.01), conv: spread(0.018, 0.003), unsub: 0.002 };
    case "skewed_split":
      // Same engagement profile as a clear winner — the point is that the
      // assignment is broken, not the content.
      return { open: spread(0.266, 0.048), click: spread(0.079, 0.009), conv: spread(0.019, 0.003), unsub: 0.002 };
    case "guardrail":
      return {
        open: spread(0.265, 0.05),
        click: spread(0.078, 0.012),
        conv: spread(0.019, 0.003),
        unsub: index === 0 ? 0.002 : 0.009,
      };
  }
  return { open: 0.26, click: 0.07, conv: 0.018, unsub: 0.002 };
}

interface AbTestActions {
  configure: (campaignId: string, config: AbTestConfig) => void;
  remove: (campaignId: string) => void;
  launch: (campaignId: string, audienceSize: number) => void;
  simulateEngagement: (campaignId: string, scenario: SimulationScenario) => void;
  runEvaluation: (campaignId: string) => void;
  declareWinner: (campaignId: string, variantId: string, opts?: { force?: boolean; by?: string }) => void;
  rolloutWinner: (campaignId: string) => void;
  extendWindow: (campaignId: string, hours: number) => void;
  stop: (campaignId: string, reason: string) => void;
  reset: (campaignId: string) => void;
}

function patchAb(campaignId: string, patch: Partial<AbTestConfig>) {
  const { campaigns, updateCampaign } = useCampaignStore.getState();
  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign?.abTest) return;
  updateCampaign(campaignId, { abTest: { ...campaign.abTest, ...patch } });
}

function readAb(campaignId: string) {
  const campaign = useCampaignStore.getState().campaigns.find((c) => c.id === campaignId);
  return campaign?.abTest;
}

export const useAbTestStore = create<AbTestActions>()(() => ({
  configure: (campaignId, config) => {
    useCampaignStore.getState().updateCampaign(campaignId, { abTest: config });
  },

  remove: (campaignId) => {
    useCampaignStore.getState().updateCampaign(campaignId, { abTest: undefined });
  },

  launch: (campaignId, audienceSize) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    const effectivePct = ab.splitMode === "permanent_5050" ? 100 : ab.samplePercent;
    const testCohort = Math.round((audienceSize * effectivePct) / 100);
    const now = Date.now();
    const variants = ab.variants.map((v) => {
      const weight = v.weight ?? 100 / ab.variants.length;
      const assigned = Math.round((testCohort * weight) / 100);
      return { ...v, assigned, sent: assigned, delivered: 0, opened: 0, clicked: 0, converted: 0, bounced: 0, unsubscribed: 0, winner: undefined };
    });
    patchAb(campaignId, {
      status: "running",
      dispatchedAt: now,
      evaluateAt: now + (ab.testWindowHours ?? 4) * 3_600_000,
      evaluatedAt: undefined,
      rolloutSize: Math.max(0, audienceSize - testCohort),
      winningVariantId: undefined,
      winnerIsSignificant: undefined,
      winnerConfidence: undefined,
      winnerSelectedBy: undefined,
      inconclusiveReason: undefined,
      comparisons: undefined,
      rolloutSentAt: undefined,
      stoppedReason: undefined,
      extensionCount: 0,
      variants,
    });
  },

  simulateEngagement: (campaignId, scenario) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    const variants: AbTestVariant[] = ab.variants.map((v, i) => {
      const configured = v.assigned ?? v.sent;
      // A broken split shows up as a version reaching far fewer people than set.
      const assigned =
        scenario === "skewed_split" && i > 0 ? Math.round(configured * 0.62) : configured;
      // A thin sample means few recipients had an outcome recorded at all.
      const reach = scenario === "thin_sample" ? 0.18 : 0.985;
      const deliveredCount = Math.max(0, Math.round(assigned * reach));
      const p = profileFor(scenario, i);
      const wobble = (jitter(`${campaignId}:${v.id}:${scenario}`) - 0.5) * 0.012;
      const opened = Math.round(deliveredCount * Math.max(0, p.open + wobble));
      const clicked = Math.min(opened, Math.round(deliveredCount * p.click));
      return {
        ...v,
        assigned,
        sent: assigned,
        delivered: deliveredCount,
        opened,
        clicked,
        converted: Math.min(clicked, Math.round(deliveredCount * p.conv)),
        bounced: Math.max(0, assigned - deliveredCount - (scenario === "thin_sample" ? Math.round(assigned * 0.8) : 0)),
        unsubscribed: Math.round(deliveredCount * p.unsub),
        winner: undefined,
      };
    });
    patchAb(campaignId, { variants });
  },

  runEvaluation: (campaignId) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    const result = evaluate(ab);
    const now = Date.now();

    // A permanent 50/50 split has no remainder, so nothing can roll out. HubSpot
    // hands the decision to the marketer, then sends only the winner to future
    // enrolments and archives the other version.
    if (ab.splitMode === "permanent_5050") {
      patchAb(campaignId, {
        status: "awaiting_decision",
        evaluatedAt: now,
        comparisons: result.comparisons,
        winnerConfidence: result.confidence,
        inconclusiveReason: result.inconclusiveReason,
        variants: ab.variants.map((v) => ({
          ...v,
          winner: result.significant && v.id === result.leaderId,
        })),
      });
      return;
    }

    // Measure-only tests learn and stop — there is no follow-up send.
    if (ab.winnerMode === "measure_only") {
      patchAb(campaignId, {
        status: "completed",
        evaluatedAt: now,
        comparisons: result.comparisons,
        winningVariantId: result.significant ? result.leaderId : undefined,
        winnerIsSignificant: result.significant,
        winnerConfidence: result.confidence,
        inconclusiveReason: result.inconclusiveReason,
        variants: ab.variants.map((v) => ({ ...v, winner: result.significant && v.id === result.leaderId })),
      });
      return;
    }

    // Manual mode always hands the decision back, significant or not.
    if (ab.winnerMode === "manual") {
      patchAb(campaignId, {
        status: "awaiting_decision",
        evaluatedAt: now,
        comparisons: result.comparisons,
        winnerConfidence: result.confidence,
        inconclusiveReason: result.inconclusiveReason,
        variants: ab.variants.map((v) => ({ ...v, winner: result.significant && v.id === result.leaderId })),
      });
      return;
    }

    // Inconclusive: send the version the marketer nominated as the fallback.
    // This is HubSpot's "Fallback version" rather than a policy choice.
    if (!result.significant) {
      const control = ab.variants.find((v) => v.isControl) ?? ab.variants[0];
      const chosen = ab.fallbackVariantId ?? control.id;
      patchAb(campaignId, {
        status: "inconclusive",
        evaluatedAt: now,
        comparisons: result.comparisons,
        winnerConfidence: result.confidence,
        inconclusiveReason: result.inconclusiveReason,
        winningVariantId: chosen,
        winnerIsSignificant: false,
        winnerSelectedBy: "SYSTEM",
        variants: ab.variants.map((v) => ({ ...v, winner: false })),
      });
      return;
    }

    patchAb(campaignId, {
      status: "winner_selected",
      evaluatedAt: now,
      comparisons: result.comparisons,
      winningVariantId: result.leaderId,
      winnerIsSignificant: true,
      winnerConfidence: result.confidence,
      winnerSelectedBy: "SYSTEM",
      variants: ab.variants.map((v) => ({ ...v, winner: v.id === result.leaderId })),
    });
  },

  declareWinner: (campaignId, variantId, opts) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    const result = evaluate(ab);
    const significant = result.significant && result.leaderId === variantId && !opts?.force;
    const permanent = ab.splitMode === "permanent_5050";

    patchAb(campaignId, {
      // On a permanent split there is nothing left to send, so choosing the
      // winner is the end of the test: future enrolments get it from here on.
      status: permanent ? "rolled_out" : "winner_selected",
      winningVariantId: variantId,
      winnerIsSignificant: significant,
      winnerConfidence: result.confidence,
      winnerSelectedBy: opts?.by ?? "Priya Sharma",
      rolloutSentAt: permanent ? Date.now() : undefined,
      variants: ab.variants.map((v) => ({
        ...v,
        winner: v.id === variantId,
        // HubSpot archives the losing variation once a winner is picked.
        archived: permanent ? v.id !== variantId : v.archived,
      })),
    });
  },

  rolloutWinner: (campaignId) => {
    const ab = readAb(campaignId);
    if (!ab?.winningVariantId) return;
    patchAb(campaignId, { status: "rolled_out", rolloutSentAt: Date.now() });
    useCampaignStore.getState().setStatus(campaignId, "completed");
  },

  extendWindow: (campaignId, hours) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    patchAb(campaignId, {
      status: "running",
      evaluateAt: (ab.evaluateAt ?? Date.now()) + hours * 3_600_000,
      testWindowHours: (ab.testWindowHours ?? 4) + hours,
      extensionCount: (ab.extensionCount ?? 0) + 1,
      evaluatedAt: undefined,
      inconclusiveReason: undefined,
    });
  },

  stop: (campaignId, reason) => {
    patchAb(campaignId, { status: "stopped", stoppedReason: reason, evaluatedAt: Date.now() });
  },

  reset: (campaignId) => {
    const ab = readAb(campaignId);
    if (!ab) return;
    patchAb(campaignId, {
      status: "scheduled",
      dispatchedAt: undefined,
      evaluateAt: undefined,
      evaluatedAt: undefined,
      winningVariantId: undefined,
      winnerIsSignificant: undefined,
      winnerConfidence: undefined,
      winnerSelectedBy: undefined,
      inconclusiveReason: undefined,
      comparisons: undefined,
      rolloutSentAt: undefined,
      stoppedReason: undefined,
      extensionCount: 0,
      variants: ab.variants.map((v) => ({
        ...v,
        delivered: 0, opened: 0, clicked: 0, converted: 0, bounced: 0, unsubscribed: 0, winner: undefined,
      })),
    });
  },
}));

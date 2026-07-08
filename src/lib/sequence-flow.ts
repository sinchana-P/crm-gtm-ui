import type { SequenceBranchPath, SequenceStep, SequenceStepType } from "@/lib/types";

/**
 * Pure helpers for manipulating a nested sequence flow tree.
 * A flow is an ordered list of steps; a `branch` step contains `branches`,
 * each of which has its own ordered list of steps (recursively).
 * Container id "main" refers to the top-level list; any other id refers to a
 * branch path's step list.
 */

export function makeStep(type: SequenceStepType, id: string): SequenceStep {
  const base: SequenceStep = { id, type, label: defaultLabel(type) };
  switch (type) {
    case "email":
      return { ...base, subject: "" };
    case "whatsapp":
      return { ...base, snippet: "" };
    case "wait":
      return { ...base, waitMode: "duration", waitValue: 2, waitUnit: "days" };
    case "branch":
      return {
        ...base,
        branchKind: "if_else",
        branches: [
          { id: `${id}-yes`, label: "Yes", condition: "", steps: [] },
          { id: `${id}-no`, label: "No", steps: [] },
        ],
      };
    case "action":
      return { ...base, actionType: "create_task", actionSummary: "" };
    case "goal":
      return { ...base, goalCondition: "" };
    default:
      return base;
  }
}

export function makePercentageBranches(id: string): SequenceBranchPath[] {
  return [
    { id: `${id}-a`, label: "Variant A", percent: 50, steps: [] },
    { id: `${id}-b`, label: "Variant B", percent: 50, steps: [] },
  ];
}

function defaultLabel(type: SequenceStepType): string {
  switch (type) {
    case "email":
      return "New email";
    case "whatsapp":
      return "New WhatsApp message";
    case "wait":
      return "Wait 2 days";
    case "branch":
      return "New branch";
    case "action":
      return "New action";
    case "goal":
      return "Goal";
    default:
      return "Step";
  }
}

export function updateStep(
  flow: SequenceStep[],
  id: string,
  patch: Partial<SequenceStep>
): SequenceStep[] {
  return flow.map((step) => {
    if (step.id === id) {
      const next = { ...step, ...patch };
      // Switching an if/else branch to a percentage split re-seeds the paths
      // (and vice versa) while preserving nested steps where possible.
      if (patch.branchKind && patch.branchKind !== step.branchKind) {
        if (patch.branchKind === "percentage") {
          const seeded = makePercentageBranches(step.id);
          next.branches = seeded.map((b, i) => ({
            ...b,
            steps: step.branches?.[i]?.steps ?? [],
          }));
        } else {
          next.branches = [
            { id: `${step.id}-yes`, label: "Yes", condition: "", steps: step.branches?.[0]?.steps ?? [] },
            { id: `${step.id}-no`, label: "No", steps: step.branches?.[1]?.steps ?? [] },
          ];
        }
      }
      return next;
    }
    if (step.branches) {
      return {
        ...step,
        branches: step.branches.map((b) => ({ ...b, steps: updateStep(b.steps, id, patch) })),
      };
    }
    return step;
  });
}

export function removeStep(flow: SequenceStep[], id: string): SequenceStep[] {
  return flow
    .filter((step) => step.id !== id)
    .map((step) =>
      step.branches
        ? { ...step, branches: step.branches.map((b) => ({ ...b, steps: removeStep(b.steps, id) })) }
        : step
    );
}

export function insertAfter(
  flow: SequenceStep[],
  afterId: string,
  newStep: SequenceStep
): SequenceStep[] {
  const idx = flow.findIndex((s) => s.id === afterId);
  if (idx !== -1) {
    const next = [...flow];
    next.splice(idx + 1, 0, newStep);
    return next;
  }
  return flow.map((step) =>
    step.branches
      ? {
          ...step,
          branches: step.branches.map((b) => ({ ...b, steps: insertAfter(b.steps, afterId, newStep) })),
        }
      : step
  );
}

export function appendToContainer(
  flow: SequenceStep[],
  containerId: string,
  newStep: SequenceStep
): SequenceStep[] {
  if (containerId === "main") return [...flow, newStep];
  return flow.map((step) =>
    step.branches
      ? {
          ...step,
          branches: step.branches.map((b) =>
            b.id === containerId
              ? { ...b, steps: [...b.steps, newStep] }
              : { ...b, steps: appendToContainer(b.steps, containerId, newStep) }
          ),
        }
      : step
  );
}

export function findStep(flow: SequenceStep[], id: string): SequenceStep | undefined {
  for (const step of flow) {
    if (step.id === id) return step;
    if (step.branches) {
      for (const b of step.branches) {
        const found = findStep(b.steps, id);
        if (found) return found;
      }
    }
  }
  return undefined;
}

/** Validation issues that should block activation. */
export function validateFlow(flow: SequenceStep[]): string[] {
  const issues: string[] = [];
  const walk = (steps: SequenceStep[], where: string) => {
    steps.forEach((s) => {
      if (s.type === "email" && !s.templateId) {
        issues.push(`${where}“${s.label}” has no template selected`);
      }
      if (s.type === "branch" && s.branchKind === "percentage") {
        const total = (s.branches ?? []).reduce((n, b) => n + (b.percent ?? 0), 0);
        if (total !== 100) issues.push(`${where}“${s.label}” split does not total 100%`);
      }
      if (s.branches) s.branches.forEach((b) => walk(b.steps, `${s.label} › ${b.label}: `));
    });
  };
  walk(flow, "");
  return issues;
}

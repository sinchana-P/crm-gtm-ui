import type {
  AutomationBranchPath,
  AutomationNode,
  AutomationNodeType,
} from "@/lib/types";

/**
 * Pure tree helpers for the automation canvas. Mirrors sequence-flow but typed
 * for AutomationNode (branch children live under `branches[].nodes`).
 * Container id "root" = top-level list; any other id = a branch path's node list.
 */

let counter = 0;
export function createNodeId() {
  counter += 1;
  return `an-${Date.now()}-${counter}`;
}

export function makeNode(type: AutomationNodeType, id: string): AutomationNode {
  const base: AutomationNode = { id, type, label: defaultLabel(type) };
  switch (type) {
    case "send_email":
      return { ...base, subject: "" };
    case "send_whatsapp":
      return { ...base, snippet: "" };
    case "delay":
      return { ...base, delayMode: "duration", delayValue: 1, delayUnit: "days" };
    case "branch":
      return {
        ...base,
        branchKind: "if_else",
        branches: [
          { id: `${id}-yes`, label: "Yes", condition: "", nodes: [] },
          { id: `${id}-no`, label: "No", nodes: [] },
        ],
      };
    case "action":
      return { ...base, actionType: "set_property", actionSummary: "" };
    case "goal":
      return { ...base, goalCondition: "" };
    default:
      return base;
  }
}

export function makePercentageBranches(id: string): AutomationBranchPath[] {
  return [
    { id: `${id}-a`, label: "Variant A", percent: 50, nodes: [] },
    { id: `${id}-b`, label: "Variant B", percent: 50, nodes: [] },
  ];
}

function defaultLabel(type: AutomationNodeType): string {
  switch (type) {
    case "send_email":
      return "Send email";
    case "send_whatsapp":
      return "Send WhatsApp";
    case "delay":
      return "Delay 1 day";
    case "branch":
      return "If / then branch";
    case "action":
      return "Set a property";
    case "goal":
      return "Goal";
    case "end":
      return "End workflow";
    default:
      return "Step";
  }
}

export function updateNode(
  nodes: AutomationNode[],
  id: string,
  patch: Partial<AutomationNode>
): AutomationNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      const next = { ...node, ...patch };
      if (patch.branchKind && patch.branchKind !== node.branchKind) {
        if (patch.branchKind === "percentage") {
          next.branches = makePercentageBranches(node.id).map((b, i) => ({
            ...b,
            nodes: node.branches?.[i]?.nodes ?? [],
          }));
        } else {
          next.branches = [
            { id: `${node.id}-yes`, label: "Yes", condition: "", nodes: node.branches?.[0]?.nodes ?? [] },
            { id: `${node.id}-no`, label: "No", nodes: node.branches?.[1]?.nodes ?? [] },
          ];
        }
      }
      return next;
    }
    if (node.branches) {
      return {
        ...node,
        branches: node.branches.map((b) => ({ ...b, nodes: updateNode(b.nodes, id, patch) })),
      };
    }
    return node;
  });
}

export function removeNode(nodes: AutomationNode[], id: string): AutomationNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.branches
        ? { ...n, branches: n.branches.map((b) => ({ ...b, nodes: removeNode(b.nodes, id) })) }
        : n
    );
}

export function insertAfter(
  nodes: AutomationNode[],
  afterId: string,
  newNode: AutomationNode
): AutomationNode[] {
  const idx = nodes.findIndex((n) => n.id === afterId);
  if (idx !== -1) {
    const next = [...nodes];
    next.splice(idx + 1, 0, newNode);
    return next;
  }
  return nodes.map((n) =>
    n.branches
      ? { ...n, branches: n.branches.map((b) => ({ ...b, nodes: insertAfter(b.nodes, afterId, newNode) })) }
      : n
  );
}

export function appendToContainer(
  nodes: AutomationNode[],
  containerId: string,
  newNode: AutomationNode
): AutomationNode[] {
  if (containerId === "root") return [...nodes, newNode];
  return nodes.map((n) =>
    n.branches
      ? {
          ...n,
          branches: n.branches.map((b) =>
            b.id === containerId
              ? { ...b, nodes: [...b.nodes, newNode] }
              : { ...b, nodes: appendToContainer(b.nodes, containerId, newNode) }
          ),
        }
      : n
  );
}

export function findNode(nodes: AutomationNode[], id: string): AutomationNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.branches) {
      for (const b of node.branches) {
        const found = findNode(b.nodes, id);
        if (found) return found;
      }
    }
  }
  return undefined;
}

export function countNodes(nodes: AutomationNode[]): number {
  return nodes.reduce((n, node) => {
    if (node.type === "branch" && node.branches) {
      return n + 1 + node.branches.reduce((m, b) => m + countNodes(b.nodes), 0);
    }
    return n + 1;
  }, 0);
}

export function validateWorkflow(
  triggers: unknown[],
  nodes: AutomationNode[]
): string[] {
  const issues: string[] = [];
  if (triggers.length === 0) issues.push("Add at least one enrollment trigger");
  if (nodes.length === 0) issues.push("Add at least one action to the canvas");
  const walk = (list: AutomationNode[], where: string) => {
    list.forEach((n) => {
      if (n.type === "send_email" && !n.templateId) {
        issues.push(`${where}“${n.label}” has no template selected`);
      }
      if (n.type === "branch" && n.branchKind === "percentage") {
        const total = (n.branches ?? []).reduce((s, b) => s + (b.percent ?? 0), 0);
        if (total !== 100) issues.push(`${where}“${n.label}” split does not total 100%`);
      }
      if (n.branches) n.branches.forEach((b) => walk(b.nodes, `${n.label} › ${b.label}: `));
    });
  };
  walk(nodes, "");
  return issues;
}

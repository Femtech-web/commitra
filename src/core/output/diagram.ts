
type Node = { id: string; label: string; group: string };
type Edge = { from: string; to: string; label?: string };

export function mermaidFromDiagramJson(data: any, type: "flow" | "sequence" | "system") {
  const nodes: Node[] = Array.isArray(data.nodes) ? data.nodes : [];
  const edges: Edge[] = Array.isArray(data.edges) ? data.edges : [];
  const seq = Array.isArray(data.sequence_steps) ? data.sequence_steps : [];
  const groups = data.system_groups || {};

  /* =======================
        SEQUENCE DIAGRAM
     ======================= */
  if (type === "sequence") {
    const lines = ["sequenceDiagram"];

    if (seq.length) {
      for (const step of seq) {
        const actor = normalizeLabel(step.actor || "Actor");
        const target = normalizeLabel(step.target || "Target");
        const action = normalizeLabel(step.action || "");
        lines.push(`${actor}->>${target}: ${action}`);
      }
    } else {
      const pf = Array.isArray(data.primary_flow) ? data.primary_flow : [];
      for (let i = 0; i < pf.length - 1; i++) {
        const aLabel = normalizeLabel(getNodeLabel(nodes, pf[i]));
        const bLabel = normalizeLabel(getNodeLabel(nodes, pf[i + 1]));
        lines.push(`${aLabel}->>${bLabel}: request`);
      }
    }
    return lines.join("\n");
  }

  /* =======================
          SYSTEM DIAGRAM
     ======================= */
  if (type === "system") {
    const lines = ["flowchart LR"];

    for (const [groupName, ids] of Object.entries(groups)) {
      lines.push(`subgraph ${safeId(groupName)}`);

      for (const id of ids as string[]) {
        const rawLabel = getNodeLabel(nodes, id);
        const cleanLabel = cleanMermaidLabel(rawLabel);
        lines.push(`${safeId(id)}["${escapeLabel(cleanLabel)}"]`);
      }

      lines.push("end");
    }

    for (const e of edges) {
      const lbl = cleanMermaidLabel(e.label || "");
      lines.push(`${safeId(e.from)} -->|${escapeLabel(lbl)}| ${safeId(e.to)}`);
    }

    return lines.join("\n");
  }

  /* =======================
            FLOW DIAGRAM
     ======================= */
  {
    const lines = ["flowchart TD"];

    for (const n of nodes) {
      const raw = normalizeLabel(n.label);
      const cleanLabel = cleanMermaidLabel(raw);
      lines.push(`${safeId(n.id)}["${escapeLabel(cleanLabel)}"]`);
    }

    // primary flow
    const pf = Array.isArray(data.primary_flow) ? data.primary_flow : [];
    for (let i = 0; i < pf.length - 1; i++) {
      lines.push(`${safeId(pf[i])} --> ${safeId(pf[i + 1])}`);
    }

    // edges
    for (const e of edges) {
      const lbl = cleanMermaidLabel(e.label || "");
      lines.push(`${safeId(e.from)} -->|${escapeLabel(lbl)}| ${safeId(e.to)}`);
    }

    return lines.join("\n");
  }
}

/* ==============================
   Sanitization utilities
   ============================== */

function escapeLabel(s: string) {
  if (!s) return "";
  return String(s)
    .replace(/\n/g, " ")
    .replace(/\|/g, " ");
}

function getNodeLabel(nodes: Node[], id: string) {
  const n = nodes.find((x) => x.id === id);
  return n ? n.label : id;
}

function normalizeLabel(label: string) {
  return label
    .replace(/\[([^\]]+)\]/g, ":$1")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")");
}

function cleanMermaidLabel(label: string) {
  return normalizeLabel(label).replace(/^\/+/, "");
}

function safeId(id: string) {
  return id
    .replace(/\W+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "");
}

/* ==============================
   FALLBACK DIAGRAM GENERATOR
   ============================== */

export function fallbackMermaidFromContext(ctx: any, type: "flow" | "sequence" | "system") {
  const nodes: Node[] = [];

  // Client node
  nodes.push({
    id: safeId("Client"),
    label: "Client (Browser)",
    group: "client"
  });

  // Frontend detection
  const hasSrc = ctx.structure.includes("src");
  if (hasSrc) {
    nodes.push({
      id: safeId("Frontend"),
      label: cleanMermaidLabel("Frontend (src/components / pages)"),
      group: "frontend"
    });
  }

  // API nodes 
  const apiNodes = (ctx.apis || []).map((r: any, i: number) => {
    const id = safeId(`API${i}`);
    const method = (r.method || "GET").toUpperCase();
    const label = cleanMermaidLabel(`${method} ${r.path}`);
    nodes.push({ id, label, group: "api" });
    return id;
  });

  // Services
  nodes.push({
    id: safeId("Services"),
    label: cleanMermaidLabel("Service Layer (lib/*)"),
    group: "service"
  });

  // Database / Blockchain
  const hasContracts = ctx.structure.includes("contracts");
  nodes.push({
    id: safeId("Database"),
    label: cleanMermaidLabel("Database (Supabase/LibSQL)"),
    group: "database"
  });

  if (hasContracts) {
    nodes.push({
      id: safeId("Blockchain"),
      label: cleanMermaidLabel("Blockchain / ArcID contracts"),
      group: "blockchain"
    });
  }

  /* --------------------------
           SEQUENCE MODE
     -------------------------- */
  if (type === "sequence") {
    const lines = [
      "sequenceDiagram",
      "participant U as User",
      "participant FE as Frontend",
      "participant API as API",
      "participant SRV as Services"
    ];

    if (hasContracts) lines.push("participant CH as Blockchain");

    lines.push("U->>FE: User action");

    if (apiNodes.length) {
      lines.push("FE->>API: call endpoint");
      lines.push("API->>SRV: delegate to service");
    } else {
      lines.push("FE->>SRV: call service");
    }

    if (hasContracts) {
      lines.push("SRV->>CH: write tx");
      lines.push("CH-->>SRV: tx receipt");
    } else {
      lines.push("SRV->>Database: store/read");
      lines.push("Database-->>SRV: result");
    }

    lines.push("SRV-->>API: response");
    lines.push("API-->>FE: JSON");
    lines.push("FE-->>U: UI update");

    return lines.join("\n");
  }

  /* --------------------------
           SYSTEM MODE
     -------------------------- */
  if (type === "system") {
    const lines = [
      "flowchart LR",
      "subgraph Frontend",
      `FE["${escapeLabel(cleanMermaidLabel("Frontend: src/components"))}"]`,
      "end",
      "subgraph API",
      `A1["/api/*"]`,
      "end",
      "subgraph Services",
      `S1["lib/*"]`,
      "end",
      "subgraph Data",
      `DB["Supabase / LibSQL"]`
    ];

    if (hasContracts) lines.push(`BC["Contracts / ABI"]`);
    lines.push("end");

    lines.push("FE --> A1");
    lines.push("A1 --> S1");
    if (hasContracts) lines.push("S1 --> BC");
    lines.push("S1 --> DB");

    return lines.join("\n");
  }

  /* --------------------------
            FLOW MODE
     -------------------------- */
  const lines = ["flowchart TD", "Client --> Frontend"];

  apiNodes.forEach((id: any) => lines.push(`Frontend --> ${id}`));

  lines.push("Frontend --> Services");
  if (hasContracts) lines.push("Services --> Blockchain");
  lines.push("Services --> Database");

  return lines.join("\n");
}

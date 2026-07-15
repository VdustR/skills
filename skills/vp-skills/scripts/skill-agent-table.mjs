#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  closeSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const AGENT_NAMES = new Map([
  ["aider-desk", "AiderDesk"],
  ["amp", "Amp"],
  ["antigravity", "Antigravity"],
  ["claude-code", "Claude Code"],
  ["cline", "Cline"],
  ["codex", "Codex"],
  ["cursor", "Cursor"],
  ["deep-agents", "Deep Agents"],
  ["dexto", "Dexto"],
  ["firebender", "Firebender"],
  ["gemini-cli", "Gemini CLI"],
  ["github-copilot", "GitHub Copilot"],
  ["kimi-code-cli", "Kimi Code CLI"],
  ["kiro-cli", "Kiro CLI"],
  ["opencode", "OpenCode"],
  ["replit", "Replit"],
  ["universal", "Universal"],
  ["warp", "Warp"],
  ["windsurf", "Windsurf"],
]);

const UNIVERSAL_AGENT_NAMES = [
  "Amp",
  "Antigravity",
  "Cline",
  "Codex",
  "Cursor",
  "Deep Agents",
  "Dexto",
  "Firebender",
  "Gemini CLI",
  "GitHub Copilot",
  "Kimi Code CLI",
  "OpenCode",
  "Replit",
  "Warp",
  "Universal",
];

function usage() {
  console.log(`Usage:
  skill-agent-table.mjs [options]

Options:
  --scope global|project     Scope to list (default: global)
  --filter <regex>           Filter skill names
  --matrix [agents...]       Show yes/no columns for agents
  --summary                  Count installed skills per agent
  --max-agents <n>           Compact table agent preview size (default: 6)
  --full-agents              Do not shorten compact agent lists
  -h, --help                 Show help

Examples:
  skill-agent-table.mjs --filter '^vp-'
  skill-agent-table.mjs --filter '^vp-' --matrix codex claude-code gemini-cli
  skill-agent-table.mjs --summary`);
}

function parseArgs(argv) {
  const options = {
    scope: "global",
    mode: "compact",
    matrixAgents: [],
    maxAgents: 6,
    fullAgents: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--scope") {
      options.scope = argv[++i];
    } else if (arg === "--filter") {
      options.filter = argv[++i];
    } else if (arg === "--matrix") {
      options.mode = "matrix";
      while (argv[i + 1] && !argv[i + 1].startsWith("-")) {
        options.matrixAgents.push(argv[++i]);
      }
    } else if (arg === "--summary") {
      options.mode = "summary";
    } else if (arg === "--max-agents") {
      options.maxAgents = Number(argv[++i]);
    } else if (arg === "--full-agents") {
      options.fullAgents = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!["global", "project"].includes(options.scope)) {
    throw new Error("--scope must be global or project");
  }
  if (!Number.isInteger(options.maxAgents) || options.maxAgents < 1) {
    throw new Error("--max-agents must be a positive integer");
  }
  return options;
}

function runSkillsList(scope) {
  const args = ["-y", "skills@1.5.3", "list", "--json"];
  if (scope === "global") args.push("-g");

  // skills@1.5.3 can exit before a large piped stdout finishes flushing.
  // Capturing to a regular file keeps the JSON complete before parsing.
  const tempDir = mkdtempSync(join(tmpdir(), "vp-skills-list-"));
  const outputPath = join(tempDir, "skills.json");
  let outputFd;

  try {
    outputFd = openSync(outputPath, "w", 0o600);
    const result = spawnSync("npx", args, {
      encoding: "utf8",
      stdio: ["ignore", outputFd, "pipe"],
    });

    const completedOutputFd = outputFd;
    outputFd = undefined;
    closeSync(completedOutputFd);

    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
      throw new Error(stderr || `skills list failed with status ${result.status}`);
    }

    return JSON.parse(readFileSync(outputPath, "utf8"));
  } finally {
    if (outputFd !== undefined) closeSync(outputFd);
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function normalizeAgent(input) {
  return AGENT_NAMES.get(input.toLowerCase()) || input;
}

function filterSkills(skills, pattern) {
  if (!pattern) return skills;
  const regex = new RegExp(pattern);
  return skills.filter((skill) => regex.test(skill.name));
}

function globalCanonicalSkillPath(skill) {
  const canonicalDir = join(homedir(), ".agents", "skills", skill.name);
  return skill.scope === "global" && skill.path === canonicalDir;
}

function effectiveAgents(skill) {
  const agents = skill.agents.map(normalizeAgent);
  if (globalCanonicalSkillPath(skill)) {
    for (const agent of UNIVERSAL_AGENT_NAMES) {
      if (!agents.includes(agent)) {
        agents.push(agent);
      }
    }
  }
  return agents;
}

function formatAgentList(agents, options) {
  if (agents.length === 0) return "not linked";
  if (options.fullAgents || agents.length <= options.maxAgents) {
    return agents.join(", ");
  }
  const shown = agents.slice(0, options.maxAgents).join(", ");
  return `${shown} +${agents.length - options.maxAgents} more`;
}

function rowsCompact(skills, options) {
  return [
    ["skill", "scope", "agent_count", "agents"],
    ...skills.map((skill) => {
      const agents = effectiveAgents(skill);
      return [skill.name, skill.scope, String(agents.length), formatAgentList(agents, options)];
    }),
  ];
}

function rowsMatrix(skills, options) {
  const agents = options.matrixAgents.length
    ? options.matrixAgents.map(normalizeAgent)
    : ["Codex", "Claude Code", "Gemini CLI", "GitHub Copilot", "Antigravity"];
  return [
    ["skill", ...agents.map((agent) => agent.toLowerCase().replaceAll(" ", "_")), "agent_count"],
    ...skills.map((skill) => {
      const installedAgents = effectiveAgents(skill);
      return [
        skill.name,
        ...agents.map((agent) => (installedAgents.includes(agent) ? "yes" : ".")),
        String(installedAgents.length),
      ];
    }),
  ];
}

function rowsSummary(skills) {
  const counts = new Map();
  for (const skill of skills) {
    for (const agent of effectiveAgents(skill)) {
      counts.set(agent, (counts.get(agent) || 0) + 1);
    }
  }
  return [
    ["agent", "skill_count"],
    ...Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([agent, count]) => [agent, String(count)]),
  ];
}

function printTable(rows) {
  const widths = rows[0].map((_, col) =>
    Math.max(...rows.map((row) => String(row[col] || "").length)),
  );
  for (const row of rows) {
    console.log(
      row
        .map((cell, col) => String(cell || "").padEnd(widths[col]))
        .join("  ")
        .trimEnd(),
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const skills = filterSkills(runSkillsList(options.scope), options.filter);
  if (options.mode === "summary") printTable(rowsSummary(skills));
  else if (options.mode === "matrix") printTable(rowsMatrix(skills, options));
  else printTable(rowsCompact(skills, options));
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

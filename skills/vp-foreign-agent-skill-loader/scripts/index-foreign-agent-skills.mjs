#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const usage = `Usage:
  index-foreign-agent-skills.mjs [--root <dir>] [--current-agent <name>] [--format markdown|json]

Scans .<agent>/skills/<skill-name>/SKILL.md under the repository root, filters
the current agent's own root, and prints a frontmatter-only index.
`;

const options = parseArgs(process.argv.slice(2));
const root = path.resolve(options.root ?? process.cwd());
const currentAgent = normalizeAgent(options.currentAgent ?? "");
const format = options.format ?? "markdown";

if (!["markdown", "json"].includes(format)) {
  fail(`unsupported format: ${format}`);
}

const skills = scanForeignSkills(root, currentAgent);

if (format === "json") {
  process.stdout.write(`${JSON.stringify({ root, currentAgent, skills }, null, 2)}\n`);
} else {
  process.stdout.write(formatMarkdown(root, currentAgent, skills));
}

function parseArgs(args) {
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      process.stdout.write(usage);
      process.exit(0);
    }

    if (arg === "--root" || arg === "--current-agent" || arg === "--format") {
      const value = args[i + 1];
      if (!value || value.startsWith("--")) {
        fail(`${arg} requires a value`);
      }
      parsed[toCamelCase(arg.slice(2))] = value;
      i += 1;
      continue;
    }

    fail(`unknown option: ${arg}`);
  }

  return parsed;
}

function scanForeignSkills(repoRoot, activeAgent) {
  const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
  const indexed = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith(".") || entry.name === ".git") {
      continue;
    }

    const rawAgent = entry.name.slice(1);
    if (!isAgentName(rawAgent)) {
      continue;
    }

    const sourceAgent = normalizeAgent(rawAgent);
    if (activeAgent && sourceAgent === activeAgent) {
      continue;
    }

    const sourceRoot = `${entry.name}/skills`;
    const absoluteSourceRoot = path.join(repoRoot, sourceRoot);
    if (!isDirectory(absoluteSourceRoot)) {
      continue;
    }

    for (const skillName of fs.readdirSync(absoluteSourceRoot).sort()) {
      const skillDir = path.join(absoluteSourceRoot, skillName);
      if (!isDirectory(skillDir)) {
        continue;
      }

      const skillPath = path.join(skillDir, "SKILL.md");
      if (!fs.existsSync(skillPath)) {
        continue;
      }

      const frontmatter = readFrontmatter(skillPath);
      if (!frontmatter) {
        continue;
      }

      const metadata = parseFrontmatter(frontmatter);
      indexed.push({
        name: metadata.name || skillName,
        description: metadata.description || "",
        path: toPosixPath(path.relative(repoRoot, skillPath)),
        source_agent: sourceAgent,
        source_root: sourceRoot,
      });
    }
  }

  return indexed.sort((left, right) =>
    `${left.source_agent}/${left.name}`.localeCompare(`${right.source_agent}/${right.name}`),
  );
}

function readFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    return "";
  }

  const end = lines.indexOf("---", 1);
  if (end === -1) {
    return "";
  }

  return lines.slice(1, end).join("\n");
}

function parseFrontmatter(frontmatter) {
  const result = {};
  const lines = frontmatter.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^([A-Za-z0-9_-]+):(?:\s*)(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (rawValue === ">" || rawValue === ">-" || rawValue === "|" || rawValue === "|-") {
      const block = [];
      const baseIndent = leadingSpaces(lines[i]);

      while (i + 1 < lines.length && leadingSpaces(lines[i + 1]) > baseIndent) {
        i += 1;
        block.push(lines[i].trim());
      }

      result[key] = rawValue.startsWith("|") ? block.join("\n").trim() : block.join(" ").trim();
      continue;
    }

    result[key] = unquote(rawValue.trim());
  }

  return result;
}

function formatMarkdown(repoRoot, activeAgent, skills) {
  const lines = [
    "# Foreign Agent Skill Index",
    "",
    `Root: \`${repoRoot}\``,
    `Current agent: \`${activeAgent || "unknown"}\``,
    "Pattern: `.<agent>/skills/<skill-name>/SKILL.md`",
    "",
  ];

  if (skills.length === 0) {
    lines.push("No foreign agent skills found.", "");
    return lines.join("\n");
  }

  lines.push("| Source | Skill | Description | Path |");
  lines.push("| --- | --- | --- | --- |");

  for (const skill of skills) {
    lines.push(
      `| ${escapeCell(skill.source_agent)} | ${escapeCell(skill.name)} | ${escapeCell(skill.description)} | \`${skill.path}\` |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

function normalizeAgent(agent) {
  const normalized = agent.trim().replace(/^@/, "").toLowerCase();
  if (normalized === "claude-code") {
    return "claude";
  }
  return normalized;
}

function isAgentName(name) {
  return /^[A-Za-z0-9_-]+$/.test(name);
}

function isDirectory(candidate) {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}

function leadingSpaces(line) {
  return line.match(/^ */)[0].length;
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function escapeCell(value) {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function fail(message) {
  process.stderr.write(`Error: ${message}\n\n${usage}`);
  process.exit(1);
}

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(root, "skills");
const skillNames = new Set(
  readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);

const internalUrl = (name) =>
  `https://github.com/VdustR/skills/tree/main/skills/${name}`;

test("related skills sections follow the repository convention", () => {
  for (const skillName of skillNames) {
    const path = join(skillsRoot, skillName, "SKILL.md");
    const source = readFileSync(path, "utf8");
    const marker = "\n## Related skills\n";
    const markerIndex = source.indexOf(marker);

    if (markerIndex === -1) continue;

    assert.equal(
      source.indexOf(marker, markerIndex + marker.length),
      -1,
      `${skillName} has more than one Related skills section`,
    );

    const section = source.slice(markerIndex + marker.length).trim();
    assert.doesNotMatch(
      section,
      /^#{1,6} /m,
      `${skillName} must keep Related skills as its final section`,
    );

    const entries = [...section.matchAll(/^- \[`([^`]+)`\]\(([^)]+)\)/gm)];
    const bulletCount = (section.match(/^- /gm) || []).length;
    assert.equal(
      entries.length,
      bulletCount,
      `${skillName} has a related-skill entry outside the required link shape`,
    );
    assert.ok(
      entries.length >= 1 && entries.length <= 5,
      `${skillName} must list one to five related skills`,
    );

    const relatedNames = entries.map((entry) => entry[1]);
    assert.equal(
      new Set(relatedNames).size,
      relatedNames.length,
      `${skillName} repeats a related skill`,
    );
    assert.ok(
      !relatedNames.includes(skillName),
      `${skillName} must not link to itself`,
    );

    for (const [index, entry] of entries.entries()) {
      const [, relatedName, url] = entry;
      const nextEntry = entries[index + 1];
      const phrase = section
        .slice(entry.index + entry[0].length, nextEntry?.index)
        .trim();
      assert.ok(
        phrase.length > 0,
        `${skillName} must state the handoff for ${relatedName}`,
      );
      assert.match(
        url,
        /^https:\/\/[^\s)]+$/,
        `${skillName} must use an absolute HTTPS URL for ${relatedName}`,
      );

      if (url.startsWith("https://github.com/VdustR/skills/tree/main/skills/")) {
        assert.ok(
          skillNames.has(relatedName),
          `${skillName} links to missing internal skill ${relatedName}`,
        );
      }
      if (!skillNames.has(relatedName)) continue;
      assert.equal(
        url,
        internalUrl(relatedName),
        `${skillName} must use the canonical URL for ${relatedName}`,
      );
    }
  }
});

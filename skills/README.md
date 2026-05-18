# `/skills` — Agent-agnostic rule library

Reusable engineering rules for this repo, written **once** and consumed by **any**
AI agent (Claude Code, Cursor, Copilot, Windsurf, custom agents, CI review bots).
This folder — not `.claude/` — is the single source of truth.

## Why it lives here (not in `.claude/skills`)

- **Vendor-neutral.** No tool owns the rules; they're plain Markdown in the repo.
- **One source, many agents.** Each agent links to this folder instead of keeping
  its own divergent copy.
- **Per-project / per-team dynamic linking.** A project or team points its agent
  at these files via a symlink (or its own config), so updates here propagate
  everywhere automatically — no copy-paste drift.

## Format

Each skill is `skills/<name>/SKILL.md` with YAML frontmatter:

```markdown
---
name: <kebab-case-id>
description: <one line — when an agent should apply this skill>
---

# Body: actionable rules, checklists, do/don't.
```

This frontmatter is the Claude Code skill convention and is also trivially
parseable by any other agent or script.

## Skills

| Skill                         | Use when                                                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `nextpayments-conventions`    | Any change in this monorepo — no-hardcoding, design system, i18n, routing, naming                                |
| `component-reuse`             | Start of any UI task — reuse existing shared components before building new; new ones must follow the UI concept |
| `frontend-clean-architecture` | Structuring features/modules, deciding where code lives, reviewing separation/reuse                              |
| `react-nextjs-best-practices` | Writing React 19 / Next.js 15 App Router code                                                                    |
| `code-formatting`             | Before finishing any file change — Prettier-format to the repo config; never hand-format                         |
| `type-safety`                 | Writing/editing any TS/TSX — full explicit types/interfaces, no `any`, no unsafe casts                           |
| `git-teamwork`                | Before any change/commit — feature-branch only, branch naming, start new features from fresh main                |

## Wiring an agent to these skills (dynamic link)

The link is per project/agent so each can opt in without copying content:

- **Claude Code** — `.claude/skills/<name>` symlinks to `../../skills/<name>`
  (already set up in this repo). Claude auto-discovers them; edits to
  `/skills/**` take effect with no further step.
- **Other agents / repos** — symlink or reference this folder, e.g.:
  ```bash
  ln -s ../../skills <agent-config-dir>/rules        # same repo
  git submodule add <repo-url> shared/skills          # share across repos/teams
  ```
- **CI / scripts** — read `skills/*/SKILL.md` frontmatter directly.

## Editing

Edit the file under `/skills/**` (the real file). Never edit through a
`.claude/skills` symlink path conceptually — it resolves to the same file, but
keep the mental model that `/skills` is canonical. Adding a skill: create
`skills/<name>/SKILL.md`, then add the matching symlink under `.claude/skills/`
for Claude Code.

---
name: git-teamwork
description: Mandatory git branching rules for teamwork. Invoke before making ANY code change or commit — verify you are on a feature branch (never main/dev), branch with the correct naming, and start new features from up-to-date main.
---

# Git Teamwork Rules

Check these BEFORE the first edit of any task, and again before committing.

## 1. Never develop on a protected branch

- Run `git branch --show-current` first. If it is `main`, `master`, or `dev`
  (any shared/protected branch) → **stop and create a feature branch** before
  editing or committing. No commits directly on protected branches.
- If you already made edits on a protected branch, move them: create the
  feature branch from here (`git switch -c <name>`) — uncommitted changes carry
  over — then continue there.

## 2. Branch naming convention

```
<author_name>/<type>/<feature_name>
```

- `author_name` — the committer's handle (lowercase, e.g. `tai`).
- `type` — change kind: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`.
- `feature_name` — short kebab-case scope, e.g. `login-form`, `admin-overview`.

Examples: `tai/feat/admin-dashboard` · `tai/fix/login-redirect` ·
`lan/refactor/auth-constants`.

Create it: `git switch -c tai/feat/admin-dashboard`.

## 3. Start a brand-new feature from fresh main

When the work is a **completely new feature** (not continuing an existing
branch), branch off the latest protected branch:

```bash
git switch main
git pull --ff-only origin main      # get newest code first
git switch -c <author>/<type>/<feature_name>
```

Never start a new feature on top of stale `main` or an unrelated branch.

## Pre-commit checklist

- `git branch --show-current` → a properly named feature branch, not protected?
- For a new feature: was it branched from freshly pulled `main`?
- One coherent scope per branch/PR.

> Note: this agent does not push or open PRs unless explicitly asked. These
> rules still govern which branch local commits land on.

---
name: git-teamwork
description: Mandatory git workflow for teamwork. Invoke before making ANY code change or commit — check the branch, pull dev, cut a correctly-named feature branch (never commit on main/dev), keep the validation gate green per commit, then merge into dev and push (push ONLY after confirming with the user).
---

# Git Teamwork Rules

The end-to-end flow for every coding task. Check the branch BEFORE the first
edit, keep the gate green before each commit, and confirm before pushing.

## Task lifecycle (follow in order)

1. **Check branch** — `git branch --show-current`.
2. **Update base** — bring `dev` current: `git switch dev && git pull --ff-only origin dev`.
3. **Create feature branch** — `git switch -c <author>/<type>/<feature_name>` off the freshly-pulled `dev`.
4. **Work & commit** — one coherent scope; the validation gate must be GREEN before every commit.
5. **Merge into dev** — `git switch dev && git merge --no-ff <feature_branch>`.
6. **Push** — `git push origin dev`, but **only after confirming with the user** (push is shared / outward-facing and hard to reverse).

The sections below detail each rule.

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

## 3. Branch from an up-to-date dev

`dev` is the default base for new feature branches in this project. Pull it
fresh before cutting the branch:

```bash
git switch dev
git pull --ff-only origin dev      # get newest code first
git switch -c <author>/<type>/<feature_name>
```

Never start a new feature on top of a stale `dev` or an unrelated branch. If a
feature's code clearly lives on a different base (per the branch-topology
notes), verify and branch from there instead.

## 4. Merge & push (end of task)

- Merge the feature branch back into `dev` with a merge commit:
  `git switch dev && git merge --no-ff <feature_branch>` (the repo uses
  `merge:`-prefixed messages).
- **Confirm with the user before `git push`.** Never push automatically, even
  when the gate is green — pushing to the shared `dev` is outward-facing and
  hard to reverse. Before any push, the validation gate must have passed on the
  exact commits being pushed.

## Pre-commit / pre-push checklist

- `git branch --show-current` → a properly named feature branch, not protected?
- For a new feature: was it branched from a freshly pulled `dev`?
- One coherent scope per branch/PR.
- **Output validation gate is GREEN** — typecheck, lint, format, i18n parity (+ build when broad).
  See **nextpayments-conventions §6**. Never commit unformatted or failing code; run the gate
  before **every** commit, not just at task end.
- Staged diff reviewed (`git diff --cached`) — only intentional changes, no stray reformatting.
- Before pushing: **confirmed with the user**, and the gate passed on the exact commits being pushed.

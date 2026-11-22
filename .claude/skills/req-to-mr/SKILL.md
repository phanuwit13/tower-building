---
name: req-to-mr
description: Team AI workflow for this GitLab repo. Use when the user gives a requirement, feature request or bug to build, or runs /req-to-mr. Takes ONE requirement at a time from intake through clarification, GitLab issue, claim, plan, TDD implementation and verification to an open merge request, then loops for the next requirement. Also resumes unfinished work (/req-to-mr resume <iid>) and addresses MR review comments (/req-to-mr review <mr-iid>).
---

# Requirement → Merge Request loop

Human guide: `docs/ai-workflow/README.md`. Team rules: `docs/ai-workflow/collaboration.md`.
Project settings (commands, reviewers, size limit): the "AI workflow settings" section of `CLAUDE.md`.

## Ground rules

- **One requirement = one issue = one branch = one MR.** Never mix two requirements in one branch.
- **GitLab is the shared source of truth.** Decide "is this free / already done / overlapping?"
  only from GitLab (issues, claim notes, MRs) via `scripts/wf/*`, never from local state.
- **Humans merge.** Never push to the default/protected branch, never plain force-push, never
  merge, approve or auto-merge an MR. `.claude/hooks/guard-git.sh` enforces this; if it blocks
  you, change the approach — don't work around it.
- **Stop and ask** on: an ambiguous requirement, a possible duplicate, a lost claim (exit 3), an
  overlap report (exit 10), a rebase conflict in code another open MR owns, verification still
  failing after 3 fix attempts, new secrets/credentials, or anything destructive.
- Talk to the user in their language. Keep each status update to a line or two.

## Overrides for the installed superpowers skills

These skills are used inside this workflow; where they conflict with it, this skill wins:

| Skill | Override |
|---|---|
| brainstorming | The approved design goes into the **GitLab issue description** (template `.gitlab/issue_templates/Requirement.md`), not `docs/superpowers/specs/`. Don't commit it. |
| writing-plans | Save the plan to `.wf/plans/<iid>-<slug>.md` (git-ignored). It must end with a **Files to touch** list. |
| executing-plans / subagent-driven-development | Where they say "use finishing-a-development-branch", continue with Phase 8 of this skill instead (GitLab MR, not a GitHub PR). |
| using-git-worktrees | Consent is already given: always isolate each requirement in `.claude/worktrees/<iid>-<slug>` (Phase 5). |

## Phase 0 — Preflight (once per session)

Run `scripts/wf/preflight.sh`. On FAIL, show the fix and stop. On WARN for missing labels or
skills, show the one-line fix (`scripts/wf/setup-labels.sh` by a Maintainer; `git pull` for skills).
If `my_in_progress_issues` or `my_open_mrs` is non-empty, list them and ask: resume one of them,
or start a new requirement?

## Phase 1 — Intake

Ask for **one** requirement (skip if already given). Accept free text or an existing issue
(`#123` / URL). If the user gives several, take the first; for the rest, offer to file them now
as `wf::ready` issues (after Phase 2 dedupe each) so teammates can pick them up in parallel.

## Phase 2 — Duplicate check

Pick 2–3 keyword variants (domain words, likely UI/API names, Thai and English if relevant) and run:

```bash
glab issue list --all --search "<kw>" --in title,description -O json -P 20
glab mr list --all --search "<kw>" -F json -P 20
```

Read titles/descriptions and judge semantically. If something matches, show it (number, title,
state, assignee/author, link) and let the user choose: **(a)** already done/in progress → stop or
just comment on it; **(b)** related → continue and link it; **(c)** different → continue.
For an existing issue from Phase 1, skip creation and go straight to claiming it.

## Phase 3 — File and claim the issue (early, so others see it)

1. Create the issue with the raw requirement plus "clarification in progress" (template
   `.gitlab/issue_templates/Requirement.md`; write the body to `.wf/issue-<slug>.md` first):
   `glab issue create -t "<title>" --description-file .wf/issue-<slug>.md -l "wf::ready" -y`
   Add `--linked-issues <n>` for related items from Phase 2.
2. Claim it: `scripts/wf/claim.sh <iid>`.
   - exit 0 → continue. exit 3 → someone else owns it: tell the user who, and stop this requirement.

## Phase 4 — Clarify and size  → GATE A

Use the **brainstorming** skill. Produce: why, acceptance criteria (testable, Given/When/Then),
out of scope, chosen approach, risks. Read the relevant code first so questions are concrete.

Size check: if the work is more than one vertical slice or will likely exceed the MR size limit in
`CLAUDE.md` (default ~400 changed lines), split it. This issue becomes slice 1; create the other
slices as separate `wf::ready` issues linked with `--linked-issues <iid> --link-type blocks` (or
`is_blocked_by`) and leave them unassigned so anyone can take them.

Update the issue description with the result (`glab issue update <iid> --description-file ...`).
**GATE A:** the user approves the acceptance criteria. If scope changed a lot, re-run Phase 2.

## Phase 5 — Isolated workspace

```bash
git fetch origin
git worktree add .claude/worktrees/<iid>-<slug> -b <type>/<iid>-<slug> origin/<default_branch>
```

Then switch the session into it with the EnterWorktree tool (`path`). If that tool is missing,
`cd` there for every command. `<type>` ∈ feat, fix, refactor, chore, docs, test, perf. If this
requirement depends on an **unmerged** MR, base the branch on that MR's branch instead and record
"Depends on !<n>" (Phase 7). Run the project's install command from `CLAUDE.md` if the worktree needs it.

## Phase 6 — Plan + overlap check  → GATE B

1. Use **writing-plans** (override above). Ground the "Files to touch" list in the real code.
2. Publish the plan's files and check for collisions:
   `scripts/wf/overlap.sh --iid <iid> --declare <files...>`
   - exit 0 → no overlap.
   - exit 10 → show each hit (file → MR/issue, owner). Propose one: coordinate (comment
     @owner on their MR/issue), sequence (wait or base on their branch), or reduce scope.
     A `(same issue #iid)` hit means someone else already has an MR for this issue — stop and ask.
3. Post a short plan summary as an issue comment so teammates can see the approach.

**GATE B:** the user approves the plan and the execution method (Native vs Subagent-driven, as
writing-plans asks) and any overlap decision.

## Phase 7 — Implement (TDD) with an early Draft MR

Execute the plan with **executing-plans** or **subagent-driven-development**, using
**test-driven-development** for every task and **systematic-debugging** for any failure.

- Commits: small, Conventional Commits, issue ref in the subject: `feat(auth): add login form (#<iid>)`.
- After the **first** green commit, make the work visible:

```bash
git push -u origin <branch>
glab mr create --draft --title "<type>(<scope>): <summary>" \
  --description-file .wf/mr-<iid>.md --target-branch <default_branch> \
  --remove-source-branch --yes
```

  `.wf/mr-<iid>.md` follows `.gitlab/merge_request_templates/Default.md` and contains
  `Closes #<iid>` (and `Depends on !<n>` when stacked). Push after each finished plan task.
- If the plan turns out wrong or the scope grows, stop, update the plan and the declared files
  (`overlap.sh --iid <iid> --declare ...`), and tell the user.

## Phase 8 — Verify and self-review

1. **verification-before-completion**: run the test, lint/typecheck and build commands from
   `CLAUDE.md`, read the output, and record the evidence. Fix failures (max 3 rounds, then ask).
2. Check every acceptance criterion against evidence (a test name, command output or screenshot).
3. Self-review the branch diff against `origin/<default_branch>` with the built-in `/code-review`
   (or the **requesting-code-review** skill). Fix real findings; note anything deliberately skipped.

## Phase 9 — Sync with the default branch

```bash
git fetch origin && git rebase origin/<default_branch>
```

On conflicts, keep both sides' intent; if the conflicting code belongs to another open MR or the
right result is unclear, stop and ask. After any rebase, rerun Phase 8 step 1 and
`scripts/wf/overlap.sh --iid <iid>`. Push with `git push --force-with-lease`.

## Phase 10 — Ready for review

1. Fill `.wf/mr-<iid>.md` completely (summary, AC → evidence table, how to test, verification
   output, risks/rollback), then:
   `glab mr update <mr> --description-file .wf/mr-<iid>.md --ready --reviewer <reviewers from CLAUDE.md>`
2. `glab issue update <iid> --label "wf::in-review" --unlabel "wf::in-progress"`
3. Pipeline: run `glab ci status -b <branch> --wait` in the background. On failure, read the
   failed job log (`glab ci view` / `glab ci trace <job>`), fix via systematic-debugging, push,
   and repeat (max 3 rounds, then report to the user and set `wf::blocked` with a comment).

## Phase 11 — Report and loop

Report in 3–5 lines: issue link, MR link, pipeline state, what was verified, anything left open.
Leave the worktree in place (review fixes happen there). Return to the main checkout
(ExitWorktree, keep), then ask for the **next requirement** and go to Phase 1.

## Other entry points

- **resume `<iid>`**: `scripts/wf/claim.sh <iid> --status`, read the issue, its notes and the MR
  (`glab mr list -s <branch> -F json`), enter the existing worktree (or recreate it from the
  remote branch), read `.wf/plans/<iid>-*.md` if present, and continue at the first unfinished phase.
- **review `<mr-iid>`**: list unresolved threads
  (`glab api "projects/:id/merge_requests/<mr>/discussions?per_page=100"`, keep `resolvable &&
  !resolved`). Handle them with **receiving-code-review**, run Phase 8–9, push, then reply on
  each thread with what changed
  (`glab api -X POST "projects/:id/merge_requests/<mr>/discussions/<id>/notes" -f "body=..."`).
  Leave resolving threads to the reviewer unless `CLAUDE.md` says otherwise.
- **release `<iid>`** (giving up or handing over): push any work, comment on the state of the
  branch, then `scripts/wf/claim.sh <iid> --release`.
- **Stale claim** (owner inactive): never take it silently. Ask the user to agree with the owner,
  then `scripts/wf/claim.sh <iid> --takeover "<reason>"`.

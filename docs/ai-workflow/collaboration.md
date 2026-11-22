# Collaboration rules

Goal: many people (and many agents) use the same workflow at the same time **without duplicating
work** and **without editing the same files on top of each other**.
The principle: everything others need to know lives on **GitLab**, not on someone's machine.

## 1. Unit of work

**1 requirement = 1 issue = 1 branch = 1 MR**

- Always start from an issue. If there isn't one, the agent creates it.
- Split a large requirement into several issues that can each ship on their own (vertical slices),
  each within the size limit in `CLAUDE.md` (default ~400 changed lines).
  Split-off issues are `wf::ready` with no assignee, so **anyone on the team can pick them up in parallel**.
- When one piece of work has to wait for another, link the issues with `blocks` / `is_blocked_by`.

## 2. Status via scoped labels

| Label | Meaning | Set by |
|---|---|---|
| `wf::ready` | Clear and unowned — free to pick up | When the issue is created / on release |
| `wf::in-progress` | Someone owns it (see the claim comment) — **do not start it again** | `claim.sh` |
| `wf::in-review` | MR is ready for review | The agent in Phase 10 |
| `wf::blocked` | Waiting on another issue/MR or a decision (must have a comment explaining why) | The agent or a person |

With GitLab Premium, an issue can carry only one `wf::*` label at a time, so statuses never contradict each other.
Create the labels once per project with `scripts/wf/setup-labels.sh`.

## 3. Claiming (prevents duplicate work)

Before touching code for any issue, the agent always runs `scripts/wf/claim.sh <iid>`.

- The lock is a **comment**, not the assignee: Premium allows multiple assignees, so assignment is not a lock.
- A claim is a comment containing the marker `<!-- wf:claim -->`, and **the first claim after the latest release wins** (using GitLab's ordering).
- If two people claim at the same moment, the later one deletes its own comment and backs off (exit 3).
- An issue someone assigned by hand without a claim comment also counts as owned — talk to the owner first.
- `claim.sh <iid> --status` shows who owns it, since when, and when the issue was last updated.

**Stale claim** (the owner has gone quiet): never take it over silently. Talk to the owner or lead
first, then run `claim.sh <iid> --takeover "reason"`, which posts the reason on the issue.
Suggested rule: no activity (commits / comments) for more than 3 business days counts as stale.

**Stopping work**: push what you have, post a comment summarizing the state, then run `claim.sh <iid> --release`.

## 4. Branches and MRs

- Branch name: `<type>/<iid>-<slug>`, e.g. `feat/123-remember-email` (types: feat, fix, refactor, chore, docs, test, perf)
- Always branch from the latest `origin/<default>`, in your own worktree (`.claude/worktrees/`), so several requirements can run in parallel without mixing
- **Draft MR from the first commit**, so the team and the overlap check can see the files actually being changed
- The MR description always contains `Closes #iid` (the issue closes on merge), plus `Depends on !n` if it must wait for another MR
- Conventional Commits with an issue reference: `feat(auth): remember last email (#123)`
- Before marking Ready, rebase on the latest default branch and verify again. Only `git push --force-with-lease` is allowed, and only on your own branch

## 5. Preventing file overlap

`scripts/wf/overlap.sh` compares your files against:

1. **All open MRs** (their real diffs)
2. **Issues labelled `wf::in-progress`** that declared the files they will change (🗂️ comment) — **visible before any code exists**
3. **Other people's MRs that close the same issue** — meaning someone is already doing this work; reported as `(same issue #iid)`

The agent runs it while planning (with `--declare` to publish your files) and again after a rebase.
If it finds overlap (exit 10), the agent stops, asks, and proposes options:

| Situation | Options |
|---|---|
| Same file, different parts | Talk to the MR owner, then continue; be careful when rebasing |
| Same logic | Wait for the other MR to merge, or branch off their branch and add `Depends on !n` |
| Duplicate work | Stop and merge the work into a single issue/MR |
| Broad refactor (renames, moving files) | Announce it to the team first, split it as expand → migrate → contract, and merge quickly |

**Hotspot files** to discuss before editing: DB migrations (sequence numbers collide), lockfiles
(`package-lock.json` etc. — regenerate after a rebase instead of merging by hand), shared config,
central routes/registries, and generated files.

## 6. Review and merge

- **Humans always review and merge.** The hook `.claude/hooks/guard-git.sh` blocks:
  - pushing to main/master/develop/production/release/* and the repo's default branch
  - `--force` (use `--force-with-lease` instead), `--all`, `--mirror`, `--no-verify`
  - `glab mr merge`, `glab mr approve`, `--auto-merge`
- To protect more branches, set `WF_PROTECTED_BRANCHES="staging uat"` in the environment
- Configure the GitLab project to match (see [setup.md](setup.md#3-gitlab-project-settings-maintainer-once)): protected branch, pipelines must pass, approvals required
- Addressing comments: `/req-to-mr review <mr>` — the agent fixes, verifies, pushes and replies on every thread, **leaving resolution to the reviewer**
- If an MR has waited for review for more than 1 business day, ping the reviewer

## 7. Keeping the workflow itself consistent

- Everyone uses the workflow, skills and hook from the same repo; skills are pinned in `skills-lock.json`
- Change the workflow (docs, skills, scripts, hook) through an MR like any other code
- Never install a project-level skill quietly — follow [skills.md](skills.md#adding-a-new-skill)
- Project-specific values (test/build commands, reviewers) live in `CLAUDE.md` → "AI workflow settings"

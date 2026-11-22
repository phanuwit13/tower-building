# Skills used by the workflow

All skills are installed at **project** level and committed under `.claude/skills/`, so everyone on
the team gets the same set from git. `skills-lock.json` records each skill's source and commit, for updates.

## Installed

| Skill | Source | Phase | Purpose |
|---|---|---|---|
| **req-to-mr** | the team (this repo) | all | Orchestrator: loops requirement → issue → claim → plan → TDD → verify → MR |
| brainstorming | obra/superpowers | 4 | Asks questions until the requirement is clear; produces acceptance criteria and an approach |
| writing-plans | obra/superpowers | 6 | Breaks the work into small tasks with files, names and tests for each |
| executing-plans | obra/superpowers | 7 | Executes the plan inline in one session |
| subagent-driven-development | obra/superpowers | 7 | Alternative: a subagent per task with a separate reviewer (slower, more thorough) |
| test-driven-development | obra/superpowers | 7 | red → green → refactor for every task |
| systematic-debugging | obra/superpowers | 7–10 | Finds the root cause before fixing when tests or the pipeline fail |
| verification-before-completion | obra/superpowers | 8 | Commands must actually be run and their output seen before claiming done |
| requesting-code-review | obra/superpowers | 8 | Self-review before Ready (executing-plans also uses this skill's reviewer prompt) |
| receiving-code-review | obra/superpowers | review mode | Responds to reviewer comments with reasoning instead of applying every one blindly |
| using-git-worktrees | obra/superpowers | 5 | One worktree per requirement |
| find-skills | vercel-labs/skills | — | Searches for and installs new skills from skills.sh |
| reverse-engineer-anything | rea-agents (REA) | — | Not part of the workflow; a separately installed reverse-engineering tool |

Built-in Claude Code tool used by the workflow: `/code-review` (self-review in Phase 8).

## Considered and not installed

| Skill | Reason |
|---|---|
| obra/superpowers **finishing-a-development-branch** | Built for GitHub PRs; replaced by Phases 7–10 of `req-to-mr` (GitLab MR) |
| mattpocock/skills **git-guardrails-claude-code** | Blocks every `git push`, so the workflow could not open MRs. `.claude/hooks/guard-git.sh` blocks only the dangerous cases instead |
| mattpocock/skills **code-review**, **to-tickets** | Require `setup-matt-pocock-skills` first, and duplicate `/code-review` + Phase 4 |
| vince-winkintel/gitlab-cli-skills (glab-mr, glab-issue, etc.) | Usable, but the repo has 51 stars (below find-skills' 100 threshold). The glab commands needed are already in `req-to-mr` and `scripts/wf/` |
| wshobson/agents **gitlab-ci-patterns** | For writing `.gitlab-ci.yml`, not part of the loop. Add it if the team maintains CI |

## Adding a new skill

1. Search: use the `find-skills` skill or `npx skills find <keyword>`
2. Vet it before installing: more than 1K installs, repo with more than 100 stars, a trustworthy
   source, **read the whole SKILL.md** (skills run with the agent's full permissions), and check
   it doesn't conflict with the workflow (e.g. it pushes or opens GitHub PRs)
3. Install at project level:
   ```bash
   npx skills add <owner/repo> -s <skill-name> -a claude-code -y
   ```
   Never use `-g` for a skill the workflow depends on — nobody else would get it
4. Commit `.claude/skills/<skill-name>/` and `skills-lock.json` through an MR, and update the table in this file
5. Update: `npx skills update -p`, then review the diff in an MR

> find-skills is rated "Med Risk" by Snyk because it teaches the agent to install other skills on its own (`-g -y`).
> Team rule: the agent may **propose** skills, but installing one needs human approval and goes into the repo only through an MR.

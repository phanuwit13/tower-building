# Setup

## 1. Developer machine (everyone, once)

| Tool | Check | Notes |
|---|---|---|
| git | `git --version` | |
| Claude Code | `claude --version` | |
| glab | `glab --version` | macOS: `brew install glab` |
| jq | `jq --version` | Bundled with macOS 15+ / `brew install jq` |
| Node.js + npx | `node --version` | Used by `npx skills` |

Log in to the company GitLab:

```bash
glab auth login --hostname git.7.solutions
glab auth status --hostname git.7.solutions
```

## 2. Each repo (everyone, after cloning)

```bash
scripts/wf/preflight.sh              # must end with preflight=ok
```

All skills are committed under `.claude/skills/`, so they come with `git clone` — nothing extra to install.
(`skills-lock.json` records each skill's source and commit, for updates.)

Then open Claude Code at the repo root and type `/req-to-mr`.

> The hook in `.claude/settings.json` is a project hook. The first time you open Claude Code it may
> ask you to confirm it — review `.claude/hooks/guard-git.sh`, then allow it.

## 3. GitLab project settings (Maintainer, once)

```bash
scripts/wf/setup-labels.sh           # creates wf::ready / in-progress / in-review / blocked
```

Recommended settings under GitLab → Settings, so the rules are enforced on the server too, not only by the local hook:

| Location | Recommended value | Why |
|---|---|---|
| Repository → Protected branches | Default branch: Allowed to push = **No one**, merge = Maintainers/Developers | Everything goes through an MR |
| Merge requests → Merge checks | **Pipelines must succeed**, **All threads must be resolved** | Nothing unfinished gets merged |
| Merge requests → Approvals | At least 1 approval, authors cannot approve their own MR | Every MR gets a human look |
| Merge requests → Merge method | Fast-forward or semi-linear | Forces a rebase before merge; history stays straightforward |
| Merge requests → Squash | Encourage / Require | The conventional MR title becomes a single commit |
| Merge requests → Delete source branch | On by default | No leftover branches |
| Repository → CODEOWNERS (optional) | A `CODEOWNERS` file | The right reviewers are requested automatically |

Then fill in "AI workflow settings" in `CLAUDE.md` (install/test/lint/build commands and reviewers).

## 4. Adopting the workflow in another repo

Copy these into the root of the target repo, then commit them through an MR:

```text
CLAUDE.md                 (merge with the existing one, if any)
.claude/skills/  .claude/hooks/  .claude/settings.json
.gitlab/issue_templates/  .gitlab/merge_request_templates/
scripts/wf/
docs/ai-workflow/
skills-lock.json
.gitignore                (add the AI workflow lines)
```

Then do step 3, and have everyone do step 2.

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| `glab is not logged in` | `glab auth login --hostname <host>` |
| `cannot detect default branch` | `git remote set-head origin --auto` |
| `labels_missing=...` | A Maintainer runs `scripts/wf/setup-labels.sh` |
| `skills_missing=...` | `git pull` the latest default branch (skills live in `.claude/skills/`) |
| claim.sh exit 3 | Someone owns the issue — check `scripts/wf/claim.sh <iid> --status` and talk to the owner |
| overlap.sh exit 10 | Read the overlapping files and pick an option from [collaboration.md §5](collaboration.md#5-preventing-file-overlap) |
| The hook blocks a command | Intended. Open an MR instead of pushing directly, or use `--force-with-lease` |

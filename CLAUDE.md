# Project instructions

## AI workflow

This repo uses the team's requirement → merge request workflow. When the user gives a
requirement, feature request or bug to build, use the `req-to-mr` skill. Human guide:
`docs/ai-workflow/README.md`; team rules: `docs/ai-workflow/collaboration.md`.

- One requirement = one issue = one branch = one MR. GitLab is the source of truth for who is doing what.
- Never push to the default branch, never plain force-push, never merge/approve MRs (humans do).
- Work for each requirement happens in its own worktree under `.claude/worktrees/`.

## AI workflow settings

<!-- Fill these in per project. The req-to-mr skill reads this section. -->

| Setting | Value |
|---|---|
| GitLab project | `TODO group/project` |
| Default branch | auto-detected from `origin/HEAD` (override here if needed) |
| Install | `TODO e.g. npm ci` |
| Test | `TODO e.g. npm test` |
| Lint / typecheck | `TODO e.g. npm run lint && npm run typecheck` |
| Build | `TODO e.g. npm run build` |
| Reviewers | `TODO @username1,@username2` (or rely on CODEOWNERS) |
| MR size limit | ~400 changed lines (split bigger requirements into slices) |
| Branch types | feat, fix, refactor, chore, docs, test, perf |
| Resolve review threads | reviewer resolves (agent replies only) |

#!/usr/bin/env bash
# One-shot health check before starting the AI workflow. Prints key=value
# lines for the agent, then a WARN/FAIL list. Exit 1 only on hard failures.
#
# Usage: scripts/wf/preflight.sh

source "$(dirname "$0")/lib.sh"
wf_require_repo

fails=""; warns=""
fail() { fails="$fails- $*
"; }
warn() { warns="$warns- $*
"; }

host=$(wf_host)
echo "host=$host"
if ! glab auth status --hostname "$host" >/dev/null 2>&1; then
  fail "glab is not logged in to $host (run: glab auth login --hostname $host)"
  printf 'FAIL:\n%s' "$fails"; exit 1
fi

me=$(wf_me); echo "me=$me"
echo "repo=$(glab repo view -F json | jq -r .path_with_namespace)"

git fetch --quiet --prune origin 2>/dev/null || warn "git fetch failed — results may be stale"
base=$(wf_default_branch); echo "default_branch=$base"
cur=$(git branch --show-current); echo "current_branch=${cur:-DETACHED}"

gd=$(cd "$(git rev-parse --git-dir)" && pwd -P); gc=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
[ "$gd" = "$gc" ] && echo "in_worktree=no" || echo "in_worktree=yes"

if [ -n "$(git status --porcelain)" ]; then echo "dirty=yes"; warn "working tree has uncommitted changes"; else echo "dirty=no"; fi
if [ "$cur" = "$base" ]; then
  behind=$(git rev-list --count "HEAD..origin/$base" 2>/dev/null || echo "?")
  echo "behind_default=$behind"
fi

# Labels the workflow relies on.
have=$(wf_api_list "projects/:id/labels?per_page=100&include_ancestor_groups=true" | jq -r '.[].name')
missing=""
for l in $WF_LABELS; do printf '%s\n' "$have" | grep -qx "$l" || missing="$missing $l"; done
if [ -n "$missing" ]; then echo "labels_missing=${missing# }"; warn "missing labels:$missing (run: scripts/wf/setup-labels.sh)"; else echo "labels_missing=none"; fi

# Skills pinned in skills-lock.json plus the workflow's own skill.
root=$(git rev-parse --show-toplevel)
skills="req-to-mr"
[ -f "$root/skills-lock.json" ] && skills="$skills $(jq -r '.skills | keys[]' "$root/skills-lock.json" | tr '\n' ' ')"
smissing=""
for s in $skills; do [ -f "$root/.claude/skills/$s/SKILL.md" ] || smissing="$smissing $s"; done
if [ -n "$smissing" ]; then echo "skills_missing=${smissing# }"; warn "missing skills:$smissing (they are committed under .claude/skills/ — git pull the latest default branch)"; else echo "skills_missing=none"; fi

# Your unfinished work, so the agent can offer to resume it.
echo "my_in_progress_issues=$(wf_api_list "projects/:id/issues?state=opened&assignee_username=$me&labels=$(wf_enc 'wf::in-progress')&per_page=100" \
  | jq -r '[.[] | "#\(.iid) \(.title)"] | join(" | ")')"
echo "my_open_mrs=$(wf_api_list "projects/:id/merge_requests?state=opened&author_username=$me&per_page=100" \
  | jq -r '[.[] | "!\(.iid)\(if .draft then " (draft)" else "" end) \(.title) [\(.source_branch)]"] | join(" | ")')"
echo "team_in_progress=$(wf_api_list "projects/:id/issues?state=opened&labels=$(wf_enc 'wf::in-progress')&per_page=100" \
  | jq -r '[.[] | "#\(.iid) @\([.assignees[].username] | join(",")) \(.title)"] | join(" | ")')"

[ -n "$warns" ] && printf 'WARN:\n%s' "$warns"
if [ -n "$fails" ]; then printf 'FAIL:\n%s' "$fails"; exit 1; fi
echo "preflight=ok"

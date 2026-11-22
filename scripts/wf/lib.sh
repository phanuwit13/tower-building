#!/usr/bin/env bash
# Shared helpers for scripts/wf/*. Source this file; don't execute it.
# Compatible with macOS /bin/bash 3.2 (no mapfile, no associative arrays).

set -euo pipefail

WF_LABELS="wf::ready wf::in-progress wf::in-review wf::blocked"
WF_CLAIM_MARK='<!-- wf:claim -->'
WF_RELEASE_MARK='<!-- wf:release -->'
WF_FILES_MARK='<!-- wf:files -->'

die() { echo "wf: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

wf_require_repo() {
  need git; need glab; need jq
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "not inside a git repository"
  git remote get-url origin >/dev/null 2>&1 || die "no 'origin' remote"
}

# GitLab host of the origin remote (ssh or https form).
wf_host() {
  git remote get-url origin | sed -E 's#^[a-z+]+://##; s#^[^@/]+@##; s#[:/].*$##'
}

wf_default_branch() {
  local b
  b=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)
  if [ -z "$b" ]; then
    git remote set-head origin --auto >/dev/null 2>&1 || true
    b=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)
  fi
  [ -n "$b" ] || die "cannot detect default branch (run: git remote set-head origin --auto)"
  echo "${b#origin/}"
}

wf_me() { glab api user | jq -r .username; }

# All pages of a GET list endpoint, merged into one JSON array.
wf_api_list() { glab api --paginate "$1" | jq -s 'add // []'; }

# Notes of an issue, oldest first, excluding system notes.
wf_issue_notes() {
  wf_api_list "projects/:id/issues/$1/notes?sort=asc&order_by=created_at&per_page=100" \
    | jq '[.[] | select(.system | not)]'
}

# Reads notes JSON (oldest first) on stdin and prints the active claim as
# {"user":..,"note_id":..,"at":..} or null. Rule: the FIRST claim note posted
# after the most recent release note wins. The note author is the claimant,
# so the marker cannot be spoofed by putting someone else's name in the text.
wf_claim_holder() {
  jq --arg c "$WF_CLAIM_MARK" --arg r "$WF_RELEASE_MARK" '
    reduce .[] as $n (null;
      if ($n.body | contains($r)) then null
      elif ($n.body | contains($c)) and (. == null)
        then {user: $n.author.username, note_id: $n.id, at: $n.created_at}
      else . end)'
}

# URL-encode a label for use in a query string (only ':' needs it here).
wf_enc() { printf '%s' "$1" | sed 's/:/%3A/g'; }

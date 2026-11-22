#!/usr/bin/env bash
# Detect file-level overlap between your work and teammates' work in progress:
#   * open merge requests (their actual diffs), and
#   * issues labelled wf::in-progress (their declared "planned files" notes).
#
# Usage:
#   scripts/wf/overlap.sh [--iid N] [--declare] [FILE ...]
#
#   FILE ...   files you plan to touch. Default: files changed on this branch
#              versus origin/<default>, plus uncommitted changes.
#   --iid N    your issue; it and its MR are excluded from the scan.
#   --declare  also post/refresh the "planned files" note on issue N, so other
#              developers' overlap checks can see your plan before any code exists.
#
# Exit codes: 0 no overlap, 10 overlap found (review the report), 1 error.

source "$(dirname "$0")/lib.sh"
wf_require_repo

IID=""; DECLARE=0; FILES=""
while [ $# -gt 0 ]; do
  case "$1" in
    --iid) IID="${2:-}"; shift 2 ;;
    --declare) DECLARE=1; shift ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) FILES="$FILES$1
"; shift ;;
  esac
done

base=$(wf_default_branch)
branch=$(git branch --show-current)
me=$(wf_me)
if [ -z "$FILES" ]; then
  git fetch --quiet origin "$base" 2>/dev/null || echo "wf: warn: git fetch failed; comparing with cached origin/$base" >&2
  FILES=$( { git diff --name-only "origin/$base...HEAD"; git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null)
fi
mine=$(printf '%s\n' "$FILES" | sed '/^$/d' | sort -u)
[ -n "$mine" ] || { echo "no files to check"; exit 0; }
mine_json=$(printf '%s\n' "$mine" | jq -R . | jq -s .)

if [ "$DECLARE" = 1 ]; then
  [ -n "$IID" ] || die "--declare needs --iid"
  body="🗂️ Planned files (AI workflow, $(date -u +%Y-%m-%dT%H:%MZ)) — used by teammates' overlap checks.
$WF_FILES_MARK
$(printf '%s\n' "$mine" | sed 's/.*/- `&`/')"
  existing=$(wf_issue_notes "$IID" | jq -r --arg m "$WF_FILES_MARK" --arg me "$me" \
    '[.[] | select(.author.username == $me and (.body | contains($m)))] | last | .id // empty')
  if [ -n "$existing" ]; then
    glab api -X PUT "projects/:id/issues/$IID/notes/$existing" -f "body=$body" >/dev/null
  else
    glab api -X POST "projects/:id/issues/$IID/notes" -f "body=$body" >/dev/null
  fi
  echo "declared $(printf '%s\n' "$mine" | wc -l | tr -d ' ') planned files on #$IID"
fi

report=""
add_hits() { # $1 = their files JSON array, $2 = description
  local hits
  hits=$(jq -rn --argjson a "$mine_json" --argjson b "$1" '$a - ($a - $b) | .[]')
  [ -z "$hits" ] && return 0
  while IFS= read -r f; do report="$report$f	$2
"; done <<<"$hits"
}

# 1) Open merge requests (skip the MR for this branch / this issue).
mrs=$(wf_api_list "projects/:id/merge_requests?state=opened&per_page=100")
for miid in $(jq -r --arg br "$branch" '.[] | select(.source_branch != $br) | .iid' <<<"$mrs"); do
  mr=$(jq --argjson n "$miid" '.[] | select(.iid == $n)' <<<"$mrs")
  desc=$(jq -r '"MR !\(.iid) @\(.author.username) [\(if .draft then "draft" else "open" end)] \(.title) \(.web_url)"' <<<"$mr")
  # An MR for the same issue: skip it if it's mine, flag it if it's someone else's.
  if [ -n "$IID" ] && jq -e --arg i "$IID" '(.source_branch | test("(^|/)" + $i + "-"))
      or ((.description // "") | test("(Closes|Fixes|Resolves|Implements) #" + $i + "\\b"; "i"))' <<<"$mr" >/dev/null; then
    [ "$(jq -r .author.username <<<"$mr")" = "$me" ] && continue
    report="$report(same issue #$IID)	$desc
"
    continue
  fi
  files=$(wf_api_list "projects/:id/merge_requests/$miid/diffs?per_page=100" \
    | jq '[.[] | .new_path, .old_path] | unique')
  add_hits "$files" "$desc"
done

# 2) In-progress issues with a declared plan (their code may not exist yet).
issues=$(wf_api_list "projects/:id/issues?state=opened&labels=$(wf_enc 'wf::in-progress')&per_page=100")
for iiid in $(jq -r --arg i "$IID" '.[] | select((.iid | tostring) != $i) | .iid' <<<"$issues"); do
  is=$(jq --argjson n "$iiid" '.[] | select(.iid == $n)' <<<"$issues")
  files=$(wf_issue_notes "$iiid" | jq --arg m "$WF_FILES_MARK" '
    [.[] | select(.body | contains($m))] | last | (.body // "")
    | [splits("\n") | capture("^- `(?<f>.+)`$")? | .f]')
  add_hits "$files" "$(jq -r '"ISSUE #\(.iid) @\([.assignees[].username] | join(",")) [planned] \(.title) \(.web_url)"' <<<"$is")"
done

if [ -z "$report" ]; then
  echo "OK no overlap: $(printf '%s\n' "$mine" | wc -l | tr -d ' ') files checked against $(jq length <<<"$mrs") open MRs and $(jq length <<<"$issues") in-progress issues"
  exit 0
fi
echo "OVERLAP found (file<TAB>who/what):"
printf '%s' "$report" | sort
exit 10

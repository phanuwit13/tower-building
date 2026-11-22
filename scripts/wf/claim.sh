#!/usr/bin/env bash
# Claim, release or inspect ownership of a GitLab issue so two developers
# (or two agents) never work on the same requirement at the same time.
#
# Usage:
#   scripts/wf/claim.sh <iid>                      claim (idempotent if you already own it)
#   scripts/wf/claim.sh <iid> --status             show who owns it
#   scripts/wf/claim.sh <iid> --release            give it back (you must own it)
#   scripts/wf/claim.sh <iid> --takeover "reason"  take over a stale claim (posts the reason)
#
# Exit codes: 0 ok, 3 owned by someone else, 1 error.
#
# Protocol: ownership is decided by issue comments, not by the assignee field
# (Premium allows several assignees, so assigning is not a lock). A claim is a
# note containing "<!-- wf:claim -->"; the first claim after the latest
# "<!-- wf:release -->" note wins. On a race, the loser deletes its own note.

source "$(dirname "$0")/lib.sh"
wf_require_repo

IID="${1:-}"; MODE="${2:-claim}"; REASON="${3:-}"
case "$IID" in ''|*[!0-9]*) die "usage: claim.sh <issue-iid> [--status|--release|--takeover \"reason\"]";; esac

me=$(wf_me)
issue=$(glab api "projects/:id/issues/$IID")
state=$(jq -r .state <<<"$issue")
title=$(jq -r .title <<<"$issue")
url=$(jq -r .web_url <<<"$issue")
others=$(jq -r --arg me "$me" '[.assignees[].username | select(. != $me)] | join(",")' <<<"$issue")

holder_json() { wf_issue_notes "$IID" | wf_claim_holder; }

post_note() { # body -> prints note id
  glab api -X POST "projects/:id/issues/$IID/notes" -f "body=$1" | jq -r .id
}

set_owned_labels() {
  glab issue update "$IID" --assignee "+$me" \
    --label "wf::in-progress" --unlabel "wf::ready,wf::blocked,wf::in-review" >/dev/null
}

case "$MODE" in
  --status)
    h=$(holder_json)
    echo "issue=#$IID state=$state title=$title"
    echo "url=$url"
    echo "holder=$(jq -r '.user // "none"' <<<"$h") since=$(jq -r '.at // "-"' <<<"$h")"
    echo "assignees=$(jq -r '[.assignees[].username] | join(",")' <<<"$issue")"
    echo "labels=$(jq -r '.labels | join(",")' <<<"$issue")"
    echo "updated_at=$(jq -r .updated_at <<<"$issue")"
    exit 0
    ;;
  --release)
    h=$(holder_json); hu=$(jq -r '.user // empty' <<<"$h")
    [ "$hu" = "$me" ] || die "you don't hold #$IID (holder: ${hu:-none})"
    post_note "🔓 Released by @$me — anyone can pick this up.
$WF_RELEASE_MARK" >/dev/null
    glab issue update "$IID" --assignee "-$me" \
      --label "wf::ready" --unlabel "wf::in-progress,wf::in-review,wf::blocked" >/dev/null
    echo "released #$IID"
    exit 0
    ;;
  --takeover)
    [ -n "$REASON" ] || die "--takeover needs a reason, e.g. --takeover \"no activity for 5 days, agreed with @alice\""
    h=$(holder_json); hu=$(jq -r '.user // empty' <<<"$h")
    if [ -n "$hu" ] && [ "$hu" != "$me" ]; then
      post_note "🔓 Claim of @$hu taken over by @$me. Reason: $REASON
$WF_RELEASE_MARK" >/dev/null
      glab issue update "$IID" --assignee "-$hu" >/dev/null || true
    fi
    others=""
    ;;
  claim) ;;
  *) die "unknown mode: $MODE" ;;
esac

# ---- claim ----
[ "$state" = "opened" ] || die "issue #$IID is $state"

h=$(holder_json); hu=$(jq -r '.user // empty' <<<"$h")
if [ "$hu" = "$me" ]; then
  set_owned_labels
  echo "claimed #$IID (already yours since $(jq -r .at <<<"$h")) $url"
  exit 0
fi
if [ -n "$hu" ]; then
  echo "OWNED #$IID by @$hu since $(jq -r .at <<<"$h") — $url" >&2
  exit 3
fi
if [ -n "$others" ]; then
  echo "OWNED #$IID is assigned to @$others (no workflow claim) — ask them first — $url" >&2
  exit 3
fi

note_id=$(post_note "🔒 Claimed by @$me via AI workflow. Others: please pick a different issue or coordinate here.
$WF_CLAIM_MARK")

# Let concurrent claims land, then re-check who was first.
sleep "${WF_CLAIM_SETTLE_SECONDS:-3}"
h=$(holder_json); hu=$(jq -r '.user // empty' <<<"$h")
if [ "$hu" != "$me" ]; then
  glab api -X DELETE "projects/:id/issues/$IID/notes/$note_id" >/dev/null 2>&1 || true
  echo "OWNED #$IID — @${hu:-?} claimed it first — $url" >&2
  exit 3
fi

set_owned_labels
echo "claimed #$IID \"$title\" $url"

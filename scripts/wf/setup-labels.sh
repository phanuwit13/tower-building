#!/usr/bin/env bash
# Create the workflow's scoped labels in the current GitLab project (idempotent).
# Run once per project by a Maintainer. Scoped labels (wf::*) are mutually
# exclusive on GitLab Premium, so an issue always has exactly one workflow state.
#
# Usage: scripts/wf/setup-labels.sh

source "$(dirname "$0")/lib.sh"
wf_require_repo

have=$(wf_api_list "projects/:id/labels?per_page=100&include_ancestor_groups=true" | jq -r '.[].name')

create() { # name color description
  if printf '%s\n' "$have" | grep -qx "$1"; then echo "exists  $1"; return; fi
  glab label create --name "$1" --color "$2" --description "$3" >/dev/null
  echo "created $1"
}

create "wf::ready"       "#428BCA" "AI workflow: clarified and unclaimed — anyone may pick it up"
create "wf::in-progress" "#F0AD4E" "AI workflow: claimed by the assignee (see the claim comment) — don't start it"
create "wf::in-review"   "#5CB85C" "AI workflow: MR is ready for review"
create "wf::blocked"     "#D9534F" "AI workflow: waiting on another issue/MR or a decision"

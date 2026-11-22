#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) hook for the AI workflow.
# Blocks actions that change SHARED state in ways a teammate can't easily undo.
# Exit 2 = block (stderr is shown to Claude); exit 0 = allow.
#
# Blocked:
#   git push to a protected branch (main/master/develop/production/release/*,
#     plus the repo's detected default branch), including a bare `git push`
#     while on one
#   git push --force / -f / +refspec        (use --force-with-lease on your own branch)
#   git push --all / --mirror / --no-verify, and deleting protected branches
#   git commit --no-verify
#   glab mr merge / glab mr approve / --auto-merge  (merging and approving are human decisions)
#
# Add branch names with WF_PROTECTED_BRANCHES="staging uat" in the environment.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)
[ -z "$cmd" ] && exit 0
[ -n "$cwd" ] && [ -d "$cwd" ] || cwd=$PWD

block() { echo "BLOCKED by AI workflow guard (.claude/hooks/guard-git.sh): $1" >&2; exit 2; }

protected="main master develop production ${WF_PROTECTED_BRANCHES:-}"
def=$(git -C "$cwd" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)
[ -n "$def" ] && protected="$protected ${def#origin/}"

is_protected() { # branch name
  local b="${1#refs/heads/}" p
  case "$b" in release/*) return 0 ;; esac
  for p in $protected; do [ "$b" = "$p" ] && return 0; done
  return 1
}

# Split the command line into simple commands on ; && || | and newlines.
segments=$(printf '%s\n' "$cmd" | sed -E 's/(\&\&|\|\||;|\|)/\
/g')

while IFS= read -r seg; do
  # shellcheck disable=SC2086
  set -f; set -- $seg; set +f
  # find the git / glab token (may be prefixed by env vars, rtk, sudo, ...)
  tool=""
  while [ $# -gt 0 ]; do
    case "$1" in git|*/git) tool=git; shift; break ;; glab|*/glab) tool=glab; shift; break ;; esac
    shift
  done
  [ -z "$tool" ] && continue

  if [ "$tool" = glab ]; then
    case "$*" in
      "mr merge"*|"mr approve"*) block "merging/approving MRs is a human decision — ask a reviewer" ;;
    esac
    case " $* " in *" --auto-merge "*|*" --auto-merge="*) block "--auto-merge is not allowed — a human merges" ;; esac
    continue
  fi

  # git: skip global options to reach the subcommand
  while [ $# -gt 0 ]; do
    case "$1" in -C|-c|--git-dir|--work-tree) shift 2 ;; -*) shift ;; *) break ;; esac
  done
  sub="${1:-}"; [ $# -gt 0 ] && shift

  case "$sub" in
    commit)
      for a in "$@"; do [ "$a" = "--no-verify" ] && block "git commit --no-verify skips the team's hooks"; done
      ;;
    push)
      refs=""; delete=0; npos=0
      for a in "$@"; do
        case "$a" in
          --force|-f) block "plain force-push is not allowed — use: git push --force-with-lease (own branch only)" ;;
          --force-with-lease*|--force-if-includes) ;;
          --all|--mirror) block "git push $a pushes many branches at once" ;;
          --no-verify) block "git push --no-verify skips the team's hooks" ;;
          --delete|-d) delete=1 ;;
          --*) ;;
          -*f*) block "force-push flag in '$a' is not allowed — use --force-with-lease" ;;
          -*d*) delete=1 ;;
          -*) ;;
          *) npos=$((npos + 1)); [ "$npos" -ge 2 ] && refs="$refs $a" ;;
        esac
      done
      if [ -z "$refs" ]; then
        cur=$(git -C "$cwd" branch --show-current 2>/dev/null || true)
        is_protected "$cur" && block "you are on '$cur' — push a feature branch instead"
      fi
      for r in $refs; do
        case "$r" in +*) block "'+$r' is a force-push refspec — use --force-with-lease" ;; esac
        dst="${r##*:}"; [ -z "$dst" ] && dst="${r%%:*}"
        case "$r" in :*) delete=1; dst="${r#:}" ;; esac
        [ "$dst" = HEAD ] && dst=$(git -C "$cwd" branch --show-current 2>/dev/null || true)
        if is_protected "$dst"; then
          [ "$delete" = 1 ] && block "deleting protected branch '$dst'"
          block "direct push to protected branch '$dst' — open a merge request instead"
        fi
      done
      ;;
  esac
done <<EOF
$segments
EOF

exit 0

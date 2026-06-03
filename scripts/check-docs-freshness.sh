#!/usr/bin/env bash
# Check if the last commit changed code files without docs/ changes.
# Warns (does not enforce) - manual review trigger.

set -euo pipefail

changed=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || true)
has_code=$(echo "$changed" | grep -E '\.(ts|tsx)$' | grep -v 'docs/' || true)
has_docs=$(echo "$changed" | grep -E '^docs/(core|rules|patterns)/' || true)

if [ -n "$has_code" ] && [ -z "$has_docs" ]; then
  echo "WARNING: Code files modified without docs/ changes."
  echo "  Modified code files:"
  echo "$has_code"
  echo "  Consider: did any pattern or convention change? Update docs/ if so."
fi

#!/usr/bin/env bash
set -euo pipefail

EXIT_CODE=0

# Check 1: Product modules must not import from @/modules/demo/
if grep -rn "from ['\"]@/modules/demo/" src/modules/ \
   --include='*.ts' --include='*.tsx' \
   | grep -v "src/modules/demo/"; then
  echo "ERROR: Product code imports from demo modules (@/modules/demo/)."
  EXIT_CODE=1
fi

# Check 2: Product modules must not import from @/constants/mock-api
if grep -rn "from ['\"]@/constants/mock-api" src/modules/ \
   --include='*.ts' --include='*.tsx' \
   | grep -v "src/modules/demo/"; then
  echo "ERROR: Product code imports mock-api directly (@/constants/mock-api)."
  EXIT_CODE=1
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "OK: No boundary violations detected."
fi

exit $EXIT_CODE

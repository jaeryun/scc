#!/bin/bash
set -euo pipefail

NETBOX_URL="${NETBOX_BASE_URL:?NETBOX_BASE_URL required}"
NETBOX_TOKEN="${NETBOX_API_TOKEN:?NETBOX_API_TOKEN required}"
OUTPUT="src/lib/netbox/netbox-openapi-v4.x.json"

curl -fsS -H "Authorization: Token ${NETBOX_TOKEN}" \
  "${NETBOX_URL}/api/schema/" -o "${OUTPUT}"

echo "Schema saved to ${OUTPUT} ($(wc -c < ${OUTPUT}) bytes)"

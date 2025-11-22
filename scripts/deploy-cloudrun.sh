#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export PROJECT_ID=maint-ca347
#   export REGION=us-central1
#   export SERVICE=iqsion-api
#   bash scripts/deploy-cloudrun.sh
#
# Requires: gcloud, awk

root_dir=$(cd "$(dirname "$0")/.." && pwd)
cd "$root_dir"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud not found. Install Google Cloud SDK first." >&2
  exit 1
fi

: "${PROJECT_ID:?PROJECT_ID is required}" 
: "${REGION:?REGION is required}"
: "${SERVICE:?SERVICE is required}"

ENV_SRC="Maint/server/env"
if [ ! -f "$ENV_SRC" ]; then
  echo "Environment file not found: $ENV_SRC" >&2
  exit 1
fi

# Convert .env (KEY=VALUE) -> YAML (KEY: "VALUE")
# - ignores comments and empty lines
# - strips surrounding quotes on VALUE
# - escapes internal quotes
ENV_YAML="/tmp/${SERVICE}-env.yaml"
awk -F= '
  BEGIN { OFS="" }
  /^[[:space:]]*#/ { next }
  /^[[:space:]]*$/ { next }
  /^[A-Za-z_][A-Za-z0-9_]*=/ {
    key=$1;
    # Skip Cloud Run reserved env vars
    if (key == "PORT" || key == "K_SERVICE" || key == "K_REVISION" || key == "K_CONFIGURATION") { next }
    val=$0; sub(/^[^=]*=/, "", val);
    # Trim surrounding whitespace
    gsub(/^\r?\n$/, "", val);
    sub(/^\s+/, "", val); sub(/\s+$/, "", val);
    gsub(/^"|"$/, "", val);
    gsub(/\\"/, "\"", val);
    gsub(/"/, "\\\"", val);
    print key, ": \"", val, "\"";
  }
' "$ENV_SRC" > "$ENV_YAML"

echo "Using env vars file: $ENV_YAML"

# Set project
gcloud config set project "$PROJECT_ID" >/dev/null

# Deploy from source (Maint folder)
gcloud run deploy "$SERVICE" \
  --source ./Maint \
  --region "$REGION" \
  --allow-unauthenticated \
  --env-vars-file "$ENV_YAML"

SERVICE_URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
echo "Service deployed: $SERVICE_URL"

# Smoke checks
set +e
curl -sS "$SERVICE_URL/api/health" | sed -e 's/.*/[health] &/'
curl -sS "$SERVICE_URL/api/auth/debug" | sed -e 's/.*/[debug]  &/' | head -c 800; echo

#!/usr/bin/env bash
#
# Deploy the site-wide styled 404 to Cloudflare Custom Errors.
#
# Serves static/error-404.html (published at https://waccamaw.org/error-404.html)
# for any origin 404 across the whole waccamaw.org domain — main site AND the
# worker-owned paths (/api/*, /members/*, /files/*). Edge-native: nothing is
# proxied, and the asset is served WITH its own <!DOCTYPE> (standards mode),
# unlike Micro.blog's doctype-stripped /404.html.
#
# Usage (also runs in the devcontainer — token comes from members-service/.dev.vars):
#   bash scripts/deploy-cloudflare-404.sh
#   just deploy-cf-404
#
# Requires a Cloudflare API token with these ZONE permissions on waccamaw.org:
#   - Custom Pages : Edit   (upload/refresh the error asset)
#   - Config Rules : Edit   (apply the http_custom_errors rule)
# The script probes both up front and tells you exactly which is missing.

set -euo pipefail

ZONE="feb3534399611b07b6b38d704a668140"          # waccamaw.org
ASSET_NAME="waccamaw-404"
ASSET_URL="https://waccamaw.org/error-404.html"
API="https://api.cloudflare.com/client/v4"

# --- token: prefer env, else read the members-service dev var --------------
here="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN="${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_D1_API_TOKEN:-}}"
if [ -z "$TOKEN" ] && [ -f "$here/apps/members-service/.dev.vars" ]; then
	TOKEN="$(grep -E '^CLOUDFLARE_D1_API_TOKEN=' "$here/apps/members-service/.dev.vars" | cut -d= -f2- | tr -d '"'"'"' ')"
fi
[ -n "$TOKEN" ] || { echo "❌ No CLOUDFLARE_API_TOKEN / CLOUDFLARE_D1_API_TOKEN found."; exit 1; }

cf() { # cf METHOD PATH [JSON] -> body on stdout
	local method="$1" path="$2" data="${3:-}"
	if [ -n "$data" ]; then
		curl -sS -X "$method" "$API$path" -H "Authorization: Bearer $TOKEN" \
			-H "Content-Type: application/json" --data "$data"
	else
		curl -sS -X "$method" "$API$path" -H "Authorization: Bearer $TOKEN"
	fi
}
ok() { python3 -c "import json,sys;print('1' if json.load(sys.stdin).get('success') else '0')"; }

echo "▶ Probing token scope on waccamaw.org…"
cp_ok=$(cf GET "/zones/$ZONE/custom_pages" | ok)
rs_ok=$(cf GET "/zones/$ZONE/rulesets/phases/http_custom_errors/entrypoint" | ok)
if [ "$cp_ok" != "1" ] || [ "$rs_ok" != "1" ]; then
	echo "❌ Token is missing required scope:"
	[ "$cp_ok" = "1" ] || echo "   - Custom Pages : Edit   (needed to upload the error asset)"
	[ "$rs_ok" = "1" ] || echo "   - Config Rules : Edit   (needed to apply the http_custom_errors rule)"
	echo "   Add these to the token at https://dash.cloudflare.com/profile/api-tokens, then re-run."
	exit 2
fi
echo "  ✓ scope OK"

echo "▶ Refreshing custom error asset '$ASSET_NAME' from $ASSET_URL…"
# delete-if-exists so the asset is re-fetched fresh, then create
cf DELETE "/zones/$ZONE/custom_pages/assets/$ASSET_NAME" >/dev/null 2>&1 || true
create=$(cf POST "/zones/$ZONE/custom_pages/assets" \
	"{\"name\":\"$ASSET_NAME\",\"description\":\"Waccamaw.org styled 404\",\"url\":\"$ASSET_URL\"}")
if [ "$(printf '%s' "$create" | ok)" != "1" ]; then
	echo "❌ Asset upload failed:"; printf '%s\n' "$create" | python3 -m json.tool; exit 1
fi
echo "  ✓ asset stored"

echo "▶ Applying custom error rule (serve $ASSET_NAME on any origin 404)…"
rule=$(cf PUT "/zones/$ZONE/rulesets/phases/http_custom_errors/entrypoint" '{
  "rules": [
    {
      "action": "serve_error",
      "action_parameters": { "asset_name": "'"$ASSET_NAME"'", "content_type": "text/html", "status_code": 404 },
      "expression": "(http.response.code eq 404)",
      "description": "Serve the styled 404 for origin 404s across waccamaw.org",
      "enabled": true
    }
  ]
}')
if [ "$(printf '%s' "$rule" | ok)" != "1" ]; then
	echo "❌ Rule apply failed:"; printf '%s\n' "$rule" | python3 -m json.tool; exit 1
fi
echo "  ✓ rule applied"
echo "✅ Done. Test:  curl -sSI https://waccamaw.org/this-does-not-exist/ | head -1"
echo "   (allow a minute to propagate; then a bad URL should return the styled 404)"

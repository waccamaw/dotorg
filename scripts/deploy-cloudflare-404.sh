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
# The 404 body is embedded INLINE in the custom-error rule (this account allows
# 0 stored custom-error assets), so the only token permission required is:
#   - Zone > Custom Error Rules : Edit
# Source of truth for the body is the tracked file static/error-404.html.

set -euo pipefail

ZONE="feb3534399611b07b6b38d704a668140"          # waccamaw.org
ASSET_FILE="static/error-404.html"               # tracked source of the 404 body
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

# This account allows 0 stored custom-error assets, so serve the 404 body INLINE
# in the rule instead (serve_error supports inline `content`). Source of truth is
# still the tracked file static/error-404.html — we read it and embed it.
echo "▶ Building custom error rule from $ASSET_FILE (inline content)…"
payload=$(python3 - "$here/$ASSET_FILE" <<'PY'
import json, sys
html = open(sys.argv[1], encoding="utf-8").read()
print(json.dumps({"rules": [{
    "action": "serve_error",
    "action_parameters": {"content": html, "content_type": "text/html", "status_code": 404},
    "expression": "(http.response.code eq 404)",
    "description": "Serve the styled 404 for origin 404s across waccamaw.org",
    "enabled": True,
}]}))
PY
)

echo "▶ Applying custom error rule (serve styled 404 on any origin 404)…"
rule=$(cf PUT "/zones/$ZONE/rulesets/phases/http_custom_errors/entrypoint" "$payload")
if [ "$(printf '%s' "$rule" | ok)" != "1" ]; then
	if printf '%s' "$rule" | grep -q '"code": *10000'; then
		echo "❌ Rule apply denied — token is missing 'Custom Error Rules : Edit'."
		echo "   Add it to the token at https://dash.cloudflare.com/profile/api-tokens, then re-run."
		echo "   (The asset uploaded fine; re-running is safe/idempotent.)"
		exit 2
	fi
	echo "❌ Rule apply failed:"; printf '%s\n' "$rule" | python3 -m json.tool; exit 1
fi
echo "  ✓ rule applied"
echo "✅ Done. Test:  curl -sSI https://waccamaw.org/this-does-not-exist/ | head -1"
echo "   (allow a minute to propagate; then a bad URL should return the styled 404)"

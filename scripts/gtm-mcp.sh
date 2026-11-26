#!/bin/sh
set -eu

credentials="$HOME/.config/googlegtm-ai-ops/application_default_credentials.json"
if ! GOOGLE_CLIENT_ID=$(/usr/bin/plutil -extract client_id raw -expect string -o - "$credentials" 2>/dev/null) ||
   ! GOOGLE_CLIENT_SECRET=$(/usr/bin/plutil -extract client_secret raw -expect string -o - "$credentials" 2>/dev/null) ||
   ! GOOGLE_REFRESH_TOKEN=$(/usr/bin/plutil -extract refresh_token raw -expect string -o - "$credentials" 2>/dev/null) ||
   [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$GOOGLE_REFRESH_TOKEN" ]; then
    printf '%s\n' 'GTM OAuth credentials are missing or invalid. Follow the sign-in instructions in README.md.' >&2
    exit 1
fi

unset GOOGLE_SERVICE_ACCOUNT_KEY GOOGLE_CLIENT_EMAIL GOOGLE_PRIVATE_KEY GOOGLE_ACCESS_TOKEN
export GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN
exec npx --yes google-tag-manager-mcp-server@6.0.1

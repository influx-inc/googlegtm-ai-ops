# Google Tag Manager Operations

Use this repository with Codex or Claude Code to audit, update, and test tags, triggers, and variables in Google Tag Manager (GTM).

Open either agent from the repository root and describe the task. Include the GTM container and workspace if you know them. Edit [AGENTS.md](AGENTS.md) to update the instructions for both agents. Claude Code loads it through [CLAUDE.md](CLAUDE.md).

## Google Tag Manager sign-in

Both terminal clients run the [Stape GTM MCP server](https://github.com/stape-io/google-tag-manager-mcp-server) locally as `gtm`. On this Mac, the launcher uses Node.js and a Google OAuth login shared by both clients.

Enable the Tag Manager API in your Google Cloud project and download a [desktop OAuth client JSON file](https://developers.google.com/identity/protocols/oauth2/native-app). Then run the following with its local path and sign in with the Google account that has GTM access.

```sh
mkdir -p -m 700 "$HOME/.config/googlegtm-ai-ops"
CLOUDSDK_CONFIG="$HOME/.config/googlegtm-ai-ops" gcloud auth application-default login \
  --client-id-file="/path/to/client_secret.json" \
  --disable-quota-project \
  --scopes="https://www.googleapis.com/auth/tagmanager.edit.containers,https://www.googleapis.com/auth/tagmanager.edit.containerversions"
```

Launch `codex` or `claude` from the repository root. Trust the project in Codex or approve `gtm` on first launch in Claude Code if prompted. Ask the agent to list GTM accounts to verify access.

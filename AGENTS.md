# Google Tag Manager instructions

- Use the project's local `gtm` MCP server to read and update Google Tag Manager.
- Unless explicitly directed to use a different container, work on the `influx.com` GTM container (`GTM-WJG2TZX`), which runs on `https://influx.com/`.
- Prefer `http://localhost:4567/` over the production `influx.com` site for testing and investigation, including GTM Preview and Tag Assistant.
- Before editing GTM, verify the account, container, and workspace against the request. Ask if you find multiple plausible targets.
- Inspect the existing configuration and pending workspace changes first. Follow the container's naming conventions and preserve unrelated edits.
- Make requested changes in the workspace. Get explicit authorization before publishing, rolling back a live version, deleting existing configuration, or changing account access.
- Use GTM Preview and Tag Assistant to verify changed tags when available. Check when each tag should fire and when it should stay quiet. Report any checks you could not run.
- Keep credentials, access tokens, and personal data out of the repository and task output.

## Git

- Always commit repository changes in logical batches. Stage only the changes that belong to each batch and use a commit message that describes its purpose.

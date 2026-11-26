# Google Tag Manager instructions

- Before editing GTM, verify the account, container, and workspace against the request. Ask if you find multiple plausible targets.
- Inspect the existing configuration and pending workspace changes first. Follow the container's naming conventions and preserve unrelated edits.
- Make requested changes in the workspace. Get explicit authorization before publishing, rolling back a live version, deleting existing configuration, or changing account access.
- Use GTM Preview and Tag Assistant to verify changed tags when available. Check when each tag should fire and when it should stay quiet. Report any checks you could not run.
- Keep credentials, access tokens, and personal data out of the repository and task output.

## Git

- Always commit repository changes in logical batches. Stage only the changes that belong to each batch and use a commit message that describes its purpose.

# GTM workspace operations

## Find the right configuration

1. Use the local `gtm` MCP server. List accessible accounts and their containers, then match the requested public `GTM-…` ID and site. Use the returned account and container IDs for subsequent MCP operations. If the container lookup returns a 404, listing containers by account can still find the match.
2. List workspaces, select the intended one, and call workspace `getStatus`. Review pending changes and conflicts. Ask when multiple workspaces are plausible. Check whether pending work overlaps the requested change before editing or creating a version.
3. Read affected tags, their firing and blocking triggers, variables, consent settings, and setup or cleanup tags. Compare with the live version when diagnosing published behavior. Inspect all relevant pages of paginated results.

Google documents [workspaces and conflicts](https://support.google.com/tagmanager/answer/7059647), the [REST API resources](https://developers.google.com/tag-platform/tag-manager/api/reference/rest), and [workspace status](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces/getStatus).

## Edit and verify

- Follow the naming and configuration patterns in the selected workspace. For updates that replace the resource, read the full object first, preserve the other fields, and use the current fingerprint when supported. If a fingerprint is stale, re-read and check the intervening change before retrying. [Tag resource and update methods](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces.tags).
- Re-read affected entities and check workspace status after editing. Use GTM Preview and Tag Assistant to test where each tag should fire and where it should stay quiet. If available, MCP `quickPreview` can report compiler errors or sync status. Browser Preview supplies separate evidence of actual execution. [Quick preview API](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces/quick_preview), [Preview and debug containers](https://support.google.com/tagmanager/answer/6107056).
- Review the full workspace changes before any requested version creation. A version represents a container snapshot. Publishing, rolling back a live version, deleting existing configuration, and changing access require explicit authorization under the [agent instructions](../AGENTS.md). [Publishing, versions, and approvals](https://support.google.com/tagmanager/answer/6107163).
- Use a scoped, sanitized export when a configuration diff is useful. Include referenced entities needed to understand the change. Review import behavior before using any export as input to a workspace change. [Container export and import](https://support.google.com/tagmanager/answer/6106997).

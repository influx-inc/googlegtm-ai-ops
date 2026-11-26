# GTM workspace operations

## Find the right configuration

1. Use the local `gtm` MCP server. List accessible accounts and their containers, then match the requested public `GTM-…` ID and site. Use the returned account and container IDs for subsequent MCP operations. If the container lookup returns a 404, listing containers by account can still find the match.
2. Check the latest saved and live baseline. List workspaces, select the intended one, and call workspace `getStatus`. Review pending changes and conflicts. Ask when multiple workspaces are plausible. Check whether pending work overlaps the requested change before editing or creating a version. [Baseline check](#check-the-baseline-before-editing)
3. Read affected tags, their firing and blocking triggers, variables, consent settings, and setup or cleanup tags. Compare with the live version when diagnosing published behavior. Inspect all relevant pages of paginated results.

Google documents [workspaces and conflicts](https://support.google.com/tagmanager/answer/7059647), the [REST API resources](https://developers.google.com/tag-platform/tag-manager/api/reference/rest), and [workspace status](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces/getStatus).

## Check the baseline before editing

Run these commands from the `googlegtm-ai-ops` root with `website` checked out alongside it. Pass the credentials file from this repository's sign-in. Omitting the option uses the website's default login. [Shared executable](https://github.com/influx-inc/website/blob/staging/tooling/google-tag-manager/bin/gtm-release) · [GTM sign-in](../README.md#google-tag-manager-sign-in)

```sh
gtm_release=../website/tooling/google-tag-manager/bin/gtm-release
gtm_credentials="$HOME/.config/googlegtm-ai-ops/application_default_credentials.json"
account_id=6000908850
container_id=31052321

"$gtm_release" baseline --credentials-file "$gtm_credentials" \
  --account "$account_id" --container "$container_id"
```

Use the resolved account and container IDs. `baseline` reports the latest saved and live version IDs without changing GTM. When they differ, it compares the full configurations and reports changed entity IDs. Review the drift before editing because Quick Preview can inherit changes from the latest saved version that workspace status omits. [Latest version header](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.version_headers/latest) · [Live version](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.versions/live)

## Edit and verify

- Follow the naming and configuration patterns in the selected workspace. For updates that replace the resource, read the full object first, preserve the other fields, and use the current fingerprint when supported. If a fingerprint is stale, re-read and check the intervening change before retrying. [Tag resource and update methods](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces.tags).
- Re-read affected entities and check workspace status after editing. Use GTM Preview and Tag Assistant to test where each tag should fire and where it should stay quiet. If available, MCP `quickPreview` can report compiler errors or sync status. Browser Preview supplies separate evidence of actual execution. [Quick preview API](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces/quick_preview), [Preview and debug containers](https://support.google.com/tagmanager/answer/6107056).
- Follow the release review before any requested version creation. Publishing, rolling back a live version, deleting existing configuration, and changing access require explicit authorization. [Release review](#review-and-verify-a-release) · [Agent instructions](../AGENTS.md) · [Publishing, versions, and approvals](https://support.google.com/tagmanager/answer/6107163)
- Use a scoped, sanitized export when a configuration diff is useful. Include referenced entities needed to understand the change. Review import behavior before using any export as input to a workspace change. [Container export and import](https://support.google.com/tagmanager/answer/6106997).

## Review and verify a release

Set `workspace_id` to the selected workspace, and set `expected_change` to an intended `OP:TYPE:ID` such as `edit:tag:26`. Repeat `--expect` for every intended entity change. Keep the receipt outside the checkout. The review compares the full Quick Preview configuration with the live version and stops on conflicts, compilation or sync errors, or any difference from the expected change list. Inspect the intended entities and resolve unexpected changes before release.

```sh
gtm_release_dir=$(mktemp -d)
receipt="$gtm_release_dir/review.json"

"$gtm_release" review --credentials-file "$gtm_credentials" \
  --account "$account_id" --container "$container_id" --workspace "$workspace_id" \
  --expect "$expected_change" > "$receipt"
```

For a repeatable browser check, use the shared compiled Preview runner with the successful receipt and an existing Preview environment for that workspace. Supply the same credentials file. The runner checks receipt freshness before and after, substitutes Google's script for the pinned container, and blocks booking and form writes during the check. [Compiled Preview instructions](https://github.com/influx-inc/website/blob/staging/tooling/google-tag-manager/README.md#compiled-preview)

Request explicit authorization to publish the reviewed workspace snapshot. Include the target, full change list, candidate digest, and live baseline from the receipt. Immediately before publishing in GTM, rerun the same review with the original receipt and all the same `--expect` values. If the receipt is stale, review the current diff and obtain fresh approval. Publish only after the approved review matches.

```sh
"$gtm_release" review --credentials-file "$gtm_credentials" \
  --account "$account_id" --container "$container_id" --workspace "$workspace_id" \
  --expect "$expected_change" --receipt "$receipt"
```

Set `published_version_id` to the version ID shown by GTM after publishing. `verify` checks the ID and digest of a fresh live snapshot against the reviewed candidate.

```sh
"$gtm_release" verify --credentials-file "$gtm_credentials" \
  --receipt "$receipt" --version "$published_version_id"
```

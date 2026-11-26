# Test HubSpot tracking on localhost

## Establish what the test can prove

1. Start at `http://localhost:4567/`. Use the [Influx setup snapshot](README.md#influx-setup) to check both loader sources. A source check can find direct embeds. A browser check can also find dynamically injected scripts.
2. Open GTM Preview for `GTM-WJG2TZX` in the intended workspace. Check that Tag Assistant is connected to the chosen local URL and select that container. If the GTM tag is silent, still check for a direct loader in Network. [General GTM debugging](../../docs/web-tagging.md#preview-a-local-site).
3. In DevTools Network, preserve the log across navigation. Look for the loader (`hs-scripts.com`), the tracking script (`hs-analytics.net`), and the `__ptq.gif` requests in HubSpot's verification guide. Allow for regional or site-specific hosts. Inspect the request initiator, status, count, and destination. In Application, check the cookies that should be present or absent. [HubSpot troubleshooting](https://knowledge.hubspot.com/reports/how-do-i-know-if-my-hubspot-tracking-code-is-working), [Chrome Network reference](https://developer.chrome.com/docs/devtools/network/reference/).
4. For browser-only checks, block the relevant collection, form, and booking writes or use fixtures. Record whether the tracking request was intercepted or reached HubSpot. Localhost and Preview can still run tags configured for production destinations. For a CRM check, use the approved test identity and verify the matching result in the intended portal.

## Confirm tracker readiness before checking silence

Verify that the analytics script loaded, the expected consent state reached the tracker, and an eligible control on the same page path can produce the expected tracking request. Capture that request even when the route blocks delivery. The loader's GTM firing status or an existing `_hsq` queue can precede analytics initialization. Observe the negative case through its relevant event window. If consent or the scenario intentionally prevents loading, establish readiness in a comparable allowed case in a fresh context. If the control cannot send, report the silence check as blocked and record the failed prerequisite.

## Verify cross-domain attribution in the CRM

An identified page view establishes browser delivery. Record whether the request was intercepted or received a successful response. Matching visitor tokens establish browser handoff. To pass attribution, use the HubSpot connector to find the approved test contact and verify the expected visit and native attribution in the CRM. Record Original Traffic Source, First Page Seen, page-view count and last analytics activity, and Latest Traffic Source if the scenario tests a returning contact. Record the custom GTM Channel separately. If the visit is still processing, leave the result pending and reread the same contact after processing. Use the approved CLI or API for a specific evidence gap, such as property history. [Cal booking CRM evidence](https://github.com/influx-inc/hubspot-ai-ops/blob/main/docs/CALCOM_OPERATIONS.md#verify-a-bookings-attribution)

## Choose scenarios for the change

| Scenario | Check |
| --- | --- |
| Fresh browser state | Check consent defaults, loader initiators, and the page-view count. If the intended policy delays loading, verify silence before consent. |
| Accept, reject, or allow only selected categories | Check the relevant Tag Assistant events, request counts, and cookie names for each choice. If HubSpot anonymized analytics is expected on rejection, verify it separately from identified tracking. |
| Grant or change consent on the same page | Check whether the tag is re-evaluated on an eligible event. Reload or navigate to confirm the stored preference is applied. |
| Initial page view and SPA navigation | Check the automatic first view, one view per intended virtual path, and silence on irrelevant URL changes or repeated callbacks. Include back/forward if routing is in scope. |
| Successful conversion and nearby failure | Verify one occurrence on true success, and silence on validation failure, cancellation, unrelated forms, and duplicate handlers. For authorized delivery checks, verify the occurrence's properties in the test account. |

## Troubleshoot by symptom

| Symptom | Inspect next |
| --- | --- |
| Tag Assistant never connects | Check whether the intended container loads on localhost, whether the debug parameter breaks the route, and whether an extension or CSP blocks Preview. |
| GTM says fired but no HubSpot tracking request appears | Check the script response, Console errors, consent and opt-out state, and browser blocking. Confirm the tracking script actually loaded and the application issued any required custom command. |
| HubSpot loads while the GTM tag is blocked | Check Network **Initiator** and the HTML for the direct embed, another tag, or an integration. |
| More page views or events than expected | Check direct and GTM installs, automatic plus manual first-page tracking, repeated route or form listeners, and browser plus server sends of the same outcome. Compare observed requests rather than script element counts alone. |
| Requests succeed but HubSpot has no matching result | Check the destination account, processing status, domain settings, filters and exclusions, report timeframe, and the event definition. Check form submissions, event occurrences, or traffic analytics according to the signal being tested. |

See [HubSpot troubleshooting](https://knowledge.hubspot.com/reports/how-do-i-know-if-my-hubspot-tracking-code-is-working), [site tracking settings](https://knowledge.hubspot.com/reports/set-up-sources-tracking), [traffic analytics](https://knowledge.hubspot.com/reports/analyze-your-site-traffic-with-the-traffic-analytics-tool), and [custom event reporting](https://knowledge.hubspot.com/analytics-tools/analyze-custom-behavioral-events).

## Read-only inspection script

Run [inspect-browser.js](scripts/inspect-browser.js) in the local page's DevTools Console or evaluate its contents in the page context of a browser automation tool. It reads script elements, known HubSpot resource timing entries, and known cookie names. It returns counts and booleans without making requests, pushing commands, exposing cookie values, or including request URLs. Resource counts cover entries retained in the current document. Use the Network panel for status, initiators, blocked requests, and requests across navigation.

## Record the result

Record the local route, GTM workspace or version, consent state, tracker readiness, expected and observed tag and request counts, and the HubSpot result if checked. Capture a firing and non-firing case. State why an unavailable check could not be run. Keep contact data, cookie values, and full request URLs out of committed evidence.

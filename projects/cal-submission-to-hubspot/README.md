# Cal.com booking capture and HubSpot implementation relay

Use Google Tag Manager (GTM) to capture the submitted values from **Meet with Influx** and detect when Cal.com confirms a new booking. Then use the existing HubSpot tracking code to create or update the primary booker's contact by email. Verify that HubSpot links the contact to the visitor's tracked pages and original acquisition source across the Influx and Cal.com domains.

## Starting configuration

| Item | Target |
| --- | --- |
| Hosted booking | [Meet with Influx](https://cal.com/team/influx/meet-with-influx), path `/team/influx/meet-with-influx` |
| GTM account and container | Influx, account `6000908850`, container `31052321`, public ID `GTM-WJG2TZX` |
| GTM workspace | Default Workspace `105` at the time of investigation |
| HubSpot loader | Existing GTM tag `26`, **HubSpot Tracking Code** |
| Local test entry point | `http://localhost:4567/` |

On 26 November 2026, the hosted booking page loaded the Influx GTM container and HubSpot's tracking and non-HubSpot forms scripts. Selecting a time opened a React-managed form within the existing page. Confirm was a `<button type="submit">`, and the form had a JavaScript submit handler. The workspace had three pending additions. The investigation reached the booking form without completing a booking, so the success event, final field keys, and live contact and attribution results still need verification. HubSpot's automatic collector requires static forms present at initial load and a standard submit input. This project uses the tracker’s visitor identification API. [HubSpot non-HubSpot form requirements](https://knowledge.hubspot.com/forms/use-non-hubspot-forms)

Start with the [repository instructions](../../AGENTS.md), [GTM workspace operations](../../docs/workspaces.md), [web tagging and debugging](../../docs/web-tagging.md), and [HubSpot tracking guide](../../platforms/hubspot-tracking-code/README.md). Use the local `gtm` MCP server to verify the account, container, workspace, pending changes, loader triggers, and consent settings. Compare the loader's Hub ID with the tracking code configured in the intended HubSpot portal. On localhost, check request initiators because the site may have both a direct loader and the GTM tag.

## Capture the booking and its fields in GTM

### Verify the success signal

1. Start with localhost for the capture logic and use GTM Preview and Tag Assistant on the hosted Cal.com flow to discover the real behavior. Use an approved test booking and test data for any check that creates a booking or contact. Preserve the browser network log across navigation.
2. Follow the normal journey from the Influx link through slot selection, form submission, and confirmation. Inspect GTM events, browser navigation, and the successful booking response to locate a browser-side signal that GTM can consume. Prefer a Cal.com success event if it is available on this hosted page. Confirm its exact name or predicate, timing, whether the document survives, how it identifies this event type and a new booking, and whether it exposes a stable booking identifier and the submitted values. A booking response visible in DevTools establishes what happened during the test. Separately verify that the GTM tag can access the chosen signal in the browser.
3. Compare a successful booking with an invalid submission, a failed booking request, and a reschedule. Inspect the confirmation page after reload and back/forward navigation. Require evidence of a **new confirmed booking** before emitting an event. A click, native submit event, history change, or confirmation URL by itself cannot establish that outcome.
4. Record the verified signal, correlation method, and field keys or selectors in this folder. If GTM cannot correlate a confirmed booking with its submitted values and primary email in the hosted flow, stop before wiring the production trigger and record the missing capability.

### Map and read the submitted values

Use synthetic, distinct values for each answer during inspection. Select controls within the active booking form and verify their actual `name`, type, and submitted key against the outgoing booking request or success payload. The labels below describe the current fields. Fill in the exact keys from Preview before implementing the mapping.

| Booking field | Required | Capture rule |
| --- | --- | --- |
| Your name | Yes | Read the primary booker's full name from the active name control. |
| Email address | Yes | Read the primary booker's email from the active email control. Keep guest emails outside the capture. |
| Company Name | Yes | Read the submitted company name. |
| Tell us what you need | Yes | Read the submitted textarea value. |
| How you describe your business | No | Read the submitted answer or leave it empty. |
| Where did you hear about us? | No | Read the submitted answer or leave it empty. This is separate from HubSpot's tracked acquisition source. |

Prefer reading these six values from the verified success signal when it contains them. Otherwise, have the GTM capture tag register a single delegated `submit` listener on the scoped page, early enough to see submissions after the React form mounts. Filter to the active booking form and read current values at submission time. Verify in Preview that the listener sees both button and keyboard submissions. Use the field map to exclude disabled, hidden, or duplicate controls, and build a fresh snapshot per attempt so optional blanks and retries cannot inherit old answers. Keep the snapshot in page memory only.

Match that snapshot to the corresponding confirmation using the correlation verified in Preview. If the booking fails or the form is abandoned, discard the snapshot. Replace it on retry, and clear it after successful use. If success occurs in a new document, the in-memory snapshot is lost. Require a verified success signal that makes the values available to GTM there before proceeding with that flow.

### Define GTM tags and the success event

Follow the container's naming conventions and keep the existing HubSpot loader as the single GTM loader.

| Component | Behavior |
| --- | --- |
| Scoped capture tag | Initialize once per document for the verified Meet with Influx flow, including any verified confirmation route needed for the selected signal. Apply the site's analytics consent rules before capturing or sending values. Register the success listener and, if needed, the form listener. Verify listener setup timing against the booking signal. |
| Success event | Use a GTM Custom Event named `cal_influx_booking_confirmed` after the listener has matched the values to a new confirmed booking. Push only `{ event: 'cal_influx_booking_confirmed' }` into the existing data layer. Keep field values and the booking correlation identifier in memory. |
| HubSpot tag | Trigger on that exact event with the verified Cal.com scope and analytics consent. Consume the matching email once through an in-memory handoff and queue HubSpot identification and delivery in order. Suppress repeated handling of the same booking. Verify the signal and deduplication together across reloads and navigation. |

The handoff can use a page-scoped function registered by the capture tag that returns the pending email once and clears the captured values. Gate the call on the verified event and consent. Check that the email is present and valid before queuing identity. If the site allows analytics consent to be granted after page load, verify that the capture tag initializes on the applicable consent update and handles subsequent submissions. Keep the raw values out of GTM data-layer variables, persistent browser storage, URLs added by this implementation, console logging, and task evidence. Other tags receive only the success event. Keep the other five answers within the GTM capture logic unless a separate field mapping to HubSpot is requested. [GTM data layer](https://developers.google.com/tag-platform/tag-manager/datalayer) · [GTM Custom Event triggers](https://support.google.com/tagmanager/answer/7679219)

## Create the contact and preserve attribution

1. Verify the HubSpot portal supports custom events. Find or configure a single contact-associated event for the confirmed booking and record its generated internal name. Verify that an existing tag or integration does not already emit it. [Create custom events](https://knowledge.hubspot.com/reports/create-custom-events)
2. In the HubSpot tag, identify the primary booker by email, then send the event. The example assumes `email` comes from the one-time handoff and `eventName` is the verified HubSpot internal name. `identify` queues the identity. The second call sends it so HubSpot can create or update the contact and link the browser's visitor token. [Identify a visitor](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/identify) · [Track custom events](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-event)

   ```js
   window._hsq = window._hsq || [];
   window._hsq.push(['identify', { email: email }]);
   window._hsq.push(['trackCustomBehavioralEvent', { name: eventName }]);
   ```

3. If custom events are unavailable, use `trackPageView` as the second command only for a real confirmation view that the tracker has yet to count. For a confirmed client-side navigation, use `setPath` before `trackPageView` if the tracker needs the confirmation path. Check the automatic page-view behavior and that the page context sent is appropriate. If no eligible view exists, record the limitation before implementing this branch. [Track a page view](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-page-view) · [Set the current page path](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/set-path)
4. In HubSpot's **Tracking Code → Advanced Tracking** settings, verify both domains are covered and **Automatic cross-domain linking** is enabled. With analytics consent granted, follow the real link from `influx.com` to `cal.com` and verify the presence and survival of HubSpot's link parameters without recording their values. Check the source page and any intermediate redirects if the parameters are missing. A contact can be created even if the earlier Influx visit did not carry over, so verify attribution independently. [HubSpot cross-domain tracking](https://knowledge.hubspot.com/reports/set-up-sources-tracking) · [Traffic source properties](https://knowledge.hubspot.com/properties/understand-traffic-source-properties)

## Verification

Start with localhost and scoped synthetic checks. Use the hosted form for the actual field and success signal checks. GTM Preview can send real data to HubSpot, so block collection requests for browser-only checks and use the approved test contact for downstream delivery checks. Follow the repository's [local testing guide](../../platforms/hubspot-tracking-code/local-testing.md).

| Scenario | Expected result |
| --- | --- |
| Confirmed booking by button and by keyboard | GTM reads the six expected values, associates each attempt with its correct booking, emits one success event per booking, and makes one identified HubSpot send. |
| Optional answers empty | Both optional values stay empty, including after a prior attempt with values. |
| Validation failure, failed booking request, then successful retry | No identified send on failure. The confirmed retry uses its own submitted values and sends once. |
| Abandonment, slot selection, unrelated booking, or reschedule | No booking success event or identified send from this project. |
| Confirmation reload, back/forward navigation, or repeated success callback | No second event or identified send for the same booking. |
| Analytics consent denied | No project capture or identified send. Check consent at capture and at delivery. |
| New email and existing email | HubSpot creates one contact for the new email and matches the existing contact on the repeat test. Check the custom event on the timeline if used. |
| Fresh visitor arriving through a known campaign | After following the real Influx link and completing the test booking, the contact shows the expected Influx page history, booking page activity, Original Traffic Source, and available campaign detail. Verify cross-domain continuity and expected page-view counts. |

For each check, record the workspace or version, environment, scenario, consent state, expected and observed tag and request counts, and the HubSpot result. Record blocked or unavailable checks with the reason. Keep evidence in this project folder and leave out field values, tracking identifiers, full decorated URLs, credentials, and unreviewed HAR files. Close and verify cleanup of any task-owned browser session after saving evidence.

## Workspace changes and release

- [ ] Record the observed Cal.com signal, how it correlates to a new booking, the six field keys, the consent decision, the verified HubSpot portal and event name, and the chosen delivery command.
- [ ] Recheck workspace status before editing. Add the scoped capture and HubSpot tags and the associated trigger. Re-read the changed entities and workspace status. Preserve unrelated edits and retain the GTM change IDs and sanitized test results in this folder.
- [ ] Complete Preview and HubSpot verification. Record the previous live GTM version and review the full set of changes included in the proposed version. If it contains unrelated pending changes, resolve the release scope before publishing.
- [ ] Obtain explicit authorization before publishing. After an authorized publish, confirm the live version and repeat the agreed smoke check for the booking path and HubSpot attribution.
- [ ] If a regression appears, record the observed impact and compare the previous live version with the current one. If reverting the whole version would undo another release, prepare a workspace change that disables this project's tags. Obtain explicit authorization before publishing that change or rolling back the live version.

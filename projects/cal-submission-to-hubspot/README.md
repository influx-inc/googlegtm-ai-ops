# Cal.com booking capture and HubSpot implementation relay

Use Google Tag Manager (GTM) to capture the primary booker's name, email address, and company name from **Meet with Influx**. When Cal.com confirms a new booking, use the existing HubSpot tracking code to create or update the contact by email and send those three answers. HubSpot must associate the analytics recorded for that visitor across the Influx and Cal.com domains, including page history and available source, referrer, and campaign details.

## Start here for each session

If the user points you at this relay without naming a task, pick **one work item** from the queue. Read the repository instructions and the latest handoff first. Take the first pending item whose prerequisites are complete and whose access and approvals are available. If a blocked item still needs input, continue with the next independent item. An explicit user request takes priority over the queue order.

Each item has a result the next session can use. If a selected item contains two substantial checks or changes that cannot reasonably fit together, split it in the queue before starting and take the first ready part. End the session after verifying and handing off that item. If you hit a blocker mid-item, save any verified partial results and record what would unblock the remainder.

| Item | Work for one session | Requires | Done when | Status |
| --- | --- | --- | --- | --- |
| 1 | [Confirm the baseline](#starting-configuration) | Read access to GTM and HubSpot | The current GTM workspace and pending changes, HubSpot portal and loader, and consent behavior are recorded. | Complete |
| 2 | [Map the three contact fields](#map-and-read-the-submitted-values) | 1 | The active controls and submitted keys are verified with synthetic input and a blocked booking request. Record the keys that item 3 must verify on success. | Complete |
| 3 | [Prove a usable booking success signal](#verify-the-success-signal) | 2 and an approved test booking | Evidence identifies a new confirmed booking, distinguishes it from an attempt or revisit, and shows how GTM can match it to the submitted values. Close any field mapping left open by item 2. | Complete |
| 4 | [Check cross-domain tracking](#create-the-contact-and-preserve-attribution) | 1 | The actual Influx link and Cal.com landing carry the same portal's tracking identity with consent. Record any break and where it occurs. | Pending |
| 5 | [Build and verify the GTM capture](#define-gtm-tags-and-the-success-event) | 2 and 3 | The scoped capture tag works in Preview. Verify the three fields, the success event, and silence on failure, reschedule, repeat handling, and denied consent using synthetic checks where possible. Record the draft GTM change IDs. | Pending |
| 6 | [Wire HubSpot identification](#create-the-contact-and-preserve-attribution) | 5 | The exact delivery command and any HubSpot event name are recorded. Preview proves one three-field handoff and the two tracker calls in order, using a browser-only check with collection blocked. | Pending |
| 7 | [Verify new-contact attribution](#verification) | 4 and 6, plus an approved test booking and new email | A single new contact has the tracked Influx and Cal.com journey and the expected source and campaign details. | Pending |
| 8 | [Verify existing-contact attribution](#verification) | 7 and an approved follow-up test booking | The same contact gains the new tracked journey, reflects the latest source, and retains the original source. | Pending |
| 9 | [Prepare the release](#workspace-changes-and-release) | 5–8 | The acceptance checks, proposed version contents, previous live version, and rollback approach are recorded for review. | Pending |
| 10 | [Publish and smoke-test](#workspace-changes-and-release) | 9 and explicit authorization to publish | The expected GTM version is live and the agreed smoke check passes. | Pending |

### Leave a handoff

Update the selected row to **Complete** when its done condition is met. Use **In progress** if a later session can continue from partial results, or **Blocked** if it needs access, approval, or a missing capability. A resumable **In progress** item takes priority over starting another pending item. Include the date, item number, what changed, checks run and their results, and the exact next action or blocker in the latest handoff below. Link to sanitized evidence and include any GTM workspace change IDs. Keep project files here and commit only the repository changes for the selected item.

**Latest handoff — 26 November 2026, item 3 complete.** One approved live booking returned `ACCEPTED` with a `uid` and all three contact fields. Cal.com pushed `bookingSuccessful` and `bookingSuccessfulV2`. Use `bookingSuccessful` for the confirmed booking and its contact data. One explicitly approved HubSpot tracking request returned `200`. Cal.com's existing integration created the matching contact. HubSpot showed zero tracked page views for it at the follow-up check. [Booking and delivery evidence](booking-success.md) · [Field evidence](field-mapping.md) · [GTM and HubSpot baseline](baseline.md)

**Next** — Start item 4 by finding the Influx link for **Meet with Influx**. The localhost homepage's Cal.com link opens the separate **Influx Discovery Call** event. Verify cross-domain linking on the intended route, then use the verified event and field paths in item 5.

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

The approved test established `bookingSuccessful` as the hosted GTM event. Read the accepted booking's identifier and three answers from `data.booking.uid` and `data.booking.responses` on that event. The [booking evidence](booking-success.md) records the event predicates and the source used to verify the payload.

1. Start with localhost for the capture logic and use GTM Preview and Tag Assistant on the hosted Cal.com flow to discover the real behavior. Use an approved test booking and test data for any check that creates a booking or contact. Preserve the browser network log across navigation.
2. Follow the normal journey from the Influx link through slot selection, form submission, and confirmation. Inspect GTM events, browser navigation, and the successful booking response to locate a browser-side signal that GTM can consume. Prefer a Cal.com success event if it is available on this hosted page. Confirm its exact name or predicate, timing, whether the document survives, how it identifies this event type and a new booking, and whether it exposes a stable booking identifier and the submitted values. A booking response visible in DevTools establishes what happened during the test. Separately verify that the GTM tag can access the chosen signal in the browser.
3. Compare a successful booking with an invalid submission, a failed booking request, and a reschedule. Inspect the confirmation page after reload and back/forward navigation. Require evidence of a **new confirmed booking** before emitting an event. A click, native submit event, history change, or confirmation URL by itself cannot establish that outcome.
4. Record the verified signal, correlation method, and field keys or selectors in this folder. If GTM cannot correlate a confirmed booking with its submitted values and primary email in the hosted flow, stop before wiring the production trigger and record the missing capability.

### Map and read the submitted values

The hosted form submitted the following keys in the [intercepted booking request](field-mapping.md). Check whether the success signal exposes those same answers before choosing a capture method.

| Booking field | Active control | Booking request key |
| --- | --- | --- |
| Your name | `input[type=text][name=name]` | `responses.name` |
| Email address | `input[type=email][name=email]` | `responses.email` |
| Company Name | `input[type=text][name=company]` | `responses.company` |

Prefer reading these three values from the verified success signal when it contains them. Otherwise, have the GTM capture tag register a single delegated `submit` listener on the scoped page, early enough to see submissions after the React form mounts. Filter to the active booking form and read current values at submission time. Verify in Preview that the listener sees both button and keyboard submissions. Use the field map to exclude disabled, hidden, or duplicate controls, and build a fresh in-memory snapshot per attempt.

Match that snapshot to the corresponding confirmation using the correlation verified in Preview. If the booking fails or the form is abandoned, discard the snapshot. Replace it on retry, and clear it after successful use. If success occurs in a new document, the in-memory snapshot is lost. Require a verified success signal that makes the values available to GTM there before proceeding with that flow.

### Define GTM tags and the success event

Follow the container's naming conventions and keep the existing HubSpot loader as the single GTM loader.

| Component | Behavior |
| --- | --- |
| Scoped capture tag | Initialize once per document for the verified Meet with Influx flow, including any verified confirmation route needed for the selected signal. Apply the site's analytics consent rules before capturing or sending values. Register the success listener and, if needed, the form listener. Verify listener setup timing against the booking signal. |
| Success event | Use a GTM Custom Event named `cal_influx_booking_confirmed` after the listener has matched the values to a new confirmed booking. Push only `{ event: 'cal_influx_booking_confirmed' }` into the existing data layer. Keep field values and the booking correlation identifier in memory. |
| HubSpot tag | Trigger on that exact event with the verified Cal.com scope and analytics consent. Consume the primary booker's name, email, and company once through an in-memory handoff, then queue HubSpot identification and delivery in order. Suppress repeated handling of the same booking. Verify the signal and deduplication together across reloads and navigation. |

The handoff can use a page-scoped function registered by the capture tag that returns the three pending values once and clears them. Gate the call on the verified event and consent. Check that the email is present and valid before queuing identity. If the site allows analytics consent to be granted after page load, verify that the capture tag initializes on the applicable consent update and handles subsequent submissions. Keep the raw values out of GTM data-layer variables, persistent browser storage, URLs added by this implementation, console logging, and task evidence. Other tags receive only the success event. [GTM data layer](https://developers.google.com/tag-platform/tag-manager/datalayer) · [GTM Custom Event triggers](https://support.google.com/tagmanager/answer/7679219)

## Create the contact and preserve attribution

1. Verify the HubSpot portal supports custom events. Find or configure a single contact-associated event for the confirmed booking and record its generated internal name. Verify that an existing tag or integration does not already emit it. [Create custom events](https://knowledge.hubspot.com/reports/create-custom-events)
2. In the HubSpot tag, identify the primary booker by email, then send the event. Use the contact properties `email`, `firstname`, `lastname`, and `company`. Follow HubSpot's full-name mapping convention by taking the first word as `firstname` and the rest as `lastname`. For a one-word name, omit `lastname`. Map the submitted company name to the contact's Company name field. The second tracker call sends the queued identity and links the visitor token. Verify that HubSpot stores the name and company on the contact during the approved delivery checks. [Identify a visitor](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/identify) · [Name mapping](https://knowledge.hubspot.com/integrations/understand-your-data-sync-field-mappings) · [Default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties)

   ```js
   window._hsq = window._hsq || [];
   window._hsq.push(['identify', contactProperties]);
   window._hsq.push(['trackCustomBehavioralEvent', { name: eventName }]);
   ```

3. If custom events are unavailable, use `trackPageView` as the second command only for a real confirmation view that the tracker has yet to count. For a confirmed client-side navigation, use `setPath` before `trackPageView` if the tracker needs the confirmation path. Check the automatic page-view behavior and that the page context sent is appropriate. If no eligible view exists, record the limitation before implementing this branch. [Track a page view](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-page-view) · [Set the current page path](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/set-path)
4. In HubSpot's **Tracking Code → Advanced Tracking** settings, verify both domains are covered and **Automatic cross-domain linking** is enabled. With analytics consent granted, follow the real link from `influx.com` to `cal.com` and verify the presence and survival of HubSpot's link parameters without recording their values. Check the source page and any intermediate redirects if the parameters are missing. A contact can be created even if the earlier Influx visit did not carry over, so verify attribution independently. [HubSpot cross-domain tracking](https://knowledge.hubspot.com/reports/set-up-sources-tracking) · [Traffic source properties](https://knowledge.hubspot.com/properties/understand-traffic-source-properties)

Use the tracker to associate the analytics HubSpot already recorded for the visitor token. HubSpot computes traffic source and campaign details from the tracked visits. Let HubSpot retain the first known source and attribute the latest known visit. The tag should only send the identity and the event or page view described above. Analytics that HubSpot could not collect or link, for example because consent was denied or the cross-domain handoff failed, cannot be recovered by identification. [HubSpot Tracking Code API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/overview) · [Original and Latest Traffic Source](https://knowledge.hubspot.com/properties/understand-traffic-source-properties)

## Verification

Start with localhost and scoped synthetic checks. Use the hosted form for the actual field and success signal checks. GTM Preview can send real data to HubSpot, so block collection requests for browser-only checks and use the approved test contact for downstream delivery checks. Follow the repository's [local testing guide](../../platforms/hubspot-tracking-code/local-testing.md).

| Scenario | Expected result |
| --- | --- |
| Confirmed booking by button and by keyboard | GTM reads name, email, and company, associates each attempt with its correct booking, emits one success event per booking, and makes one identified HubSpot send. |
| Validation failure, failed booking request, then successful retry | No identified send on failure. The confirmed retry uses its own submitted values and sends once. |
| Abandonment, slot selection, unrelated booking, or reschedule | No booking success event or identified send from this project. |
| Confirmation reload, back/forward navigation, or repeated success callback | No second event or identified send for the same booking. |
| Analytics consent denied | No project capture or identified send. Check consent at capture and at delivery. |
| New email from a known campaign | Start in a fresh browser state with an approved email that has no contact. Follow the real Influx link to Cal.com. Verify exactly one new contact with the tracked Influx landing page and subsequent page activity, the Cal.com booking activity, and the expected Original and Latest Traffic Source and available referrer and campaign details. |
| Existing contact from a different known campaign | Record the existing contact's ID and Original Traffic Source. Start in a fresh browser state with a distinct known campaign and book using the existing email. Verify that the same contact gains the current journey's tracked Influx and Cal.com activity without creating a duplicate. Check Latest Traffic Source and its available campaign details after HubSpot processes the visit. Verify that the earlier Original Traffic Source remains. |

For both contact scenarios, verify the contact's name, email, and company, check the booking custom event on the timeline if used, and verify the expected page-view count. Record contact matching and analytics attribution as separate results. A network send or matched contact alone is insufficient for release. For each check, record the workspace or version, environment, scenario, consent state, expected and observed tag and request counts, and the HubSpot result. Record blocked or unavailable checks with the reason. Keep evidence in this project folder and leave out field values, tracking identifiers, full decorated URLs, credentials, and unreviewed HAR files. Close and verify cleanup of any task-owned browser session after saving evidence.

## Workspace changes and release

- [ ] Record the observed Cal.com signal, how it correlates to a new booking, the three field keys, the consent decision, the verified HubSpot portal and event name, and the chosen delivery command.
- [ ] Recheck workspace status before editing. Add the scoped capture and HubSpot tags and the associated trigger. Re-read the changed entities and workspace status. Preserve unrelated edits and retain the GTM change IDs and sanitized test results in this folder.
- [ ] Complete Preview and HubSpot verification. Record the previous live GTM version and review the full set of changes included in the proposed version. If it contains unrelated pending changes, resolve the release scope before publishing.
- [ ] Obtain explicit authorization before publishing. After an authorized publish, confirm the live version and repeat the agreed smoke check for the booking path and HubSpot attribution.
- [ ] If a regression appears, record the observed impact and compare the previous live version with the current one. If reverting the whole version would undo another release, prepare a workspace change that disables this project's tags. Obtain explicit authorization before publishing that change or rolling back the live version.

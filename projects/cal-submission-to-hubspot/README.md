# Cal.com booking capture and HubSpot implementation relay

Use Google Tag Manager (GTM) to capture the primary booker's name, email address, and company name from **Meet with Influx**. When Cal.com confirms a new booking on `cal.com/team/influx/meet-with-influx`, this experiment uses the existing HubSpot tracker to send an identified `/booking` page view with those answers. The website's inline `/book-meeting` embed uses a dedicated HubSpot form and has its own acceptance checks. [Website inline embed project](https://github.com/influx-inc/website/tree/staging/projects/2026-11-cal-hubspot-tracking)

## Start here for each session

If the user points you at this relay without naming a task, pick **one work item** from the queue. Read the repository instructions and the latest handoff first. Take the first pending item whose prerequisites are complete and whose access and approvals are available. If a blocked item still needs input, continue with the next independent item. An explicit user request takes priority over the queue order.

Each item has a result the next session can use. If a selected item contains two substantial checks or changes that cannot reasonably fit together, split it in the queue before starting and take the first ready part. End the session after verifying and handing off that item. If you hit a blocker mid-item, save any verified partial results and record what would unblock the remainder.

| Item | Work for one session | Requires | Done when | Status |
| --- | --- | --- | --- | --- |
| 1 | [Confirm the baseline](#starting-configuration) | Read access to GTM and HubSpot | The current GTM workspace and pending changes, HubSpot portal and loader, and consent behavior are recorded. | Complete |
| 2 | [Map the three contact fields](#map-and-read-the-submitted-values) | 1 | The active controls and submitted keys are verified with synthetic input and a blocked booking request. Record the keys that item 3 must verify on success. | Complete |
| 3 | [Prove a usable booking success signal](#verify-the-success-signal) | 2 and an approved test booking | Evidence identifies a new confirmed booking, distinguishes it from an attempt or revisit, and shows how GTM can match it to the submitted values. Close any field mapping left open by item 2. | Complete |
| 4 | [Verify the browser identity handoff](#create-the-contact-and-preserve-attribution) | 1 | HubSpot uses the same visitor token on both domains. CRM attribution is verified in items 7 and 8. | Blocked |
| 5 | [Build and verify the GTM capture](#configure-the-confirmation-page-view) | 2 and 3 | The scoped tag reads the three verified fields on confirmed booking and stays quiet for the negative cases. | Complete in browser Preview |
| 6 | [Wire HubSpot identification](#create-the-contact-and-preserve-attribution) | 5 | Preview produces one confirmation page-view request with the visitor identity. | Complete in browser Preview |
| 7 | [Verify new-contact attribution](#verification) | 4 and 6, plus an approved test booking and new email | A single new contact has the tracked Influx and Cal.com journey and the expected source and campaign details. | Pending |
| 8 | [Verify existing-contact attribution](#verification) | 4 and 6, plus approved test bookings | The same contact gains the new tracked journey, reflects the latest source, and retains the original source. | Pending |
| 9 | [Prepare the release](#workspace-changes-and-release) | 5–8 | The acceptance checks, proposed version contents, previous live version, and rollback approach are recorded for review. | Pending |
| 10 | [Publish and smoke-test](#workspace-changes-and-release) | 9 and explicit authorization to publish | The expected GTM version is live and the agreed smoke check passes. | Pending |

### Leave a handoff

Update the selected row to **Complete** when its done condition is met. Use **In progress** if a later session can continue from partial results, or **Blocked** if it needs access, approval, or a missing capability. A resumable **In progress** item takes priority over starting another pending item. Include the date, item number, what changed, checks run and their results, and the exact next action or blocker in the latest handoff below. Link to sanitized evidence and include any GTM workspace change IDs. Keep project files here and commit only the repository changes for the selected item.

**Latest handoff — 26 November 2026.** GTM workspace `105` has tag `142` and triggers `140` and `141`. Browser Preview produced one identified `/booking` page view. Cal.com received the HubSpot linker parameters, but HubSpot skipped the handoff because its fingerprint was still initializing. An earlier browser-only loader preserved the visitor token. Changing the GTM trigger to Initialization still loaded the tracker too late and was reverted. [Preview and attribution evidence](attribution-preview.md)

**Next** — Resolve the tracker’s startup timing on the hosted Cal.com page. Once a fresh browser carries the Influx visitor token through to the confirmed Cal.com page view, run the approved existing-contact test and check the actual HubSpot contact. [Booking and delivery evidence](booking-success.md) · [Field evidence](field-mapping.md) · [GTM and HubSpot baseline](baseline.md)

## Starting configuration

| Item | Target |
| --- | --- |
| Hosted booking | [Meet with Influx](https://cal.com/team/influx/meet-with-influx), path `/team/influx/meet-with-influx` |
| GTM account and container | Influx, account `6000908850`, container `31052321`, public ID `GTM-WJG2TZX` |
| GTM workspace | Default Workspace `105` at the time of investigation |
| HubSpot loader | Existing GTM tag `26`, **HubSpot Tracking Code** |
| Local test entry point | `http://localhost:4567/` |

The Cal.com page loads the Influx GTM container and the existing HubSpot tracker. The approved booking verified the `bookingSuccessful` signal and the three fields. Cal.com’s native integration created the contact. The CRM showed zero tracked views after one identified tracking request received HTTP 200. [Booking and delivery evidence](booking-success.md)

Start with the [repository instructions](../../AGENTS.md), [GTM workspace operations](../../docs/workspaces.md), [web tagging and debugging](../../docs/web-tagging.md), and [HubSpot tracking guide](../../platforms/hubspot-tracking-code/README.md). Use the local `gtm` MCP server to verify the account, container, workspace, pending changes, loader triggers, and consent settings. Compare the loader's Hub ID with the tracking code configured in the intended HubSpot portal. On localhost, check request initiators because the site may have both a direct loader and the GTM tag.

## Capture the booking and its fields in GTM

### Verify the success signal

The approved test established `bookingSuccessful` as the hosted GTM event. Read the accepted booking's identifier and three answers from `data.booking.uid` and `data.booking.responses` on that event. The [booking evidence](booking-success.md) records the event predicates and the source used to verify the payload.

Cal.com emits this event before navigating to the matching confirmation in the same document. Use the accepted booking response and event type to distinguish new bookings from attempts, reschedules, and revisits.

### Map and read the submitted values

The hosted form submitted the following keys in the [intercepted booking request](field-mapping.md). Check whether the success signal exposes those same answers before choosing a capture method.

| Booking field | Active control | Booking request key |
| --- | --- | --- |
| Your name | `input[type=text][name=name]` | `responses.name` |
| Email address | `input[type=email][name=email]` | `responses.email` |
| Company Name | `input[type=text][name=company]` | `responses.company` |

### Configure the confirmation page view

[Confirmation page-view tag source](confirmation-page-view.html) is the Custom HTML deployed to `HS - Meet with Influx confirmation page view` in workspace `105`. The page-view trigger registers a HubSpot analytics consent listener. Cal.com’s `bookingSuccessful` then triggers the same tag, which confirms the host, route, event type, acceptance, and consent before handling the three fields. The booking ID is used for in-memory deduplication. The booking fields stay in Cal.com’s existing payload until the tag reads them.

## Create the contact and preserve attribution

The tag calls `identify` with the primary booker’s email, first word of their name as `firstname`, remaining words as `lastname`, and company as `company`. A single-word name omits `lastname`. It then calls `setPath` with `/booking` and `trackPageView` once. The tracker sends the actual browser URL alongside the reporting path, so the tag runs before Cal.com adds the booking ID and email to the confirmation URL. The existing loader handles the initial page view. [Identify a visitor](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/identify) · [Track a page view](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-page-view)

HubSpot’s automatic cross-domain linker is enabled for `influx.com` and `cal.com`. Follow the attributed Influx landing page to Cal.com and compare visitor tokens from the initial page views and the identified send in memory. The linker parameters establish URL decoration. Matching tokens establish browser handoff. HubSpot calculates traffic source and available campaign details from the visits it associates with the contact. [HubSpot cross-domain tracking](https://knowledge.hubspot.com/reports/set-up-sources-tracking) · [Traffic source properties](https://knowledge.hubspot.com/properties/understand-traffic-source-properties)

## Verification

Start with localhost and scoped synthetic checks. Use the hosted route for the actual field and success signal checks. Block booking, form, and collection writes in browser-only checks. Before asserting silence, establish tracker readiness with an eligible control that produces the expected tracking request and check consent at the event. Reserve a real booking for an unresolved CRM outcome or a change to booking, delivery, or meeting behavior. Use an approved test contact for a downstream check. [Tracker readiness and CRM evidence](../../platforms/hubspot-tracking-code/local-testing.md#confirm-tracker-readiness-before-checking-silence)

| Scenario | Expected result |
| --- | --- |
| Confirmed booking by button and by keyboard | GTM reads name, email, and company, and sends one identified confirmation page view per accepted booking. |
| Validation failure, failed booking request, then successful retry | No identified send on failure. The confirmed retry uses its own submitted values and sends once. |
| Abandonment, slot selection, unrelated booking, or reschedule | No identified confirmation page view. |
| Confirmation reload, back/forward navigation, or repeated success callback | No second identified confirmation page view for the same booking. |
| Analytics consent denied | No project capture or identified send. Check consent at capture and at delivery. |
| New email from a known campaign | Start in a fresh browser state with an approved email that has no contact. Follow the real Influx link to Cal.com. Verify exactly one new contact with the tracked Influx landing page and subsequent page activity, the Cal.com booking activity, and the expected Original and Latest Traffic Source and available referrer and campaign details. |
| Existing contact from a different known campaign | Record the existing contact's ID and Original Traffic Source. Start in a fresh browser state with a distinct known campaign and book using the existing email. Verify that the same contact gains the current journey's tracked Influx and Cal.com activity without creating a duplicate. Check Latest Traffic Source and its available campaign details after HubSpot processes the visit. Verify that the earlier Original Traffic Source remains. |

For both contact scenarios, verify the contact's name, email, and company, and verify the expected page-view count. The identified page view proves browser delivery. The CRM attribution check passes when the same contact shows the expected visit and native source and page evidence, including the appropriate traffic source and First Page Seen. Leave attribution pending while HubSpot processes the visit. Read the same contact again and report the custom GTM Channel separately. [Connector-first CRM read](https://github.com/influx-inc/hubspot-ai-ops/blob/main/docs/CALCOM_OPERATIONS.md#verify-a-bookings-attribution)

Record the workspace or version, environment, scenario, tracker readiness, consent state, tag and request counts, contact match, visit processing, and attribution result. Record why any check was blocked. Keep evidence in this project folder and leave out field values, tracking identifiers, full decorated URLs, credentials, and unreviewed HAR files. Close and verify cleanup of any task-owned browser session after saving evidence.

## Workspace changes and release

- [x] Record the verified booking signal, field keys, HubSpot portal, consent check, and page-view commands.
- [x] Add and re-read the scoped tag and both triggers. Record their IDs, Preview results, and the pending workspace changes.
- [ ] Complete Preview and HubSpot verification. Review the full candidate against the live baseline and resolve unexpected changes. [Release review](../../docs/workspaces.md#review-and-verify-a-release)
- [ ] Obtain explicit authorization bound to the review receipt. Check freshness before publishing. After an authorized publish, verify the live version ID and digest and repeat the agreed smoke check.
- [ ] If a regression appears, record the observed impact and compare the previous live version with the current one. If reverting the whole version would undo another release, prepare a workspace change that disables this project's tags. Obtain explicit authorization before publishing that change or rolling back the live version.

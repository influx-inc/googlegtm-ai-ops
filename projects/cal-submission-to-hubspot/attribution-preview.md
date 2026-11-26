# HubSpot confirmation page view and cross-domain Preview

26 November 2026. Influx GTM container `GTM-WJG2TZX`, Default Workspace `105`, live version `102`. Draft tag `142` uses scoped page-view trigger `140` and Cal.com’s `bookingSuccessful` trigger `141`. Workspace Quick Preview compiled successfully. The published version stayed at `102`.

## Browser results

Chromium loaded the actual workspace Preview script on the Influx and Cal.com origins. The Influx homepage’s existing Cal.com link points to Discovery Call, so the test inserted a temporary Meet with Influx link in the browser. It used a known email campaign on the Influx landing URL, synthetic booking data in the browser, and intercepted HubSpot collection requests. Tag Assistant’s UI timeline was outside this check.

| Check | Result |
| --- | --- |
| Initial views | The Influx landing and Cal.com booking page each attempted a page view. The Influx request carried the test campaign. |
| Consent granted and confirmed booking | Exactly one identified page-view request reported `/booking`, had the expected email, split name, and company, and used the Cal.com visitor token. Its page URL field excluded the confirmation booking ID and email query parameter. |
| Negative cases | No identified send for V2, reschedule, pending, payment, unconfirmed status, another event type, invalid email, or replay from the confirmation route or the original booking route. Local JavaScript checks also confirmed silence before consent, after denial or revocation, and on unrelated pages. |
| Cross-domain link | All three HubSpot linker parameters arrived. The incoming token matched the Influx view. HubSpot logged `hsfp_skipped` with `notready` on Cal.com and used a different token for the booking view. |
| Earlier loader experiment | Installing the same loader at the start of the Cal.com document in a browser-only test produced `hsfp_match` and one matching token across the Influx, Cal.com, and confirmation requests. Moving the existing loader to GTM Initialization in Preview still started the analytics script after window load and reproduced `notready` in three fresh contexts. That workspace experiment was reverted. |

The current hosted flow needs HubSpot to read the incoming visitor identity after its fingerprint is ready, or the HubSpot loader to start before the deferred GTM container on Cal.com. This reproduces the loss of Influx source and page history. The reason the earlier direct-to-Cal.com test’s HTTP 200 did not yield even a Cal.com page view is still unverified.

The workspace retains the confirmation page-view tag, its two triggers, and the unrelated additions `137`–`139`. Loader `26` matches its pre-test configuration. A read-only CRM check found one match for the original test, still with zero page views and Offline for both traffic sources. The normal workspace Preview still lost the Influx visitor identity, so the implementation did not proceed to another live booking. A fresh-contact test needs a separately approved address. Task-owned browsers and their automation sessions were closed and their tracked processes verified stopped.

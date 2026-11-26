# HubSpot browser API and events

## Tracking commands

The HubSpot tracking loader processes queued commands from `window._hsq` when it loads. Preserve the queue with `window._hsq = window._hsq || []` so existing commands survive. The initial page view is automatic. A queue entry shows that code issued a command. The browser request and HubSpot's reporting surfaces provide separate verification. [Tracking code API overview](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/overview).

| Command | When to use it | Reference |
| --- | --- | --- |
| `setPath` | Set a slash-prefixed path for the next page view. For a custom initial path, queue it before the tracker loads. | [Set the current page path](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/set-path) |
| `trackPageView` | Record a virtual page view after `setPath` when a real client-side navigation completes. Leave the initial document load to the automatic page view. | [Track a page view](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-page-view) |
| `identify` | Set an identity using the known visitor's email. The next page view or custom event sends it. HubSpot can link it to the `hubspotutk` visitor token and create or update a contact. Keep email out of GTM data-layer events and use an approved test account for identity checks. | [Identify a visitor](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/identify) |
| `trackCustomBehavioralEvent` | Send a browser event with `name` equal to the account's internal event name and an optional `properties` object. The legacy `trackEvent` no longer works. | [Track custom events](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/track-event) |
| `setContentType` | Classify an external page for HubSpot analytics or attribution, for example as `landing-page` or `blog-post`, when the reporting requirement calls for it. | [HubSpot install guide's page-type section](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code) |

### SPA page-view example

This example represents a completed client-side navigation after the tracker handles the initial document. Use the route that the application actually rendered. Check redirects, back and forward navigation, and URL changes that leave the visible page unchanged. Raw query strings can contain personal data or one-time tokens. Use only the path and query keys required by the measurement spec. [HubSpot's SPA example](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/overview#tracking-in-single-page-applications), [GTM History Change](https://support.google.com/tagmanager/answer/7679322).

```js
const trackingQueue = (window._hsq = window._hsq || []);
trackingQueue.push(['setPath', '/resources/getting-started']);
trackingQueue.push(['trackPageView']);
```

### Custom event example

Find the definition and property internal names in **Data Management → Event Management**. Verify subscription access, the associated object, property types, and allowed enum values. Use the fully qualified name (`pe{HubID}_{name}`) supplied by that account. Check whether a HubSpot-hosted JavaScript snippet, visualizer, GTM tag, or server integration already sends the same occurrence. [Create custom events](https://knowledge.hubspot.com/reports/create-custom-events), [event visualizer](https://knowledge.hubspot.com/analytics-tools/create-codeless-custom-behavioral-events).

```js
// Placeholder event and property for an approved test account.
const trackingQueue = (window._hsq = window._hsq || []);
trackingQueue.push([
  'trackCustomBehavioralEvent',
  {
    name: 'pe12345678_resource_opened',
    properties: { resource_type: 'guide' },
  },
]);
```

Use the authenticated Events API for appropriate backend events. The HTTP API uses `eventName` and supports a caller-supplied `uuid` for deduplication. Keep credentials server-side. Give each business outcome one owner, or define how the separate browser and server signals will be counted. Check received occurrences and property values in Event Management or the associated record's activity when applicable. [Send custom event occurrences](https://developers.hubspot.com/docs/api-reference/latest/events/send-event-data/guide), [analyze custom events](https://knowledge.hubspot.com/analytics-tools/analyze-custom-behavioral-events).

## Forms

| Form path | What to check | Reference |
| --- | --- | --- |
| HubSpot forms made with the updated editor | `hs-form-event:on-submission:success` is emitted on `window`. Register the listener in time, scope it to the intended form or instance, and pass only the approved non-personal fields to GTM. Test both success and validation failure. | [Global form events](https://developers.hubspot.com/docs/api-reference/latest/marketing/forms/global-form-events) |
| Legacy HubSpot embed | Inspect the existing embed and use its post-submission signal such as `onFormSubmitted`. Pre-submit callbacks run before the submission is saved. | [Legacy form events](https://developers.hubspot.com/docs/cms/start-building/features/forms/legacy-forms#form-events) |
| Non-HubSpot form | Check whether HubSpot's capture setting is enabled and whether the markup and submission flow meet its requirements. HubSpot documents restrictions for iframe and dynamically introduced forms. Automatic capture can also pick up clicks that do not lead to a valid submission. | [Use non-HubSpot forms](https://knowledge.hubspot.com/forms/use-non-hubspot-forms) |

An embedded HubSpot form can collect submissions even when site analytics is unavailable. For a conversion tag, trace the actual successful submission through any redirect and check for double counting from overlapping listeners. Verify the form result in HubSpot's form reporting when the test is intended to create a submission. [Tracking code installation](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code), [form submission analytics](https://knowledge.hubspot.com/forms/analyze-form-submissions-data).

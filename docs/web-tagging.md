# GTM web tagging and debugging

## Events and tags

| Topic | How to use it | Reference |
| --- | --- | --- |
| Data layer | Preserve the existing data layer array. Push the `event` name and values needed by its tags in the same message. GTM processes queued messages in order. Inspect values at the specific event, especially if values can carry forward on the same page. | [The data layer](https://developers.google.com/tag-platform/tag-manager/datalayer) |
| Trigger timing | The page-load sequence is Consent Initialization, Initialization, Page View, DOM Ready, then Window Loaded. Use the earliest event at which the needed consent state and inputs are available. | [Page view triggers](https://support.google.com/tagmanager/answer/7679319) |
| Custom events | Use the exact event name and check conditions with event-time values. Use a confirmed application outcome for conversions such as a successful submission. | [Custom event triggers](https://support.google.com/tagmanager/answer/7679219), [firing and blocking triggers](https://support.google.com/tagmanager/answer/7679316) |
| SPA navigation | Verify how the router signals a completed navigation. GTM History Change can observe URL fragment and History API changes, which may also happen without a new page view. | [History Change trigger](https://support.google.com/tagmanager/answer/7679322) |
| Firing limits | Once per event limits repeated evaluation of a single GTM event. Once per page can limit library setup to one execution per document, including documents with client-side navigation. | [Tag firing options](https://support.google.com/tagmanager/answer/6279951) |
| Sequencing | If a tag needs a setup tag, inspect sequencing and its failure behavior. For asynchronous scripts, check actual library readiness separately. | [Tag sequencing](https://support.google.com/tagmanager/answer/6238868) |
| Tag types | Inspect existing native or custom templates, their permissions, and current Custom HTML before extending the setup. Use GTM consent APIs when handling consent inside a template. | [Custom tags](https://support.google.com/tagmanager/answer/6107167), [custom templates](https://developers.google.com/tag-platform/tag-manager/templates), [template permissions](https://developers.google.com/tag-platform/tag-manager/templates/permissions) |

## Consent

- Find where consent defaults are set and where the consent management platform (CMP) sends updates. Consent Initialization is for consent setup. In a GTM consent template, use `setDefaultConsentState` and `updateConsentState`. [Set up consent mode](https://developers.google.com/tag-platform/security/guides/consent), [create a consent mode template](https://developers.google.com/tag-platform/tag-manager/templates/consent-apis).
- Inspect each tag's built-in and additional consent checks. For tags that require separate gating, trace what triggers them on an initial page load and after a visitor grants consent on that same page. A tag blocked at its original trigger needs a later eligible trigger if it should fire after consent changes. [Tag Manager consent settings](https://support.google.com/tagmanager/answer/10718549), [Google guidance on trigger-time consent](https://support.google.com/tagmanager/answer/12962079).

## Preview a local site

1. Open Preview from the intended workspace and connect to the local URL in the [repository instructions](../AGENTS.md). Check that the page loads the intended container. If the debug signal breaks local routing, retry with **Include debug signal in the URL** unchecked. [Preview and debug containers](https://support.google.com/tagmanager/answer/6107056), [Tag Assistant troubleshooting](https://support.google.com/tagmanager/answer/10039345).
2. Reproduce each relevant action. In Tag Assistant, select the exact event and inspect fired or blocked tags, variable values, consent state, and order. Check a nearby route or action where the tag should stay quiet.
3. Use DevTools Network with **Preserve log** when navigation or redirects are involved. Inspect the initiator, status, and destination of actual requests. Use Application → Cookies for names, domains, and flags. Check Console for CSP errors or blocked resources. [Network reference](https://developer.chrome.com/docs/devtools/network/reference/), [cookie inspection](https://developer.chrome.com/docs/devtools/application/cookies/), [GTM and CSP](https://developers.google.com/tag-platform/security/guides/csp).
4. Record the route, action, workspace or version, expected and observed tag counts, consent state, and downstream result if checked. Omit cookie values, form fields, full tracking URLs, and unreviewed HAR files from task evidence.

# HubSpot consent and domains

## Find the owner of consent

Inspect how the page loads HubSpot and which consent management platform supplies defaults and updates. The HubSpot banner controls HubSpot's own cookie behavior. Google Consent Mode sends signals to Google tags. For a third-party script, trace the actual integration or trigger that gates it. Check any direct page embed alongside the GTM configuration. [HubSpot consent banner FAQ](https://knowledge.hubspot.com/privacy-and-consent/consent-banner-faq), [Google Tag Manager consent settings](https://support.google.com/tagmanager/answer/10718549).

| API | Purpose | Reference |
| --- | --- | --- |
| `_hsp.push(['addPrivacyConsentListener', callback])` | Read HubSpot banner consent. For category-based banners inspect `analytics`, `advertisement`, and `functionality` under `consent.categories`. Account for a stored preference or an immediate callback when no banner is enabled. | [Get privacy consent status](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api#get-privacy-consent-status) |
| `_hsp.push(['setHubSpotConsent', categories])` | Pass category selections from a third-party consent banner to HubSpot when that integration is in use. Confirm which system sets the initial state and sends updates. | [Consent Banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api) |
| `_hsp.push(['revokeCookieConsent'])` | Remove HubSpot cookies covered by the banner. Verify what the banner does on the next load. Historical data and other vendors' cookies are outside its scope. | [Consent Banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api), [revoke cookie consent](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/revoke-cookie-consent) |
| `_hsq.push(['doNotTrack'])` | Set `__hs_do_not_track` to suppress the tracker's sends, including anonymous traffic. The dedicated banner guide documents `['doNotTrack', { track: true }]` to clear the opt-out. | [Consent Banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api), [enable do not track](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/do-not-track) |

HubSpot's standalone listener and revocation pages show `_hsq` examples. The dedicated Consent Banner API uses `_hsp` for both, and HubSpot's Google Consent Mode guide also uses `_hsp` for its listener. Follow the dedicated banner guide and verify callbacks in the browser. [Listener page](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/add-privacy-consent-listener), [revocation page](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/revoke-cookie-consent), [Consent Banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api), [HubSpot and Google Consent Mode](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/google-consent-mode).

Determine what the implementation should do on rejection. HubSpot documents that declining its banner cookies can leave anonymized page-view collection active. A requirement to suppress all HubSpot tracking traffic needs a separate check of loader gating or the tracking opt-out. Inspect both requests and cookie storage. [HubSpot Consent Banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api), [cookie banner setup](https://knowledge.hubspot.com/privacy-and-consent/set-up-a-consent-banner-with-the-new-editor).

## Cookies and host settings

| What you see | What to verify |
| --- | --- |
| `hubspotutk`, `__hstc`, `__hssc`, `__hssrc` | HubSpot classifies these as analytics cookies. Look for cookie names, attributes, and the state in which they appear. |
| `__hs_opt_out`, `__hs_do_not_track` | These are preference or opt-out cookies. Interpret them in the context of the banner or tracker test. |
| Banner missing on localhost | Check the consent domain, URL path, geographic rules, saved browser preferences, and banner policy type. Confirm the expected local behavior before using it to infer production behavior. |
| Requests succeed but reports are empty | Check the destination account, Additional site domains, domain restrictions, IP or referrer exclusions, bot filtering, date range, and report filters. |
| Attribution changes between domains or subdomains | Review automatic cross-domain linking and cookie scope. HubSpot may decorate links between distinct domains with `__hsfp`, `__hssc`, and `__hstc`. Subdomain cookie scoping is a separate setting. Check secure-cookie behavior in the browser when comparing HTTP localhost with HTTPS. |

See the [HubSpot cookie inventory](https://knowledge.hubspot.com/privacy-and-consent/what-cookies-does-hubspot-set-in-a-visitor-s-browser), [site tracking and cross-domain settings](https://knowledge.hubspot.com/reports/set-up-sources-tracking), [traffic exclusions](https://knowledge.hubspot.com/reports/exclude-traffic-from-your-site-analytics), and [consent banner FAQ](https://knowledge.hubspot.com/privacy-and-consent/consent-banner-faq).

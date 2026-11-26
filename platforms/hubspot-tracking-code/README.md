# HubSpot tracking code

| When you need to | Start here |
| --- | --- |
| Find the existing loader and understand what it can affect | [Influx setup](#influx-setup) |
| Implement page views, visitor identification, custom events, or form tracking | [Browser API and event reference](browser-api.md) |
| Trace banner behavior, cookies, and related GTM settings | [Consent and domains](consent-and-domains.md) |
| Verify a change on localhost or troubleshoot missing data | [Local testing](local-testing.md) |
| Collect a sanitized browser summary | [Read-only inspection script](local-testing.md#read-only-inspection-script) |

See the [general GTM docs](../../docs/README.md) for workspace operations and Tag Assistant. HubSpot's starting points are the [tracking code API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/overview) and the [external-site installation guide](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code).

## Influx setup

The default is the `influx.com` GTM web container `GTM-WJG2TZX`. Test on `http://localhost:4567/` under the [repository instructions](../../AGENTS.md). Verify the HubSpot account independently by comparing the loader with the embed under **Settings → Tracking & Analytics → Tracking Code** in the intended account. The GTM ID identifies the container and the Hub ID identifies the HubSpot account. Preview can run real vendor scripts and send to the configured accounts even from localhost. [HubSpot installation guide](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code), [GTM Preview](https://support.google.com/tagmanager/answer/6107056).

### Read-only snapshot from 2026-11-26

| Surface | Observation |
| --- | --- |
| Local homepage HTML | `http://localhost:4567/` returned HTTP `200`. The HTML contained the `GTM-WJG2TZX` bootstrap and a direct `hs-script-loader` script from `js.hs-scripts.com`. A second GTM ID, `GTM-WMPXXKQ`, appeared in HTML comments. |
| GTM live and draft | Live version `102` and **Default Workspace** both contained `HubSpot Tracking Code` (tag `26`), a Custom HTML loader pointing at the same HubSpot account as the direct embed. It was configured once per event with additional consent checks `notSet`. The workspace status showed three pending additions, none of them tag `26`. |

Re-check the workspace and local markup before editing. There are two potential loader sources on localhost. Use Network initiators and Tag Assistant to determine what executes. A GTM trigger or consent change affects its own tag, while the page's direct embed needs separate verification. HubSpot warns against multiple installs, so check actual network and page-view counts before attributing duplicate data to either source. This snapshot covers HTML and GTM configuration. Browser execution, production markup, and HubSpot account settings were outside the snapshot. [HubSpot installation guidance](https://knowledge.hubspot.com/reports/install-the-hubspot-tracking-code), [HubSpot verification steps](https://knowledge.hubspot.com/reports/how-do-i-know-if-my-hubspot-tracking-code-is-working).

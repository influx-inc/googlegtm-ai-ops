# Cal.com and HubSpot baseline

Read-only checks on 26 November 2026.

## GTM and HubSpot configuration

| Check | Observed |
| --- | --- |
| GTM target | The local GTM MCP returned Influx account `6000908850`, `influx.com` container `31052321` (`GTM-WJG2TZX`), and one workspace, Default Workspace `105`. The live version was `102`. |
| Workspace status | Three additions and zero merge conflicts. The additions were a Google Analytics tag (`137`) and two Google tag configurations (`138`, `139`). None modified the HubSpot loader. |
| HubSpot tag `26` | **HubSpot Tracking Code** was identical in the workspace and live version for its HTML, triggers, firing limit, and consent settings. It was an enabled Custom HTML tag on **All Pages** (`2147479553`), once per event, with no blocking, setup, or teardown tags. The HTML loaded `js.hs-scripts.com` without a consent guard. Additional consent checks were `notSet`. |
| HubSpot portal | The connected HubSpot account was **Influx**. Its Tracking Code settings displayed an embed whose Hub ID matched the workspace and live GTM loader and the loader elements observed on both pages. |

## Browser observations

Playwright Chromium opened both pages directly using live GTM. The browser checks used fresh preferences and intercepted HubSpot page-view collection. Each page returned HTTP `200` and loaded the Influx container.

| Observation | `http://localhost:4567/` | Hosted `/team/influx/meet-with-influx` |
| --- | --- | --- |
| HubSpot loader | Two matching script elements. One loader request returned `200`, initiated by the HTML parser. | One matching script element. One loader request returned `200`, initiated by Influx GTM. |
| HubSpot tracker | The analytics and banner scripts both returned `200`. One page-view pixel attempt was blocked by the test. | The analytics and banner scripts both returned `200`. One page-view pixel attempt was blocked by the test. |
| Initial HubSpot callback | The callback reported `allowed: true` and `analytics: true` on the tested load. | Same callback. |
| Analytics cookies | `hubspotutk`, `__hstc`, `__hssc`, and `__hssrc` appeared. | The same cookie names appeared. |
| Google consent state | The container diagnostics reported implicit `analytics_storage` and `ad_storage`. The data layer contained a `nextroll-consent` event and no explicit Google consent default or update was observed. | The same implicit storage states. No Google consent default, update, or consent-related data-layer event was observed. |

On localhost, the two script elements resulted in one observed loader request and one page-view attempt on the tested load. On Cal.com, the loader and tracker ran without visitor interaction. These initial callback results cover only the tested browser loads.

This baseline used network and configuration inspection against the live container. Tag Assistant workspace Preview and downstream delivery were outside the check. The headless test session and its processes were verified closed, and the portal settings tabs were closed.

[GTM consent settings reference](https://support.google.com/tagmanager/answer/10718549) · [HubSpot consent banner API](https://developers.hubspot.com/docs/api-reference/latest/account/settings/consent-banner/consent-banner-api)

# Hosted booking field evidence

On 26 November 2026, Playwright opened the hosted **Meet with Influx** form. The active form had one submit button, **Confirm**, and three named, required contact controls. A button click and an Enter press on Confirm each produced one JSON `POST /api/book/event`. Browser routing aborted both requests before they reached Cal.com. Synthetic values matched the following string fields in both request bodies.

| Answer | Control | JSON key |
| --- | --- | --- |
| Your name | `input[type=text][name=name]` | `responses.name` |
| Email address | `input[type=email][name=email]` | `responses.email` |
| Company Name | `input[type=text][name=company]` | `responses.company` |

Confirm that the browser can match these fields to a new booking and that the associated signal exposes a booking identifier. The blocked requests provide the submitted values and endpoint for correlation work. The task-owned browser session and its processes were verified closed.

The Influx portal's HubSpot tracker accepts an identity object and serializes its keys into tracking requests. This supports testing `company` alongside `email`, `firstname`, and `lastname`. The approved HubSpot delivery check must verify that Company name is stored on the contact. [HubSpot visitor identification](https://developers.hubspot.com/docs/api-reference/latest/account/settings/tracking-code/identify) · [Default contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties)

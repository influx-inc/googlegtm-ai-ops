# Live booking confirmation and HubSpot delivery

One approved **Meet with Influx** booking was created on 26 November 2026 for 6:00 pm Australia/Melbourne. The test opened the hosted event directly. The Cal.com link found on the localhost homepage opened the separate **Influx Discovery Call** event, so this check did not establish the cross-domain journey. The test used the live `GTM-WJG2TZX` container and made no workspace changes.

## Confirmation signal

| Check | Result |
| --- | --- |
| Booking request | One `fetch` `POST /api/book/event` carried the approved name, email, and company in `responses`. Cal.com returned HTTP `200`, `status: ACCEPTED`, a nonempty `uid`, and matching `responses.name`, `responses.email`, and `responses.company`. |
| Browser and data layer | The page navigated to `/booking/<uid>` in the same document and showed the scheduled meeting. Cal.com pushed `bookingSuccessful` and `bookingSuccessfulV2` into the existing data layer. No corresponding same-origin window message was observed. |
| Correlation | The deployed Cal.com booker code passes the booking response as `data.booking` on `bookingSuccessful`. That gives GTM `data.booking.uid`, `data.booking.status`, and the three values under `data.booking.responses` on the same event. The V2 event carries a reduced payload without the responses. |
| Negative cases | Reloading the confirmation and navigating back and forward produced no new booking event. The deployed booker emits separate reschedule and dry-run event names. No live reschedule was performed. Item 2 stopped the failed requests in the browser. |

For GTM, restrict the listener to this hosted event type and the exact `bookingSuccessful` event. Require `data.confirmed === true`, `data.booking.status === 'ACCEPTED'`, a nonempty `data.booking.uid`, and a valid set of the three contact fields. Exclude payment-pending, dry-run, and rescheduled bookings and handle each `uid` once. Read the existing event in memory and keep its values out of the project event. [Cal.com hosted booker script](https://cal.com/_next/static/chunks/3myojl6v5ys5j.js)

## HubSpot result

The authorized browser check blocked the automatic forms collector and allowed one identified tracking request after the booking confirmed. Its identity included only `email`, `firstname`, `lastname`, and `company`. HubSpot returned HTTP `200` for that request.

An exact email lookup returned one contact. The contact had the approved email and company, the full submitted name in First name, and the submitted surname in Last name. HubSpot showed record source **Integration**, with Cal.com in the record source detail. The follow-up lookup still showed zero tracked page views, no last analytics activity, and Offline for both traffic sources. The test established contact creation by the existing Cal.com integration. It did not establish attribution or whether the tracker wrote the contact properties.

The task-owned browser session and its processes were verified closed. The approved test booking remains scheduled.

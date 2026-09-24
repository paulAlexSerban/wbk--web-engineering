Treat this as a conflict metric, and keep paging for real database failures. A `23505` on `products_sku_key` means two creates raced on the same SKU. The database did its job. The log is an `error` with status 500, so every error-rate panel and any future alert on `level=error` counts a normal collision as an outage.

## Classify it before you alert on it

Return **409** for unique violations (`23505`) and foreign-key violations (`23503`). Let `pino-http` record that at **warn**. Put a stable reason on the completion line, for example `reason: "unique_violation"`, plus `err.code` and `err.constraint`.

Keep these at **error** and status 500, and page on them:

| `err.code` | Meaning |
|---|---|
| `08006`, `57P01`, `08001` | Connection loss or the server shutting down |
| `53300` | Too many connections |
| `40P01`, `40001` | Deadlock or serialization failure, and only when the rate stays high |
| no code, or a driver error | Pool, timeout, or a bug |

`err.type` is `DatabaseError` for all of those. The dashboard panels that group by `err.type` will draw this collision on the same series as a database outage. Group by `err.code`, and use `err.constraint` when you need the column. Both sets are small, so they are safe to extract in the query. Leave `detail` off the line: this one already stored `Key (sku)=(SKU-IE-614) already exists.` in Loki.

`route` on this line is `"/"`, so a failing-routes panel cannot tell `POST /api/products` from anything else. The route template has to be fixed or the conflict series has nothing to attach to.

## What to graph

Two series, split on purpose:

- **Server errors:** `level=error` after `23505` and `23503` are no longer in that stream. This is the availability signal.
- **SKU conflicts:** count of `err.code="23505"` and `err.constraint="products_sku_key"` on `POST /api/products`, next to the count of `201` responses on that same route.

The number that tells you the generator is too predictable is the ratio:

`conflicts / (conflicts + successful creates)` over 15 minutes.

One collision is ordinary. A ratio that climbs as create traffic climbs is the birthday-problem signal, and it shows up before users are broadly failing. A single client retrying one SKU shows up as a short burst. A weak generator shows up as a steady ratio.

## What to alert on

There are no alert rules in this repo today. Loki’s rules directory is empty, and the Grafana dashboard only charts `level=~"error|fatal"`.

Add two alerts, with different severity:

- **Page** when the server-error rate on `api-service` stays above a small threshold for a few minutes. Exclude `23505` and `23503`. A single collision must not fire this.
- **Ticket, do not page** when the SKU conflict ratio on `POST /api/products` stays above something like 1% for 15 minutes. That is the “increase the randomness” alarm, aimed at the feature, not at on-call.

Alert on the ratio or on a rate, and attach `constraint` and `route` to the notification. Alerting on the raw `error` count will fire for this line as it is written today, and after a few of those everyone will mute it.
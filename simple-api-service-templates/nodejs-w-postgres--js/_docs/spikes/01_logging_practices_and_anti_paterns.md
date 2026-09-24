The logger setup is the right stack. The route logs are not. Most of them are duplicate narration, a few of them are wrong, and one of them crashes the handler.

## What is actually in good shape

`pino` plus `pino-http` is the correct choice for this service. Logs are JSON, `level` is a string (`info`, `warn`, `error`) so Alloy can promote it to a Loki label, and `service` / `env` sit on every line. Request IDs honor an incoming `x-request-id` and otherwise mint a UUID. `customLogLevel` maps 4xx to `warn` and 5xx to `error`. Routes use `res.log`, so the request id stays attached. The error handler passes `{ err }`, which is the key Pino serializes into `type`, `message`, and `stack`. Authorization and cookie headers are redacted.

That foundation matches the Alloy pipeline in `observability/alloy/config.alloy`. Keep it. Almost everything below is about what gets written on top of it.

## The route logs are the problem

A successful `GET /api/customers/:id` writes four lines:

1. `"listing customer by id"` before the id is validated
2. `"customer found"`
3. `"listing customer by id"` again
4. the `pino-http` completion line, which already has method, url, status, `responseTime`, and `reqId`

The first three add no field the access log does not already have, except a sentence. The same pattern is copy-pasted across customers, products, orders, and order items, and the sentences do not even agree with each other. Products says `"product found"` and stops. Customers says `"customer found"` and then logs the original message again. Orders logs `"listing order by id"` for both the attempt and the success. `hello.js` logs `"hello world"` for every verb.

Those lines also fire before the outcome is known. `"listing order items by order id"` is written, then the id is rejected. The info line is a lie about a request that never listed anything.

`pino-http` already emits one line per request. A second line is justified only when it carries something that completion line cannot: a domain id, a stable failure reason, a downstream call, a slow query. `"listing products"` is not that.

This also wrecks the Grafana error ratio. That panel divides error lines by all lines. Every 500 is logged twice (handler plus access log), and every success is logged three or four times, so the percentage is a ratio of log lines, not of requests.

## A logging statement breaks product creation

```49:50:backend/apis/api-service/src/routes/products.js
    res.log.info({sku, name, unit_price_cents}, "creating product");
    const { sku, name, unit_price_cents } = req.body;
```

`sku`, `name`, and `unit_price_cents` are used before they are declared. That throws `ReferenceError` on every `POST /api/products`, the error handler turns it into a 500, and the validation branch under it never runs. The log was added to record the create, and it made the create impossible.

## Errors are logged twice and still not usefully

`errorHandler` logs `err.message` as the message, then `pino-http` logs the 500 again. The handler line has the stack. The access line usually does not, because the error is never assigned to `res.err`, which is how `pino-http` picks an error up onto the completion log.

The dashboard then groups failures by `err.type`. For a normal `Error` that field is the string `"Error"`. Postgres failures put the useful value in `err.code` (`23505`, `23503`), and nothing maps that code onto the log. So the "top errors" panel collapses to `unknown` or `Error`.

There is also no process-level logger. `bin/www.js` reports `EACCES` and `EADDRINUSE` with `console.error`, and "listening" goes through the `debug` package, which stays silent unless `DEBUG` is set. Startup success never appears in Loki. Startup failure is plain text, so the Alloy JSON stage does not label it.

The database pool has no `pool.on('error')` handler. Idle-client failures and connection loss disappear until a request happens to throw.

## The route field on the access log does not identify the route

```16:16:backend/apis/api-service/src/app.js
  customProps: req => ({ route: req.route?.path }),
```

On a router mounted at `/api/customers`, `req.route.path` is `/:id` or `/`. `GET /api/customers/:id`, `GET /api/products/:id`, and `GET /health` all become `/:id` or `/`. The dashboard's "top routes" panel cannot tell them apart. The low-cardinality value you want is the template, including the mount: ``${req.baseUrl}${req.route.path}``, which stays `/api/customers/:id` and does not turn raw ids into Loki labels.

## Health checks will dominate the stream

Compose hits `/health` every 5 seconds. The handler logs `"health check"` at info, then `pino-http` logs the 200 at info. That is about 17,000 lines a day before any real traffic. Health probes should be ignored in `autoLogging`, or logged at `debug` / `silent`.

## Redaction is a start, not a policy

`req.headers.authorization` and `req.headers.cookie` are covered. `pino-http` still serializes the full URL, query string, and the rest of the headers on every completion line. A token or email in a query string is stored in Loki. Passwords are not logged today, which is luck: no route passes `req.body` to the logger, and the customer routes never log `email` or `password`. There is no redact path for `req.body.password`, `*.password`, or `*.password_hash`, so the first person who logs the body "for debugging" ships credentials.

`logger.js` also sets `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` at import time and then never attaches a transport. Nothing in `package.json` exports logs over OTLP. Alloy tails container stdout. Those two lines imply a pipeline that does not exist.

## What to do instead

One completion line per request, from `pino-http`. Put extra context on that line, do not emit a twin.

- Set `autoLogging.ignore` for `/health`.
- Set `route` to ``${req.baseUrl}${req.route?.path ?? ''}`` inside `customProps`.
- For a 4xx, set something like `res.locals.reason = 'invalid_id'` and read it from `customProps`. One warn line then carries `route`, status, `reqId`, and a stable reason code. Stop logging `"invalid customer id"` as its own line.
- For a 500, assign `res.err = err` in the error handler and do not also call `res.log.error`. Add a serializer that copies `err.code` for `pg` errors.
- Log a business line only for something the access log cannot see: customer created with `{ customerId }`, product deleted blocked by order items with `{ productId, orderItemCount }`. No passwords, no password hashes, no full bodies, no "about to…" lines.
- Use stable messages or an `event` field (`customer.created`, `product.conflict`), not prose that drifts per file.
- Log startup and listen-errors through the same Pino instance. Register `pool.on('error')`, `uncaughtException`, and `unhandledRejection` on that instance too.
- Extend `redact` to `req.body.password`, `req.body.password_hash`, `res.headers['set-cookie']`, and any query token you might add later.
- Delete the OTEL endpoint defaults until a real transport is installed. If stdout-to-Alloy is the design, say so in the logger file and stop setting exporter env vars.
- In development, pipe stdout through `pino-pretty`. Do not pretty-print in the process that Alloy scrapes.


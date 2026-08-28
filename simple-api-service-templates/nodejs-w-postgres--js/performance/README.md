# Performance tests

k6 scripts that exercise the same customer / product / order paths as [notebooks/](../notebooks/README.md). Notebooks are for contract checks; these are for **smoke and load**.

Customers own signup. Products are a catalog (`sku`, `name`, `unit_price_cents`). Line items reference `product_id` and snapshot the unit price. `/api/hello` is not part of these flows.

Python `Faker` cannot run inside k6. [k6/lib/fake.js](k6/lib/fake.js) generates unique emails, passwords, SKUs, and product names (VU + iteration + timestamp) so parallel VUs do not collide on unique columns.

Write flows **create catalog products before** attaching order-items, and **delete products after** the owning customer (and cascaded order-items) is gone, so `ON DELETE RESTRICT` does not block cleanup.

## Scripts

| Script                     | What it does                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| [k6/smoke.js](k6/smoke.js) | One VU per flow, 1–2 iterations. Tight p95 / error-rate / check thresholds.                  |
| [k6/load.js](k6/load.js)   | Staged ramp (~1m50s). Checkout and signup are heavier; products/bulk are lighter; errors stay at 1 VU. |

Shared flows in [k6/lib/flows.js](k6/lib/flows.js):

| Scenario   | Mirrors | Iteration                                                                                                      |
| ---------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `products` | 00      | Create catalog → list → get → PUT → PATCH → 409 while referenced → delete after cascade                        |
| `signup`   | 01      | Create → list → get → PUT → PATCH → empty orders → delete                                                      |
| `checkout` | 02      | Signup → order → catalog products + line items → pending totals → ship → deliver → drop from totals → cleanup  |
| `bulk`     | 03      | 2 customers × 1 order × 4 catalog products/items → verify counts/totals → delete                               |
| `errors`   | 04      | 400/404/409 paths, then cascade delete                                                                         |

Each write iteration **owns and deletes** its customer and catalog products so load does not unbounded-grow Postgres. Expected 4xx/409 on the error and product flows do not count as `http_req_failed`.

## How to run

The API must already be up (`make compose_up` from the project root):

```bash
make perf_smoke
make perf_load
```

k6 is a one-shot `compose run` (it is not started with the stack). Inside the container, `API_BASE_URL` is `http://api-service:5000/api`.

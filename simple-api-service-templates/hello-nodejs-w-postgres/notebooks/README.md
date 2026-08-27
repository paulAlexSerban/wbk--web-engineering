# Notebooks

HTTP notebooks that walk every client / product / order path the API currently exposes. They are for **manual or automated contract checks**, not load testing (use k6 for that).

Customers own signup (`email` + `password`). Products are a catalog (`sku`, `name`, `unit_price_cents`). Order line items reference a product by `product_id` and snapshot `unit_price_cents` at purchase time.

## Scope

| Notebook                                                             | Path it covers                                                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [00_product_catalog_flow.ipynb](00_product_catalog_flow.ipynb)       | Faker catalog signups, list / get / PUT / PATCH, then 409 while an order-item still references the product, then delete after the line is gone. |
| [01_customer_signup_flow.ipynb](01_customer_signup_flow.ipynb)       | Several Faker signups, then list / get / PUT / PATCH / empty orders / delete. Asserts `password` and `password_hash` never appear in responses. |
| [02_order_checkout_flow.ipynb](02_order_checkout_flow.ipynb)         | One customer: create catalog products → order → line items → pending totals → `pending → shipped → delivered` → totals drop the order.          |
| [03_bulk_products_seed.ipynb](03_bulk_products_seed.ipynb)           | Several customers and orders, then many Faker catalog products sold as line items; checks item counts and pending totals.                       |
| [04_cleanup_and_error_paths.ipynb](04_cleanup_and_error_paths.ipynb) | 400s (bad id, missing fields, invalid status), 404s, product 409, explicit teardown, and customer cascade delete.                               |
| [requests.ipynb](requests.ipynb)                                     | Small scratch pad for one-off `GET`/`POST` against the same `/api` routes.                                                                      |

Out of scope: `/health`, `/api/hello` (demo-only), and k6 (`make perf_smoke` / `make perf_load`).

These notebooks **write to the live database**. Seeded rows (`alice@example.com`, catalog SKUs) are left alone; Faker rows from 00–03 stay unless you run 04 or wipe volumes.

## How to use

The API must already be up (`make compose_up` from the project root). Then start Jupyter:

```bash
make notebook_up
```

Open http://localhost:8888 (token from `JUPYTER_TOKEN` in `.env`, default `changeme`). The workdir is this folder. Run each numbered notebook **top to bottom**.

Inside the Jupyter container, `API_BASE_URL` is already `http://api-service:5000/api`. From your host (without Docker Jupyter):

```bash
export API_BASE_URL=http://localhost:3002/api
jupyter nbconvert --to notebook --execute 00_product_catalog_flow.ipynb
```

Optional knobs (defaults in parentheses): `CATALOG_COUNT` (6), `SIGNUP_COUNT` (10), `PRODUCT_COUNT` (4), `CUSTOMER_COUNT` (5), `ORDERS_PER_CUSTOMER` (2), `TOTAL_PRODUCTS` (30).

Stop Jupyter with `make notebook_down`. Rebuild after changing [requirements.txt](requirements.txt) (`requests`, `Faker`).

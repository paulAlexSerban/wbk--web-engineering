# Hello Nodejs API

## Tech-stack
- Node.js, Express.js, PostgreSQL, Docker, Docker Compose

## Domain

Tables follow `customers` → `orders` → `order_items` ← `products`. Customers are the only identity table (email + hashed password). Products are the catalog; line items snapshot `unit_price_cents` at purchase time.

| Entity | Table | JS fields | Extra SQL fields |
| ------ | ----- | --------- | ---------------- |
| Customer | `customers` | `email`, `password` (write-only) | `id`, `password_hash`, `created_at` |
| Product | `products` | `sku`, `name`, `unit_price_cents` | `id`, `created_at` |
| Order | `orders` | `customer_id`, `status` | `id`, `created_at` |
| Order item | `order_items` | `order_id`, `product_id`, `quantity`, `unit_price_cents` | `id` |

`status` is one of `pending`, `shipped`, `delivered`. Deleting a customer cascades to orders and items. Deleting a product that still has order-items is rejected (409 / `ON DELETE RESTRICT`).

## Features

### Health

- `/health`
  - GET - Liveness check (`{ "status": "ok" }`).

### Hello API

- `/api/hello/`
  - GET - Retrieve a hello message.
  - POST - Create a hello message.
- `/api/hello/<ID>`
  - PUT - Update a hello message.
  - PATCH - Partially update a hello message.
  - DELETE - Delete a hello message.

### Customers API

- `/api/customers/`
  - GET - List customers (never returns `password_hash`).
  - POST - Create a customer (`email`, `password`).
- `/api/customers/<ID>`
  - GET - Retrieve a customer.
  - PUT - Replace a customer (`email`, `password`).
  - PATCH - Partially update a customer.
  - DELETE - Delete a customer (cascades orders and items).
- `/api/customers/<ID>/orders`
  - GET - List orders for a customer.

### Products API

- `/api/products/`
  - GET - List products.
  - POST - Create a product (`sku`, `name`, `unit_price_cents`).
- `/api/products/<ID>`
  - GET - Retrieve a product.
  - PUT - Replace a product (`sku`, `name`, `unit_price_cents`).
  - PATCH - Partially update a product.
  - DELETE - Delete a product (409 if any order-item still references it).

### Orders API

- `/api/orders/`
  - GET - List orders.
  - POST - Create an order (`customer_id`, optional `status`).
- `/api/orders/pending-totals`
  - GET - Pending orders with customer email and line-item totals.
- `/api/orders/<ID>`
  - GET - Retrieve an order.
  - PUT - Replace an order.
  - PATCH - Partially update an order.
  - DELETE - Delete an order (cascades items).
- `/api/orders/<ID>/items`
  - GET - List items for an order.

### Order items API

- `/api/order-items/`
  - GET - List order items.
  - POST - Create an order item (`order_id`, `product_id`, `quantity`, `unit_price_cents`).
- `/api/order-items/<ID>`
  - GET - Retrieve an order item.
  - PUT - Replace an order item.
  - PATCH - Partially update an order item.
  - DELETE - Delete an order item.

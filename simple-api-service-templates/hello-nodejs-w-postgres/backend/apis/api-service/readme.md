# Hello Nodejs API

## Tech-stack
- Node.js, Express.js, PostgreSQL, Docker, Docker Compose

## Domain

Tables and types follow the JS-to-PostgreSQL workbook: standalone `users`, plus `customers` → `orders` → `order_items`.

| Entity | Table | JS fields | Extra SQL fields |
| ------ | ----- | --------- | ---------------- |
| User | `users` | `username`, `password` | `id` |
| Customer | `customers` | `email` | `id`, `created_at` |
| Order | `orders` | `customer_id`, `status` | `id`, `created_at` |
| Order item | `order_items` | `order_id`, `product_sku`, `quantity`, `unit_price_cents` | `id` |

`status` is one of `pending`, `shipped`, `delivered`. Deleting a customer cascades to orders and items.

## Features

### Hello API

- `/api/hello/`
  - GET - Retrieve a hello message.
  - POST - Create a hello message.
- `/api/hello/<ID>`
  - PUT - Update a hello message.
  - PATCH - Partially update a hello message.
  - DELETE - Delete a hello message.

### Users API

- `/api/users/`
  - GET - List users.
  - POST - Create a user (`username`, `password`).
- `/api/users/<ID>`
  - GET - Retrieve a user.
  - PUT - Replace a user.
  - PATCH - Partially update a user.
  - DELETE - Delete a user.

### Customers API

- `/api/customers/`
  - GET - List customers.
  - POST - Create a customer (`email`).
- `/api/customers/<ID>`
  - GET - Retrieve a customer.
  - PUT - Replace a customer.
  - PATCH - Partially update a customer.
  - DELETE - Delete a customer (cascades orders and items).
- `/api/customers/<ID>/orders`
  - GET - List orders for a customer.

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
  - POST - Create an order item (`order_id`, `product_sku`, `quantity`, `unit_price_cents`).
- `/api/order-items/<ID>`
  - GET - Retrieve an order item.
  - PUT - Replace an order item.
  - PATCH - Partially update an order item.
  - DELETE - Delete an order item.

import { check, sleep } from 'k6';
import { del, expectStatus, get, json, patch, post, put } from './api.js';
import { email, orderItem, password, product as fakeProduct } from './fake.js';

function noPasswordLeak(payload) {
  if (payload === undefined || payload === null) {
    return false;
  }
  if (Array.isArray(payload)) {
    return payload.every(noPasswordLeak);
  }
  return !Object.prototype.hasOwnProperty.call(payload, 'password')
    && !Object.prototype.hasOwnProperty.call(payload, 'password_hash');
}

function totalCents(items) {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0);
}

function findPendingRow(rows, orderId) {
  if (!Array.isArray(rows)) {
    return undefined;
  }
  return rows.find((row) => row.order_id === orderId);
}

function createCustomer() {
  const res = post('/customers', { email: email(), password: password() });
  const body = json(res);
  check(res, {
    'signup status 201': (r) => r.status === 201,
    'signup has id': () => body && body.id,
    'signup hides password': () => noPasswordLeak(body),
  });
  return body;
}

function createProduct() {
  const res = post('/products', fakeProduct());
  const body = json(res);
  check(res, {
    'create product 201': (r) => r.status === 201,
    'product has id': () => body && body.id,
  });
  return body;
}

function deleteCustomer(id) {
  if (!id) {
    return;
  }
  const res = del(`/customers/${id}`);
  check(res, { 'delete customer 200': (r) => r.status === 200 });
}

function deleteProduct(id) {
  if (!id) {
    return;
  }
  const res = del(`/products/${id}`);
  check(res, { 'delete product 200': (r) => r.status === 200 });
}

export function productFlow() {
  const created = createProduct();
  if (!created || !created.id) {
    sleep(1);
    return;
  }

  const listed = get('/products');
  const listedBody = json(listed);
  check(listed, {
    'list products 200': (r) => r.status === 200,
    'list includes product': () =>
      Array.isArray(listedBody) && listedBody.some((p) => p.id === created.id),
  });

  const fetched = get(`/products/${created.id}`);
  const fetchedBody = json(fetched);
  check(fetched, {
    'get product 200': (r) => r.status === 200,
    'get sku matches': () => fetchedBody && fetchedBody.sku === created.sku,
  });

  const putPayload = fakeProduct();
  const putRes = put(`/products/${created.id}`, putPayload);
  const putBody = json(putRes);
  check(putRes, {
    'put product 200': (r) => r.status === 200,
    'put sku matches': () => putBody && putBody.sku === putPayload.sku,
  });

  const patchName = `${putPayload.name} Deluxe`;
  const patchRes = patch(`/products/${created.id}`, { name: patchName });
  const patchBody = json(patchRes);
  check(patchRes, {
    'patch product 200': (r) => r.status === 200,
    'patch name matches': () => patchBody && patchBody.name === patchName,
  });

  const customer = createCustomer();
  if (!customer || !customer.id) {
    deleteProduct(created.id);
    sleep(1);
    return;
  }

  const orderRes = post('/orders', { customer_id: customer.id });
  const order = json(orderRes);
  check(orderRes, { 'product-flow create order 201': (r) => r.status === 201 });

  if (order && order.id) {
    const itemRes = post(
      '/order-items',
      orderItem(order.id, created.id, created.unit_price_cents),
    );
    check(itemRes, { 'product-flow create item 201': (r) => r.status === 201 });
  }

  const blocked = del(`/products/${created.id}`, expectStatus(409));
  check(blocked, { 'delete referenced product 409': (r) => r.status === 409 });

  deleteCustomer(customer.id);
  deleteProduct(created.id);

  const gone = get(`/products/${created.id}`, expectStatus(404));
  check(gone, { 'deleted product 404': (r) => r.status === 404 });
  sleep(1);
}

export function signupFlow() {
  const created = createCustomer();
  if (!created || !created.id) {
    sleep(1);
    return;
  }

  const listed = get('/customers');
  const listedBody = json(listed);
  check(listed, {
    'list customers 200': (r) => r.status === 200,
    'list includes signup': () =>
      Array.isArray(listedBody) && listedBody.some((c) => c.id === created.id),
    'list hides password': () => noPasswordLeak(listedBody),
  });

  const fetched = get(`/customers/${created.id}`);
  const fetchedBody = json(fetched);
  check(fetched, {
    'get customer 200': (r) => r.status === 200,
    'get email matches': () => fetchedBody && fetchedBody.email === created.email,
  });

  const putRes = put(`/customers/${created.id}`, {
    email: email(),
    password: password(),
  });
  const putBody = json(putRes);
  check(putRes, {
    'put customer 200': (r) => r.status === 200,
    'put hides password': () => noPasswordLeak(putBody),
  });

  const patchRes = patch(`/customers/${created.id}`, { email: email() });
  const patchBody = json(patchRes);
  check(patchRes, {
    'patch customer 200': (r) => r.status === 200,
    'patch hides password': () => noPasswordLeak(patchBody),
  });

  const orders = get(`/customers/${created.id}/orders`);
  check(orders, {
    'new customer has no orders': (r) => r.status === 200 && Array.isArray(json(r)) && json(r).length === 0,
  });

  deleteCustomer(created.id);
  const gone = get(`/customers/${created.id}`, expectStatus(404));
  check(gone, { 'deleted customer 404': (r) => r.status === 404 });
  sleep(1);
}

export function checkoutFlow() {
  const customer = createCustomer();
  if (!customer || !customer.id) {
    sleep(0.5);
    return;
  }

  const orderRes = post('/orders', { customer_id: customer.id });
  const order = json(orderRes);
  check(orderRes, {
    'create order 201': (r) => r.status === 201,
    'order starts pending': () => order && order.status === 'pending',
  });
  if (!order || !order.id) {
    deleteCustomer(customer.id);
    sleep(0.5);
    return;
  }

  const products = [];
  const items = [];
  const productCount = 3 + Math.floor(Math.random() * 2);
  for (let i = 0; i < productCount; i += 1) {
    const catalog = createProduct();
    if (!catalog || !catalog.id) {
      continue;
    }
    products.push(catalog);
    const itemRes = post(
      '/order-items',
      orderItem(order.id, catalog.id, catalog.unit_price_cents),
    );
    const item = json(itemRes);
    check(itemRes, { 'add order item 201': (r) => r.status === 201 });
    if (item) {
      items.push(item);
    }
  }

  const orderGet = get(`/orders/${order.id}`);
  check(orderGet, { 'get order 200': (r) => r.status === 200 });

  const itemsGet = get(`/orders/${order.id}/items`);
  const itemsBody = json(itemsGet);
  check(itemsGet, {
    'list order items 200': (r) => r.status === 200,
    'order item count matches': () => Array.isArray(itemsBody) && itemsBody.length === items.length,
  });

  const expected = totalCents(items);
  const pendingRes = get('/orders/pending-totals');
  const pendingRow = findPendingRow(json(pendingRes), order.id);
  check(pendingRes, {
    'pending-totals 200': (r) => r.status === 200,
    'pending-totals includes order': () => pendingRow !== undefined,
    'pending-totals amount matches': () =>
      pendingRow !== undefined && Number(pendingRow.total_cents) === expected,
  });

  const customerOrders = get(`/customers/${customer.id}/orders`);
  check(customerOrders, {
    'customer orders includes checkout': (r) =>
      r.status === 200 && Array.isArray(json(r)) && json(r).some((o) => o.id === order.id),
  });

  const shipped = patch(`/orders/${order.id}`, { status: 'shipped' });
  check(shipped, {
    'ship order 200': (r) => r.status === 200 && json(r) && json(r).status === 'shipped',
  });

  const delivered = patch(`/orders/${order.id}`, { status: 'delivered' });
  check(delivered, {
    'deliver order 200': (r) => r.status === 200 && json(r) && json(r).status === 'delivered',
  });

  const pendingAfter = get('/orders/pending-totals');
  check(pendingAfter, {
    'delivered order leaves pending-totals': (r) =>
      r.status === 200 && findPendingRow(json(r), order.id) === undefined,
  });

  deleteCustomer(customer.id);
  products.forEach((p) => deleteProduct(p.id));
  sleep(0.5);
}

export function bulkFlow() {
  const created = [];

  for (let c = 0; c < 2; c += 1) {
    const customer = createCustomer();
    if (!customer || !customer.id) {
      continue;
    }

    const orderRes = post('/orders', { customer_id: customer.id, status: 'pending' });
    const order = json(orderRes);
    check(orderRes, { 'bulk create order 201': (r) => r.status === 201 });
    if (!order || !order.id) {
      created.push({ customerId: customer.id, orderId: null, items: [], products: [] });
      continue;
    }

    const items = [];
    const products = [];
    for (let i = 0; i < 4; i += 1) {
      const catalog = createProduct();
      if (!catalog || !catalog.id) {
        continue;
      }
      products.push(catalog);
      const itemRes = post(
        '/order-items',
        orderItem(order.id, catalog.id, catalog.unit_price_cents),
      );
      const item = json(itemRes);
      check(itemRes, { 'bulk add item 201': (r) => r.status === 201 });
      if (item) {
        items.push(item);
      }
    }

    created.push({ customerId: customer.id, orderId: order.id, items, products });
  }

  const pendingRes = get('/orders/pending-totals');
  const pendingBody = json(pendingRes);
  check(pendingRes, { 'bulk pending-totals 200': (r) => r.status === 200 });

  created.forEach(({ customerId, orderId, items, products }) => {
    if (!orderId) {
      deleteCustomer(customerId);
      (products || []).forEach((p) => deleteProduct(p.id));
      return;
    }

    const itemsGet = get(`/orders/${orderId}/items`);
    const itemsBody = json(itemsGet);
    check(itemsGet, {
      'bulk item count matches': (r) =>
        r.status === 200 && Array.isArray(itemsBody) && itemsBody.length === items.length,
    });

    const expected = totalCents(items);
    const row = findPendingRow(pendingBody, orderId);
    check(pendingRes, {
      'bulk pending total matches': () =>
        row !== undefined && Number(row.total_cents) === expected,
    });

    deleteCustomer(customerId);
    products.forEach((p) => deleteProduct(p.id));
  });

  sleep(0.5);
}

export function errorFlow() {
  ['customers', 'products', 'orders', 'order-items'].forEach((resource) => {
    const invalid = get(`/${resource}/not-a-number`, expectStatus(400));
    check(invalid, { [`${resource} invalid id 400`]: (r) => r.status === 400 });

    const missing = get(`/${resource}/999999999`, expectStatus(404));
    check(missing, { [`${resource} missing id 404`]: (r) => r.status === 404 });
  });

  check(get('/customers/999999999/orders', expectStatus(404)), {
    'missing customer orders 404': (r) => r.status === 404,
  });
  check(get('/orders/999999999/items', expectStatus(404)), {
    'missing order items 404': (r) => r.status === 404,
  });

  check(post('/customers', { email: email() }, expectStatus(400)), {
    'signup missing password 400': (r) => r.status === 400,
  });
  check(post('/customers', { password: password() }, expectStatus(400)), {
    'signup missing email 400': (r) => r.status === 400,
  });
  check(post('/products', { sku: 'SKU-MISSING' }, expectStatus(400)), {
    'product missing fields 400': (r) => r.status === 400,
  });
  check(post('/orders', {}, expectStatus(400)), {
    'order missing customer_id 400': (r) => r.status === 400,
  });
  check(post('/order-items', { order_id: 1 }, expectStatus(400)), {
    'order-item missing fields 400': (r) => r.status === 400,
  });
  check(post('/orders', { customer_id: 1, status: 'not-a-real-status' }, expectStatus(400)), {
    'invalid order status 400': (r) => r.status === 400,
  });

  const customer = createCustomer();
  if (!customer || !customer.id) {
    sleep(0.5);
    return;
  }

  const catalog = createProduct();
  const orderRes = post('/orders', { customer_id: customer.id });
  const order = json(orderRes);
  check(orderRes, { 'error-flow create order 201': (r) => r.status === 201 });

  let item;
  if (order && order.id && catalog && catalog.id) {
    const itemRes = post(
      '/order-items',
      orderItem(order.id, catalog.id, catalog.unit_price_cents),
    );
    item = json(itemRes);
    check(itemRes, { 'error-flow create item 201': (r) => r.status === 201 });
  }

  if (catalog && catalog.id) {
    const blocked = del(`/products/${catalog.id}`, expectStatus(409));
    check(blocked, { 'error-flow referenced product 409': (r) => r.status === 409 });
  }

  deleteCustomer(customer.id);

  if (order && order.id) {
    check(get(`/orders/${order.id}`, expectStatus(404)), {
      'cascade deletes order': (r) => r.status === 404,
    });
  }
  if (item && item.id) {
    check(get(`/order-items/${item.id}`, expectStatus(404)), {
      'cascade deletes order-item': (r) => r.status === 404,
    });
  }
  if (catalog && catalog.id) {
    deleteProduct(catalog.id);
  }

  sleep(0.5);
}

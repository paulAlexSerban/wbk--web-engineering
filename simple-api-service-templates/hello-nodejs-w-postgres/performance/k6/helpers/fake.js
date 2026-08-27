const ADJECTIVES = [
  'WIDGET',
  'GADGET',
  'CABLE',
  'CASE',
  'BOLT',
  'LAMP',
  'GEAR',
  'CHIP',
];

const NOUNS = ['Kit', 'Pack', 'Set', 'Module', 'Bundle', 'Unit'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function uniqueToken() {
  return `${__VU}.${__ITER}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
}

export function email() {
  return `vu${__VU}.iter${__ITER}.${uniqueToken()}@loadtest.local`;
}

export function password() {
  return `Pw-${uniqueToken()}!`;
}

export function sku() {
  const n = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `SKU-${pick(ADJECTIVES)}-${n}-${uniqueToken()}`;
}

export function productName() {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

export function quantity() {
  return 1 + Math.floor(Math.random() * 5);
}

export function unitPriceCents() {
  return 199 + Math.floor(Math.random() * 9801);
}

export function product() {
  return {
    sku: sku(),
    name: productName(),
    unit_price_cents: unitPriceCents(),
  };
}

export function orderItem(orderId, productId, unitPriceCentsValue) {
  return {
    order_id: orderId,
    product_id: productId,
    quantity: quantity(),
    unit_price_cents: unitPriceCentsValue,
  };
}

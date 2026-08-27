import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.API_BASE_URL || 'http://api-service:5000/api';

export const options = {
  vus: 2,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const hello = http.get(`${BASE_URL}/hello`);
  check(hello, { 'hello status 200': (r) => r.status === 200 });

  const users = http.get(`${BASE_URL}/users`);
  check(users, { 'users status 200': (r) => r.status === 200 });

  const customers = http.get(`${BASE_URL}/customers`);
  check(customers, { 'customers status 200': (r) => r.status === 200 });

  const orders = http.get(`${BASE_URL}/orders`);
  check(orders, { 'orders status 200': (r) => r.status === 200 });

  const pending = http.get(`${BASE_URL}/orders/pending-totals`);
  check(pending, { 'pending-totals status 200': (r) => r.status === 200 });

  sleep(1);
}

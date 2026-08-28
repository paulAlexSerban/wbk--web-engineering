import { signupFlow, checkoutFlow, bulkFlow, errorFlow, productFlow } from './helpers/flows.js';

export const options = {
  scenarios: {
    products: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 2,
      exec: 'productFlow',
    },
    signup: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 2,
      exec: 'signupFlow',
    },
    checkout: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 2,
      exec: 'checkoutFlow',
    },
    bulk: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      exec: 'bulkFlow',
    },
    errors: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      exec: 'errorFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99'],
    'http_req_duration{scenario:products}': ['p(95)<500'],
    'http_req_duration{scenario:signup}': ['p(95)<500'],
    'http_req_duration{scenario:checkout}': ['p(95)<500'],
    'http_req_duration{scenario:bulk}': ['p(95)<500'],
    'http_req_duration{scenario:errors}': ['p(95)<500'],
  },
};

export { signupFlow, checkoutFlow, bulkFlow, errorFlow, productFlow };

import { signupFlow, checkoutFlow, bulkFlow, errorFlow, productFlow } from './helpers/flows.js';

export const options = {
  scenarios: {
    products: {
      executor: 'ramping-vus',
      exec: 'productFlow',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '1m', target: 2 },
        { duration: '20s', target: 0 },
      ],
    },
    signup: {
      executor: 'ramping-vus',
      exec: 'signupFlow',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 4 },
        { duration: '1m', target: 4 },
        { duration: '20s', target: 0 },
      ],
    },
    checkout: {
      executor: 'ramping-vus',
      exec: 'checkoutFlow',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '20s', target: 0 },
      ],
    },
    bulk: {
      executor: 'ramping-vus',
      exec: 'bulkFlow',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 2 },
        { duration: '1m', target: 2 },
        { duration: '20s', target: 0 },
      ],
    },
    errors: {
      executor: 'constant-vus',
      exec: 'errorFlow',
      vus: 1,
      duration: '1m50s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.95'],
    'http_req_duration{scenario:products}': ['p(95)<800'],
    'http_req_duration{scenario:signup}': ['p(95)<800'],
    'http_req_duration{scenario:checkout}': ['p(95)<800'],
    'http_req_duration{scenario:bulk}': ['p(95)<800'],
    'http_req_duration{scenario:errors}': ['p(95)<800'],
  },
};

export { signupFlow, checkoutFlow, bulkFlow, errorFlow, productFlow };

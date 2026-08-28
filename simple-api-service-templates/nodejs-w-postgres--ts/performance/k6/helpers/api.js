import http from 'k6/http';

export const BASE_URL = __ENV.API_BASE_URL || 'http://api-service:5000/api';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function withJson(params) {
  const extra = params || {};
  return {
    ...extra,
    headers: { ...JSON_HEADERS, ...(extra.headers || {}) },
  };
}

export function json(res) {
  try {
    return res.json();
  } catch (_err) {
    return undefined;
  }
}

export function get(path, params) {
  return http.get(`${BASE_URL}${path}`, params);
}

export function post(path, body, params) {
  return http.post(`${BASE_URL}${path}`, JSON.stringify(body), withJson(params));
}

export function put(path, body, params) {
  return http.put(`${BASE_URL}${path}`, JSON.stringify(body), withJson(params));
}

export function patch(path, body, params) {
  return http.patch(`${BASE_URL}${path}`, JSON.stringify(body), withJson(params));
}

export function del(path, params) {
  return http.del(`${BASE_URL}${path}`, null, params);
}

export function expectStatus(...statuses) {
  return { responseCallback: http.expectedStatuses(...statuses) };
}

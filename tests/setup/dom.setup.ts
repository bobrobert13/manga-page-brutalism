import { afterAll, afterEach, beforeAll } from 'vitest';
import { mockServer } from '../mocks/server';

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  mockServer.resetHandlers();
  localStorage.clear();
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-theme');
});

afterAll(() => mockServer.close());

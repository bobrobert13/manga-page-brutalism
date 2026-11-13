import { afterAll, afterEach, beforeAll } from 'vitest';
import { mockServer } from '../mocks/server';

beforeAll(() => mockServer.listen({ onUnhandledFrame: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

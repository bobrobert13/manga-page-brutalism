import type { APIContext } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import { useAccountService, type AccountServiceOptions } from './useAccountService';

const context = {} as APIContext;

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user_123',
    firstName: 'Guts',
    lastName: 'Reader',
    primaryEmailAddressId: 'email_primary',
    emailAddresses: [
      { id: 'email_secondary', emailAddress: 'secondary@example.test' },
      { id: 'email_primary', emailAddress: 'primary@example.test' },
    ],
    imageUrl: 'https://images.test/user.png',
    createdAt: 1_700_000_000_000,
    ...overrides,
  };
}

function setup(getUser: NonNullable<AccountServiceOptions['getUser']>) {
  return useAccountService(context, { getUser });
}

describe('useAccountService', () => {
  it('loads and maps the requested profile', async () => {
    const getUser = vi.fn().mockResolvedValue(user());

    const result = await setup(getUser).getProfile('user_123');

    expect(getUser).toHaveBeenCalledWith('user_123');
    expect(result).toEqual({
      ok: true,
      data: {
        id: 'user_123',
        firstName: 'Guts',
        lastName: 'Reader',
        primaryEmail: 'primary@example.test',
        imageUrl: 'https://images.test/user.png',
        createdAt: 1_700_000_000_000,
      },
    });
  });

  it('falls back to the first email when the primary id is unavailable', async () => {
    const getUser = vi.fn().mockResolvedValue(user({ primaryEmailAddressId: 'missing' }));

    const result = await setup(getUser).getProfile('user_123');

    expect(result.ok && result.data.primaryEmail).toBe('secondary@example.test');
  });

  it('returns a null email for a user without addresses', async () => {
    const getUser = vi
      .fn()
      .mockResolvedValue(user({ primaryEmailAddressId: null, emailAddresses: [] }));

    const result = await setup(getUser).getProfile('user_123');

    expect(result.ok && result.data.primaryEmail).toBeNull();
  });

  it('normalizes provider failures without leaking their details', async () => {
    const getUser = vi.fn().mockRejectedValue(new Error('private Clerk failure'));

    const result = await setup(getUser).getProfile('user_123');

    expect(result).toEqual({
      ok: false,
      error: {
        code: 'unavailable',
        message: 'No pudimos cargar tu perfil.',
        status: undefined,
        retryable: true,
      },
    });
  });
});

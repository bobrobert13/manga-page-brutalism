import { clerkClient } from '@clerk/astro/server';
import type { APIContext } from 'astro';
import { createServiceError } from '@/services/shared/service-error';
import { failure, success, type ServiceResult } from '@/services/shared/service-result';
import type { AccountProfile } from './account.types';

interface AccountUserRecord {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  emailAddresses: readonly { id: string; emailAddress: string }[];
  imageUrl: string;
  createdAt: number;
}

type AccountUserLoader = (userId: string) => Promise<AccountUserRecord>;

export interface AccountServiceOptions {
  getUser?: AccountUserLoader;
}

export function useAccountService(context: APIContext, options: AccountServiceOptions = {}) {
  const getUser: AccountUserLoader =
    options.getUser ?? ((userId) => clerkClient(context).users.getUser(userId));

  async function getProfile(userId: string): Promise<ServiceResult<AccountProfile>> {
    try {
      const user = await getUser(userId);
      const primaryEmail =
        user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
          ?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        null;

      return success({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        primaryEmail,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      });
    } catch {
      return failure(
        createServiceError('unavailable', 'No pudimos cargar tu perfil.', {
          retryable: true,
        })
      );
    }
  }

  return { getProfile };
}

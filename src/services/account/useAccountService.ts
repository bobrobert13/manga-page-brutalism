import { clerkClient } from '@clerk/astro/server';
import type { APIContext } from 'astro';
import { createServiceError } from '@/services/shared/service-error';
import { failure, success, type ServiceResult } from '@/services/shared/service-result';
import type { AccountProfile } from './account.types';

export function useAccountService(context: APIContext) {
  const client = clerkClient(context);

  async function getProfile(userId: string): Promise<ServiceResult<AccountProfile>> {
    try {
      const user = await client.users.getUser(userId);
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

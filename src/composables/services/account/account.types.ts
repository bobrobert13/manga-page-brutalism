export interface AccountProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmail: string | null;
  imageUrl: string;
  createdAt: number;
}

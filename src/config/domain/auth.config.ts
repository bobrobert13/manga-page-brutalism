import { ROUTES } from './routes.config';

export const AUTH_CONFIG = {
  routes: {
    signIn: ROUTES.login,
    signUp: ROUTES.register,
    resetPassword: ROUTES.resetPassword,
    account: ROUTES.account,
  },
  fallbackRedirect: ROUTES.account,
  afterSignOut: ROUTES.home,
  middlewareRoutes: [ROUTES.login, ROUTES.register, ROUTES.resetPassword, ROUTES.account],
  protectedRoutes: [ROUTES.account],
} as const;

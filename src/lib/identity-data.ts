// Pure role-based routing rules shared by the login flow and the bottom nav.
export type WorkspaceRoles = { admin: boolean; merchant: boolean; rider: boolean };

export type LoginDestination = '/admin' | '/merchant/dashboard' | '/rider/dashboard' | '/discover';
export type WorkspaceTarget = '/merchant/dashboard' | '/rider/dashboard' | '/onboarding/merchant' | '/onboarding/rider';

export function loginDestination(roles: WorkspaceRoles): LoginDestination {
  if (roles.admin) return '/admin';
  if (roles.merchant) return '/merchant/dashboard';
  if (roles.rider) return '/rider/dashboard';
  return '/discover';
}

export function workspaceTarget(roles: WorkspaceRoles | null, kind: 'merchant' | 'rider'): WorkspaceTarget {
  if (roles?.[kind]) return kind === 'merchant' ? '/merchant/dashboard' : '/rider/dashboard';
  return kind === 'merchant' ? '/onboarding/merchant' : '/onboarding/rider';
}

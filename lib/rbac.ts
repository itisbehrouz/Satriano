import { AdminRole } from '@/app/generated/prisma/client';

export function hasRole(userRoles: AdminRole[], allowedRoles: AdminRole[]): boolean {
  if (userRoles.includes('SUPER_ADMIN')) return true;
  return allowedRoles.some(role => userRoles.includes(role));
}

export function requireRole(userRoles: AdminRole[], allowedRoles: AdminRole[]): void {
  if (!hasRole(userRoles, allowedRoles)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

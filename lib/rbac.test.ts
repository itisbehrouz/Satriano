import { describe, it, expect } from 'vitest';
import { hasRole, requireRole } from './rbac';

describe('RBAC Utilities', () => {
  it('hasRole allows SUPER_ADMIN unconditionally', () => {
    expect(hasRole(['SUPER_ADMIN'], ['CATALOG_MANAGER'])).toBe(true);
  });

  it('hasRole allows if role is included', () => {
    expect(hasRole(['CATALOG_MANAGER'], ['CATALOG_MANAGER', 'ORDER_OPERATOR'])).toBe(true);
  });

  it('hasRole denies if role is missing', () => {
    expect(hasRole(['ORDER_OPERATOR'], ['CATALOG_MANAGER'])).toBe(false);
  });

  it('requireRole throws on insufficient permissions', () => {
    expect(() => requireRole(['ORDER_OPERATOR'], ['CATALOG_MANAGER'])).toThrow('Forbidden: Insufficient permissions');
  });

  it('requireRole passes on sufficient permissions', () => {
    expect(() => requireRole(['ORDER_OPERATOR'], ['ORDER_OPERATOR'])).not.toThrow();
  });
});

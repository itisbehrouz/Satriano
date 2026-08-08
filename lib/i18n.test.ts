import { describe, it, expect } from 'vitest';
import { t, formatDateForLocale, formatCurrencyForLocale, getAvailableLocales } from './i18n/index';

describe('i18n functionality', () => {
  it('should return available locales', () => {
    expect(getAvailableLocales()).toEqual(['en', 'de', 'fr', 'it', 'es']);
  });

  it('should translate keys correctly', () => {
    expect(t('en', 'configurator')).toBe('Configurator');
    expect(t('de', 'catalog')).toBe('Katalog');
    expect(t('fr', 'orders')).toBe('Commandes');
    expect(t('it', 'support')).toBe('Supporto');
    expect(t('es', 'proforma')).toBe('Proforma');
  });

  it('should fallback to key if not found', () => {
    expect(t('en', 'unknown.key')).toBe('unknown.key');
  });

  it('should format date for locale', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const result = formatDateForLocale(date, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should format currency for locale', () => {
    const amount = 1234.56;
    const formatted = formatCurrencyForLocale(amount, 'de');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});

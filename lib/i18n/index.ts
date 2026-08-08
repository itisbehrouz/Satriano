import { dictionaries, Locale } from './portal-dictionary';

export const getAvailableLocales = (): Locale[] => ['en', 'de', 'fr', 'it', 'es'];

export const t = (locale: Locale, key: string): string => {
  const dictionary = dictionaries[locale] || dictionaries['en'];
  const keys = key.split('.');
  
  let result: any = dictionary;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Fallback to key if not found
    }
  }
  
  return typeof result === 'string' ? result : key;
};

export const formatDateForLocale = (date: Date, locale: Locale): string => {
  return new Intl.DateTimeFormat(locale).format(date);
};

export const formatCurrencyForLocale = (amount: number, locale: Locale, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export type Locale = 'en' | 'de' | 'fr' | 'it' | 'es';

type Dictionary = {
  [key: string]: string | Dictionary;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    configurator: "Configurator",
    catalog: "Catalog",
    orders: "Orders",
    support: "Support",
    proforma: "Proforma",
  },
  de: {
    configurator: "Konfigurator",
    catalog: "Katalog",
    orders: "Bestellungen",
    support: "Unterstützung",
    proforma: "Proforma",
  },
  fr: {
    configurator: "Configurateur",
    catalog: "Catalogue",
    orders: "Commandes",
    support: "Support",
    proforma: "Proforma",
  },
  it: {
    configurator: "Configuratore",
    catalog: "Catalogo",
    orders: "Ordini",
    support: "Supporto",
    proforma: "Proforma",
  },
  es: {
    configurator: "Configurador",
    catalog: "Catálogo",
    orders: "Pedidos",
    support: "Soporte",
    proforma: "Proforma",
  }
};

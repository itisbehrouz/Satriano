export type AdminLanguage = "en" | "tr";

export interface AdminDictionary {
  // Header & Navigation
  consoleTitle: string;
  m2oSubTitle: string;
  searchPlaceholder: string;
  searchTooltip: string;
  orderLedger: string;
  wholesale: string;
  b2bPartners: string;
  catalogFits: string;
  telemetry: string;
  signOut: string;
  signedInAs: string;
  
  // Sub-items
  executiveDashboard: string;
  allOrdersLedger: string;
  pendingReview: string;
  proformaSent: string;
  inProduction: string;
  shippedOrders: string;
  
  supplierManagement: string;
  inventoryByCategory: string;
  pricingManager: string;
  inventoryBySize: string;
  priceOfferInbox: string;
  wholesaleOrders: string;
  
  allApplications: string;
  submittedNew: string;
  underReview: string;
  approvedPartners: string;
  rejected: string;
  
  garmentCatalog: string;
  garmentFits: string;
  regionalSizing: string;
  fabricPricing: string;
  
  telemetryCanvas: string;
  nodeTelemetry: string;
  
  // Executive Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  openOrderLedger: string;
  pendingApplications: string;
  pendingApplicationsSub: string;
  pendingProformas: string;
  pendingProformasSub: string;
  activeOrders: string;
  activeOrdersSub: string;
  revenue30Days: string;
  revenue30DaysSub: string;
  orderStatusDistribution: string;
  orderStatusDistributionSub: string;
  refresh: string;
  recentPendingActions: string;
  recentPendingActionsSub: string;
  noPendingActions: string;
  itemType: string;
  corporateClient: string;
  actionNeeded: string;
  value: string;
  submittedDate: string;
  action: string;
  review: string;
  
  // Login Guard
  executiveConsoleTitle: string;
  executiveConsoleSub: string;
  corporateAccessKey: string;
  enterSecurityKey: string;
  authenticateBtn: string;
  secNotice: string;
}

export const adminDictionary: Record<AdminLanguage, AdminDictionary> = {
  en: {
    // Header & Navigation
    consoleTitle: "Admin Console",
    m2oSubTitle: "M2O Operations Portal",
    searchPlaceholder: "Search ledger...",
    searchTooltip: "Search orders, catalog or B2B partners (⌘K)",
    orderLedger: "Order Ledger",
    wholesale: "Wholesale",
    b2bPartners: "B2B Partners",
    catalogFits: "Catalog & Fits",
    telemetry: "3D Telemetry",
    signOut: "Sign Out",
    signedInAs: "Admin User",
    
    // Sub-items
    executiveDashboard: "Executive Dashboard",
    allOrdersLedger: "All Orders Ledger",
    pendingReview: "Pending Review",
    proformaSent: "Proforma Sent",
    inProduction: "In Production",
    shippedOrders: "Shipped Orders",
    
    supplierManagement: "Supplier Management",
    inventoryByCategory: "Inventory by Category",
    pricingManager: "Pricing Manager",
    inventoryBySize: "Inventory by Size",
    priceOfferInbox: "Price Offer Inbox",
    wholesaleOrders: "Wholesale Orders",
    
    allApplications: "All Applications",
    submittedNew: "Submitted (New)",
    underReview: "Under Review",
    approvedPartners: "Approved Partners",
    rejected: "Rejected",
    
    garmentCatalog: "Garment Catalog",
    garmentFits: "Garment Fits",
    regionalSizing: "Regional Sizing",
    fabricPricing: "Fabric Pricing",
    
    telemetryCanvas: "3D Zero-G Canvas",
    nodeTelemetry: "Node Telemetry",
    
    // Executive Dashboard
    dashboardTitle: "Executive Operations Dashboard",
    dashboardSubtitle: "Real-time B2B metrics, pending spec approvals, order lifecycle analytics, and rapid navigation.",
    openOrderLedger: "Open Order Ledger",
    pendingApplications: "Pending Applications",
    pendingApplicationsSub: "Under Review & Submitted",
    pendingProformas: "Pending Proformas",
    pendingProformasSub: "Awaiting spec verification",
    activeOrders: "Active Orders",
    activeOrdersSub: "Currently in production",
    revenue30Days: "30-Day Paid Revenue",
    revenue30DaysSub: "Paid & Shipped (Last 30 Days)",
    orderStatusDistribution: "Orders by Status Distribution",
    orderStatusDistributionSub: "Live operational order volume breakdown across lifecycle stages.",
    refresh: "Refresh",
    recentPendingActions: "Recent Pending Actions",
    recentPendingActionsSub: "5 most recent items requiring executive admin review and approval.",
    noPendingActions: "No pending admin actions. All specs and applications are up to date.",
    itemType: "Item & Type",
    corporateClient: "Corporate Client",
    actionNeeded: "Action Needed",
    value: "Value",
    submittedDate: "Submitted Date",
    action: "Action",
    review: "Review",
    
    // Login Guard
    executiveConsoleTitle: "Satriano Executive Console",
    executiveConsoleSub: "Restricted access for Satriano Atelier production team & executive administrators.",
    corporateAccessKey: "Corporate Access Key",
    enterSecurityKey: "Enter security key...",
    authenticateBtn: "Authenticate & Unlock Console",
    secNotice: "Internal security audit logged. Unauthorized access attempts are monitored.",
  },
  tr: {
    // Header & Navigation
    consoleTitle: "Yönetici Konsolu",
    m2oSubTitle: "M2O Operasyon Portalı",
    searchPlaceholder: "Defterde ara...",
    searchTooltip: "Sipariş, katalog veya B2B ortaklarında ara (⌘K)",
    orderLedger: "Sipariş Defteri",
    wholesale: "Toptan Satış",
    b2bPartners: "B2B Ortakları",
    catalogFits: "Katalog ve Kalıplar",
    telemetry: "3D Telemetri",
    signOut: "Çıkış Yap",
    signedInAs: "Yönetici Kullanıcısı",
    
    // Sub-items
    executiveDashboard: "Yönetici Paneli",
    allOrdersLedger: "Tüm Sipariş Defteri",
    pendingReview: "Inceleme Bekliyor",
    proformaSent: "Proforma Gönderildi",
    inProduction: "Üretimde",
    shippedOrders: "Kargolandı",
    
    supplierManagement: "Tedarikçi Yönetimi",
    inventoryByCategory: "Kategoriye Göre Stok",
    pricingManager: "Fiyat Yönetimi",
    inventoryBySize: "Bedene Göre Stok",
    priceOfferInbox: "Fiyat Teklifi Kutusu",
    wholesaleOrders: "Toptan Siparişler",
    
    allApplications: "Tüm Başvurular",
    submittedNew: "Gönderildi (Yeni)",
    underReview: "İncelemede",
    approvedPartners: "Onaylı Ortaklar",
    rejected: "Reddedildi",
    
    garmentCatalog: "Giysi Kataloğu",
    garmentFits: "Giysi Kalıpları",
    regionalSizing: "Bölgesel Bedenler",
    fabricPricing: "Kumaş Fiyatlandırma",
    
    telemetryCanvas: "3D Sıfır-G Tuvali",
    nodeTelemetry: "Düğüm Telemetrisi",
    
    // Executive Dashboard
    dashboardTitle: "Yönetici Operasyon Paneli",
    dashboardSubtitle: "Gerçek zamanlı B2B metrikleri, onay bekleyen spesifikasyonlar ve süreç analitiği.",
    openOrderLedger: "Sipariş Defterini Aç",
    pendingApplications: "Bekleyen Başvurular",
    pendingApplicationsSub: "İncelemede ve Gönderilmiş",
    pendingProformas: "Bekleyen Proformalar",
    pendingProformasSub: "Spesifikasyon doğrulaması bekliyor",
    activeOrders: "Aktif Siparişler",
    activeOrdersSub: "Şu anda üretimde",
    revenue30Days: "30 Günlük Ödenen Gelir",
    revenue30DaysSub: "Ödenmiş ve Kargolanmış (Son 30 Gün)",
    orderStatusDistribution: "Duruma Göre Sipariş Dağılımı",
    orderStatusDistributionSub: "Yayın akışındaki sipariş hacminin yaşam döngüsü dağılımı.",
    refresh: "Yenile",
    recentPendingActions: "Son Bekleyen Eylemler",
    recentPendingActionsSub: "Yönetici onayı bekleyen en son 5 öğe.",
    noPendingActions: "Bekleyen yönetici eylemi yok. Tüm spesifikasyonlar ve başvurular güncel.",
    itemType: "Öğe ve Tür",
    corporateClient: "Kurumsal Müşteri",
    actionNeeded: "Gerekli Eylem",
    value: "Değer",
    submittedDate: "Gönderim Tarihi",
    action: "Eylem",
    review: "İncele",
    
    // Login Guard
    executiveConsoleTitle: "Satriano Yönetici Konsolu",
    executiveConsoleSub: "Satriano Atelier üretim ekibi ve üst düzey yöneticiler için kısıtlı erişim.",
    corporateAccessKey: "Kurumsal Erişim Anahtarı",
    enterSecurityKey: "Güvenlik anahtarını girin...",
    authenticateBtn: "Doğrula ve Konsol Kilidini Aç",
    secNotice: "Dahili güvenlik denetimi günlüğe kaydedildi. Yetkisiz erişim girişimleri izlenmektedir.",
  },
};

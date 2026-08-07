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

  // Order Ledger Table & Form
  orderLedgerTitle: string;
  orderLedgerSubtitle: string;
  orderId: string;
  clientCompany: string;
  fabricLine: string;
  units: string;
  targetBudget: string;
  status: string;
  submitted: string;
  actions: string;
  filterByStatus: string;
  searchOrders: string;
  generateProforma: string;
  updateStatus: string;
  cancelOrder: string;
  issueProformaBtn: string;
  proformaModalTitle: string;
  setupFee: string;
  finalUnitPrice: string;
  totalOrderPrice: string;
  close: string;
  saveChanges: string;

  // Wholesale Management
  wholesaleTitle: string;
  wholesaleSubtitle: string;
  addSupplier: string;
  supplierName: string;
  contactPerson: string;
  email: string;
  phone: string;
  moqTerms: string;
  saveSupplier: string;
  approveOffer: string;
  rejectOffer: string;
  exportCsv: string;
  offersInboxTitle: string;
  requestedPrice: string;

  // Applications Review
  applicationsTitle: string;
  applicationsSubtitle: string;
  companyName: string;
  taxVatId: string;
  country: string;
  verification: string;
  approvePartner: string;
  rejectPartner: string;
  resendVerification: string;

  // Catalog & Product Settings
  productSettingsTitle: string;
  productSettingsSubtitle: string;
  addCategory: string;
  addSubcategory: string;
  addProduct: string;
  addColor: string;
  clearPlaceholders: string;
  categoryName: string;
  subcategoryName: string;
  productName: string;
  colorName: string;
  hexCode: string;
  basePrice: string;
  sortOrder: string;

  // Buttons & Common Actions
  cancel: string;
  saving: string;
  creating: string;
  createProduct: string;
  saveProductChanges: string;
  addCategoryBtn: string;
  addSubcategoryBtn: string;
  addProductBtn: string;
  dismiss: string;
  refreshBtn: string;
  searchBtn: string;
  backToDashboard: string;
  viewCatalog: string;
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

    // Order Ledger Table & Form
    orderLedgerTitle: "M2O Custom Orders Ledger",
    orderLedgerSubtitle: "Filter custom garment specifications, issue binding proforma invoices, and track production stages.",
    orderId: "Order ID",
    clientCompany: "Client / Company",
    fabricLine: "Fabric Line",
    units: "Total Units",
    targetBudget: "Target Budget",
    status: "Status",
    submitted: "Submitted",
    actions: "Actions",
    filterByStatus: "Filter by Status",
    searchOrders: "Search orders by ID, client or company...",
    generateProforma: "Generate Proforma",
    updateStatus: "Update Status",
    cancelOrder: "Cancel Order",
    issueProformaBtn: "Issue Proforma PDF",
    proformaModalTitle: "Issue Itemized Binding Proforma PDF",
    setupFee: "Setup / Digitization Fee ($)",
    finalUnitPrice: "Final Unit Price ($)",
    totalOrderPrice: "Total Order Amount ($)",
    close: "Close",
    saveChanges: "Save Changes",

    // Wholesale Management
    wholesaleTitle: "B2B Wholesale & Inventory Management",
    wholesaleSubtitle: "Manage B2B wholesale product portfolio, supplier stock feeds, volume tier pricing, and price offers.",
    addSupplier: "Add Supplier",
    supplierName: "Supplier Name",
    contactPerson: "Contact Person",
    email: "Email Address",
    phone: "Phone Number",
    moqTerms: "MOQ Terms",
    saveSupplier: "Save Supplier Details",
    approveOffer: "Approve Offer",
    rejectOffer: "Reject Offer",
    exportCsv: "Export CSV",
    offersInboxTitle: "B2B Price Offer Inbox",
    requestedPrice: "Requested Price",

    // Applications Review
    applicationsTitle: "B2B Partner Applications",
    applicationsSubtitle: "Review corporate client applications, verify VAT/Tax credentials, and issue magic portal access.",
    companyName: "Company Name",
    taxVatId: "Tax / VAT ID",
    country: "Country",
    verification: "Verification",
    approvePartner: "Approve Partner",
    rejectPartner: "Reject Partner",
    resendVerification: "Resend Verification Email",

    // Catalog & Product Settings
    productSettingsTitle: "Garment Catalog & Technical Settings",
    productSettingsSubtitle: "Manage apparel categories, subcategories, custom fits, fabric price tiers, and colorways.",
    addCategory: "Add Category",
    addSubcategory: "Add Subcategory",
    addProduct: "Add Product",
    addColor: "Add Fabric Color",
    clearPlaceholders: "Clear Placeholders",
    categoryName: "Category Name",
    subcategoryName: "Subcategory Name",
    productName: "Product Name",
    colorName: "Color Name",
    hexCode: "HEX Code",
    basePrice: "Base Price ($)",
    sortOrder: "Sort Order",

    // Buttons & Common Actions
    cancel: "Cancel",
    saving: "Saving...",
    creating: "Creating...",
    createProduct: "Create Product",
    saveProductChanges: "Save Product Changes",
    addCategoryBtn: "Add Category",
    addSubcategoryBtn: "Add Subcategory",
    addProductBtn: "Add Product",
    dismiss: "Dismiss",
    refreshBtn: "Refresh",
    searchBtn: "Search",
    backToDashboard: "Executive Dashboard",
    viewCatalog: "View Live Wholesale Catalog",
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

    // Order Ledger Table & Form
    orderLedgerTitle: "M2O Özel Sipariş Defteri",
    orderLedgerSubtitle: "Özel giysi spesifikasyonlarını filtreleyin, bağlayıcı proforma faturaları düzenleyin ve üretim aşamalarını takip edin.",
    orderId: "Sipariş Kodu",
    clientCompany: "Müşteri / Şirket",
    fabricLine: "Kumaş Serisi",
    units: "Toplam Adet",
    targetBudget: "Hedef Bütçe",
    status: "Durum",
    submitted: "Gönderilme Tarihi",
    actions: "İşlemler",
    filterByStatus: "Duruma Göre Filtrele",
    searchOrders: "Sipariş Kodu, müşteri veya şirket adı ile ara...",
    generateProforma: "Proforma Oluştur",
    updateStatus: "Durumu Güncelle",
    cancelOrder: "Siparişi İptal Et",
    issueProformaBtn: "Proforma PDF Düzenle",
    proformaModalTitle: "Kalemlendirilmiş Bağlayıcı Proforma PDF Düzenle",
    setupFee: "Kalıp / Dijitalleştirme Ücreti ($)",
    finalUnitPrice: "Nihai Birim Fiyat ($)",
    totalOrderPrice: "Toplam Sipariş Tutarı ($)",
    close: "Kapat",
    saveChanges: "Değişiklikleri Kaydet",

    // Wholesale Management
    wholesaleTitle: "B2B Toptan Satış ve Stok Yönetimi",
    wholesaleSubtitle: "B2B toptan ürün portföyünü, tedarikçi stoklarını, kademeli fiyatlandırmayı ve fiyat tekliflerini yönetin.",
    addSupplier: "Tedarikçi Ekle",
    supplierName: "Tedarikçi Adı",
    contactPerson: "İletişim Kişisi",
    email: "E-posta Adresi",
    phone: "Telefon Numarası",
    moqTerms: "MOQ Şartları",
    saveSupplier: "Tedarikçi Bilgilerini Kaydet",
    approveOffer: "Teklifi Onayla",
    rejectOffer: "Teklifi Reddet",
    exportCsv: "CSV Dışa Aktar",
    offersInboxTitle: "B2B Fiyat Teklifi Kutusu",
    requestedPrice: "Talep Edilen Fiyat",

    // Applications Review
    applicationsTitle: "B2B Ortaklık Başvuruları",
    applicationsSubtitle: "Kurumsal müşteri başvurularını inceleyin, vergi kimlik bilgilerini doğrulayın ve portal erişimi sağlayın.",
    companyName: "Şirket Adı",
    taxVatId: "Vergi / KDV No",
    country: "Ülke",
    verification: "Doğrulama",
    approvePartner: "Ortayı Onayla",
    rejectPartner: "Başvuruyu Reddet",
    resendVerification: "Doğrulama E-postasını Tekrar Gönder",

    // Catalog & Product Settings
    productSettingsTitle: "Giysi Kataloğu ve Teknik Ayarlar",
    productSettingsSubtitle: "Giyim kategorilerini, alt kategorileri, özel kalıpları, kumaş fiyat kademelerini ve renkleri yönetin.",
    addCategory: "Kategori Ekle",
    addSubcategory: "Alt Kategori Ekle",
    addProduct: "Ürün Ekle",
    addColor: "Kumaş Rengi Ekle",
    clearPlaceholders: "Taslakları Temizle",
    categoryName: "Kategori Adı",
    subcategoryName: "Alt Kategori Adı",
    productName: "Ürün Adı",
    colorName: "Renk Adı",
    hexCode: "HEX Kodu",
    basePrice: "Taban Fiyat ($)",
    sortOrder: "Sıralama Düzeni",

    // Buttons & Common Actions
    cancel: "İptal",
    saving: "Kaydediliyor...",
    creating: "Oluşturuluyor...",
    createProduct: "Ürün Oluştur",
    saveProductChanges: "Ürün Değişikliklerini Kaydet",
    addCategoryBtn: "Kategori Ekle",
    addSubcategoryBtn: "Alt Kategori Ekle",
    addProductBtn: "Ürün Ekle",
    dismiss: "Kapat",
    refreshBtn: "Yenile",
    searchBtn: "Ara",
    backToDashboard: "Yönetici Paneli",
    viewCatalog: "Canlı Toptan Kataloğu Gör",
  },
};

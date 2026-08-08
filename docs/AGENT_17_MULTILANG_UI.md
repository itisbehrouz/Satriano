# AGENT 17 — MULTI-LANGUAGE UI INTEGRATION

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Integrate multi-language support into all UI components across client portal, web site, and admin panel. Replace hardcoded English strings with translation keys for all 6 languages (EN, DE, FR, IT, ES + TR admin).

**Scope:** Component localization, form labels, placeholders, error messages, tooltips, navigation, buttons. **Execute all phases without any confirmations.**

---

## PHASE 1: CLIENT PORTAL UI COMPONENTS

### 1.1 Update `components/Konfigurator/ConfiguratorClient.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function ConfiguratorClient() {
  const t = useTranslations();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("configurator.selectProduct")}
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">{t("common.loading")}</option>
          {/* Products will populate here */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("configurator.selectFabric")}
        </label>
        <select
          value={selectedFabric}
          onChange={(e) => setSelectedFabric(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">{t("common.loading")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("configurator.selectColor")}
        </label>
        <div className="flex gap-2">
          {/* Color swatches */}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("configurator.quantity")}
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded font-semibold">
        {t("configurator.generateProforma")}
      </button>
    </div>
  );
}
```

### 1.2 Update `components/WholesaleCatalog/WholesaleCatalogClient.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function WholesaleCatalogClient() {
  const t = useTranslations();
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("wholesale.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Filters */}
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("wholesale.filterByGender")}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">{t("common.loading")}</option>
              <option value="male">{t("wholesale.male")}</option>
              <option value="female">{t("wholesale.female")}</option>
              <option value="unisex">{t("wholesale.unisex")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("wholesale.filterByAge")}
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">{t("common.loading")}</option>
              <option value="kids">{t("wholesale.kids")}</option>
              <option value="adults">{t("wholesale.adults")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("wholesale.filterByPrice")}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            {/* Products will populate here */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 1.3 Update `components/ProductCard.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export function ProductCard({ product }: { product: any }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        
        <p className="text-gray-600 text-sm mt-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">
            {formatCurrency(product.price, locale)}
          </span>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {t("wholesale.addToCart")}
          </button>
        </div>

        {product.stock <= 5 && (
          <div className="mt-2 text-red-600 text-sm font-semibold">
            {t("wholesale.outOfStock")}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCurrency(amount: number, locale: string) {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const localeMap: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  tr: "tr-TR",
};
```

### 1.4 Update `components/Dashboard/CustomerDashboard.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function CustomerDashboard() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard.myOrders")}</h1>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 ${activeTab === "orders" ? "border-b-2 border-blue-600" : ""}`}
        >
          {t("dashboard.orderHistory")}
        </button>
        
        <button
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 ${activeTab === "tickets" ? "border-b-2 border-blue-600" : ""}`}
        >
          {t("dashboard.supportTickets")}
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 ${activeTab === "profile" ? "border-b-2 border-blue-600" : ""}`}
        >
          {t("dashboard.profile")}
        </button>
      </div>

      {activeTab === "orders" && <OrderHistory />}
      {activeTab === "tickets" && <SupportTickets />}
      {activeTab === "profile" && <ProfileSettings />}
    </div>
  );
}

function OrderHistory() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Orders will populate here */}
      <p>{t("common.loading")}</p>
    </div>
  );
}

function SupportTickets() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Tickets will populate here */}
      <p>{t("common.loading")}</p>
    </div>
  );
}

function ProfileSettings() {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Profile form */}
      <p>{t("common.loading")}</p>
    </div>
  );
}
```

---

## PHASE 2: WEB SITE UI COMPONENTS

### 2.1 Update `components/Navigation/MainNav.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";

export function MainNav() {
  const t = useTranslations();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          SATRIANO
        </Link>

        <ul className="flex gap-6">
          <li>
            <Link href="/konfigurator" className="hover:text-blue-600">
              {t("navigation.konfigurator")}
            </Link>
          </li>
          
          <li>
            <Link href="/wholesale" className="hover:text-blue-600">
              {t("navigation.wholesale")}
            </Link>
          </li>
          
          <li>
            <Link href="/dashboard" className="hover:text-blue-600">
              {t("navigation.dashboard")}
            </Link>
          </li>

          <li>
            <Link href="/support" className="hover:text-blue-600">
              {t("navigation.support")}
            </Link>
          </li>
        </ul>

        <LanguageSwitcher />
      </div>
    </nav>
  );
}
```

### 2.2 Update `components/Forms/SupportTicketForm.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function SupportTicketForm() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit to API
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">{t("support.ticketSubmitted")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("support.subject")}
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder={t("support.subjectPlaceholder")}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t("support.message")}
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder={t("support.messagePlaceholder")}
          className="w-full border rounded px-3 py-2 h-32"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {t("common.save")}
      </button>
    </form>
  );
}
```

### 2.3 Update `components/CategoryFilter.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

export function CategoryFilter({ categories }: { categories: any[] }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", categoryId);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{t("wholesale.categories")}</h3>
      
      <div className="space-y-2">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategory === cat.id}
              onChange={() => handleCategoryChange(cat.id)}
              className="rounded"
            />
            <span>{cat.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 3: ADMIN PANEL UI COMPONENTS

### 3.1 Update `components/Admin/AdminNav.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function AdminNav() {
  const t = useTranslations();
  const locale = useLocale();

  // Only show TR and EN for admin
  const adminLocales = ["tr", "en"];

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-6">
          <Link href={`/${locale}/admin`} className="font-semibold">
            {t("admin.dashboard")}
          </Link>
          
          <Link href={`/${locale}/admin/orders`} className="hover:text-gray-300">
            {t("admin.orders")}
          </Link>

          <Link href={`/${locale}/admin/products`} className="hover:text-gray-300">
            {t("admin.products")}
          </Link>

          <Link href={`/${locale}/admin/categories`} className="hover:text-gray-300">
            {t("admin.categories")}
          </Link>

          <Link href={`/${locale}/admin/analytics`} className="hover:text-gray-300">
            {t("admin.analytics")}
          </Link>
        </div>

        {/* Admin-only language switcher (TR + EN) */}
        <div className="flex gap-2">
          {adminLocales.map((lang) => (
            <Link
              key={lang}
              href={`/${lang}/admin`}
              className={`px-3 py-1 rounded ${
                locale === lang ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {lang.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

### 3.2 Update `components/Admin/OrdersTable.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export function OrdersTable({ orders }: { orders: any[] }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">{t("admin.orderId")}</th>
            <th className="border p-2 text-left">{t("admin.customer")}</th>
            <th className="border p-2 text-left">{t("admin.status")}</th>
            <th className="border p-2 text-right">{t("admin.total")}</th>
            <th className="border p-2 text-left">{t("admin.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.company.name}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                  {t(`admin.status.${order.status.toLowerCase()}`)}
                </span>
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(order.finalPriceCents / 100, locale)}
              </td>
              <td className="border p-2">
                <button className="text-blue-600 hover:underline">
                  {t("common.edit")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

function formatCurrency(amount: number, locale: string) {
  const localeMap: Record<string, string> = {
    en: "en-US",
    de: "de-DE",
    fr: "fr-FR",
    it: "it-IT",
    es: "es-ES",
    tr: "tr-TR",
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
```

### 3.3 Update `components/Admin/CategoryManager.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function CategoryManager({ categories }: { categories: any[] }) {
  const t = useTranslations();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {t("common.add")} {t("admin.category")}
      </button>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-sm text-gray-600">{cat.description}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(cat.id)}
                className="text-blue-600 hover:underline"
              >
                {t("common.edit")}
              </button>
              
              <button className="text-red-600 hover:underline">
                {t("common.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## PHASE 4: FORM LABELS & PLACEHOLDERS

### 4.1 Update translation files with form labels

Add to all `messages/*.json`:

```json
{
  "forms": {
    "email": "Email",
    "emailPlaceholder": "your@email.com",
    "password": "Password",
    "passwordPlaceholder": "••••••••",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "company": "Company Name",
    "companyPlaceholder": "Your Company Ltd.",
    "phone": "Phone Number",
    "phonePlaceholder": "+1 (555) 000-0000",
    "address": "Address",
    "addressPlaceholder": "123 Main Street",
    "city": "City",
    "cityPlaceholder": "New York",
    "zipCode": "Zip Code",
    "zipCodePlaceholder": "10001",
    "country": "Country",
    "countryPlaceholder": "United States"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordMismatch": "Passwords do not match",
    "moqNotMet": "Minimum order quantity not met",
    "outOfStock": "Product is out of stock",
    "serverError": "An error occurred. Please try again."
  },
  "success": {
    "orderCreated": "Order created successfully",
    "proformaGenerated": "Proforma generated",
    "ticketSubmitted": "Support ticket submitted",
    "profileUpdated": "Profile updated successfully"
  },
  "support": {
    "subject": "Subject",
    "subjectPlaceholder": "Describe your issue...",
    "message": "Message",
    "messagePlaceholder": "Please provide details...",
    "ticketSubmitted": "Thank you! Your support ticket has been submitted."
  }
}
```

---

## PHASE 5: ERROR HANDLING & VALIDATION MESSAGES

### 5.1 Create `lib/formValidation.ts`

```typescript
import { getTranslations } from "next-intl/server";

export async function validateEmail(email: string) {
  const t = await getTranslations();
  
  if (!email) return t("errors.required");
  if (!email.includes("@")) return t("errors.invalidEmail");
  
  return null;
}

export async function validatePassword(password: string) {
  const t = await getTranslations();
  
  if (!password) return t("errors.required");
  if (password.length < 8) return t("errors.passwordTooShort");
  
  return null;
}

export async function validateMOQ(quantity: number, moq: number) {
  const t = await getTranslations();
  
  if (quantity < moq) return t("errors.moqNotMet", { moq });
  
  return null;
}
```

---

## PHASE 6: TOOLTIPS & HELP TEXT

### 6.2 Create `components/Tooltip.tsx`

```typescript
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function Tooltip({ tooltipKey, children }: { tooltipKey: string; children: React.ReactNode }) {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {visible && (
        <div className="absolute bottom-full left-0 bg-gray-800 text-white text-sm rounded px-2 py-1 mb-2 whitespace-nowrap">
          {t(tooltipKey)}
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 7: UNIT TESTS FOR UI COMPONENTS

### 7.1 Create `tests/ui/components.test.ts`

```typescript
import { render, screen } from "@testing-library/react";
import { ConfiguratorClient } from "@/components/Konfigurator/ConfiguratorClient";
import { ProductCard } from "@/components/ProductCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

describe("UI Components - Multi-Language", () => {
  it("renders configurator with localized labels", () => {
    render(<ConfiguratorClient />);
    
    expect(screen.getByText(/select product/i)).toBeInTheDocument();
    expect(screen.getByText(/select fabric/i)).toBeInTheDocument();
  });

  it("renders product card with localized buttons", () => {
    const product = { name: "T-Shirt", price: 25, image: "" };
    render(<ProductCard product={product} />);
    
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument();
  });

  it("renders language switcher with all languages", () => {
    render(<LanguageSwitcher />);
    
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Deutsch")).toBeInTheDocument();
    expect(screen.getByText("Français")).toBeInTheDocument();
  });
});
```

---

## PHASE 8: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Client portal UI uses translation keys (no hardcoded English)
- [ ] Web site UI uses translation keys
- [ ] Admin panel shows only TR & EN language switcher
- [ ] All form labels are localized
- [ ] All form placeholders are localized
- [ ] Error messages are localized
- [ ] Success messages are localized
- [ ] Navigation labels are localized
- [ ] Buttons are localized
- [ ] Tooltips are localized
- [ ] All 6 languages render correctly
- [ ] Unit tests pass (all components)
- [ ] No hardcoded English strings remain

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 8 phases now. Do not wait for any confirmation. Report results when complete.

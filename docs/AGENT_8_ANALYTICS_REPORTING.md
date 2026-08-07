# AGENT 8 — ANALYTICS & REPORTING DASHBOARD

⚠️ **CRITICAL: EXECUTE WITHOUT ASKING FOR CONFIRMATION**

- ❌ DO NOT ask "Should I proceed?"
- ❌ DO NOT ask "Does this look good?"
- ❌ DO NOT wait for approval
- ✅ JUST EXECUTE EVERYTHING
- ✅ If error: try to fix, if unfixable, document and MOVE ON
- ✅ Report final status: what succeeded, what failed, any notes

---

**Objective:** Build comprehensive analytics and reporting dashboard with revenue tracking, order metrics, material usage, and supplier performance analytics.

**Scope:** Database views, analytics engine, dashboard API, reporting queries. **Execute all phases without any confirmations.**

---

## PHASE 1: ANALYTICS DATA LAYER

### 1.1 Create `lib/analytics.ts`

Core analytics engine:

```typescript
import { prisma } from "./prisma";

/**
 * Revenue metrics for date range
 */
export async function getRevenueMetrics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: "PAID",
    },
    select: {
      finalPriceCents: true,
      orderType: true,
      createdAt: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);
  const m2oRevenue = orders
    .filter((o) => o.orderType === "M2O")
    .reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);
  const wholesaleRevenue = orders
    .filter((o) => o.orderType === "WHOLESALE")
    .reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);

  // Daily breakdown
  const dailyRevenue = new Map<string, number>();
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().split("T")[0];
    dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + (o.finalPriceCents || 0));
  });

  return {
    totalRevenue,
    totalRevenueCents: totalRevenue,
    m2oRevenue,
    wholesaleRevenue,
    orderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    dailyRevenue: Object.fromEntries(dailyRevenue),
  };
}

/**
 * Order metrics and funnel
 */
export async function getOrderMetrics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      status: true,
      orderType: true,
      createdAt: true,
    },
  });

  // Status distribution
  const byStatus = new Map<string, number>();
  orders.forEach((o) => {
    byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1);
  });

  // Success rate (paid / created)
  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const successRate = orders.length > 0 ? (paidCount / orders.length) * 100 : 0;

  // By order type
  const m2oCount = orders.filter((o) => o.orderType === "M2O").length;
  const wholesaleCount = orders.filter((o) => o.orderType === "WHOLESALE").length;

  return {
    totalOrders: orders.length,
    statusDistribution: Object.fromEntries(byStatus),
    paidOrders: paidCount,
    successRate,
    m2oOrders: m2oCount,
    wholesaleOrders: wholesaleCount,
  };
}

/**
 * Material usage report
 */
export async function getMaterialUsageMetrics(startDate: Date, endDate: Date) {
  const lines = await prisma.orderLine.findMany({
    where: {
      order: {
        createdAt: { gte: startDate, lte: endDate },
        status: "PAID",
      },
    },
    include: {
      materials: {
        include: {
          material: true,
        },
      },
    },
  });

  const materialUsage = new Map<string, { quantity: number; orders: number }>();

  lines.forEach((line) => {
    line.materials.forEach((mat) => {
      const key = mat.material.name;
      const current = materialUsage.get(key) || { quantity: 0, orders: 0 };
      current.quantity += line.quantity;
      current.orders += 1;
      materialUsage.set(key, current);
    });
  });

  return {
    topMaterials: Array.from(materialUsage.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    totalMaterialVariants: materialUsage.size,
  };
}

/**
 * Supplier performance metrics
 */
export async function getSupplierMetrics(startDate: Date, endDate: Date) {
  const pos = await prisma.supplierPO.findMany({
    where: {
      issuDate: { gte: startDate, lte: endDate },
    },
    include: {
      supplier: true,
    },
  });

  const supplierPerformance = new Map<
    string,
    {
      poCount: number;
      totalValue: number;
      receivedCount: number;
      lateCount: number;
      avgLeadTime: number;
    }
  >();

  pos.forEach((po) => {
    const key = po.supplier.firmName;
    const current = supplierPerformance.get(key) || {
      poCount: 0,
      totalValue: 0,
      receivedCount: 0,
      lateCount: 0,
      avgLeadTime: 0,
    };

    current.poCount += 1;
    current.totalValue += po.totalAmountCents;

    if (po.status === "RECEIVED" || po.status === "PARTIALLY_RECEIVED") {
      current.receivedCount += 1;
    }

    // Check if late (received after due date)
    if (po.receivedDate && po.dueDate && po.receivedDate > po.dueDate) {
      current.lateCount += 1;
    }

    supplierPerformance.set(key, current);
  });

  return {
    totalSuppliers: supplierPerformance.size,
    suppliers: Array.from(supplierPerformance.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        onTimeRate: data.poCount > 0 ? ((data.poCount - data.lateCount) / data.poCount) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue),
  };
}

/**
 * Customer metrics
 */
export async function getCustomerMetrics(startDate: Date, endDate: Date) {
  const companies = await prisma.company.findMany({
    where: {
      orders: {
        some: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
    },
    select: {
      id: true,
      name: true,
      orders: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          finalPriceCents: true,
          status: true,
        },
      },
    },
  });

  const topCustomers = companies
    .map((c) => ({
      name: c.name,
      orderCount: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + (o.finalPriceCents || 0), 0),
      avgOrderValue: 
        c.orders.length > 0
          ? c.orders.reduce((sum, o) => sum + (o.finalPriceCents || 0), 0) / c.orders.length
          : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    activeCustomers: companies.length,
    topCustomers: topCustomers.slice(0, 10),
    totalCustomerValue: topCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
  };
}

/**
 * Production timeline metrics
 */
export async function getProductionMetrics(startDate: Date, endDate: Date) {
  const workOrders = await prisma.productionWorkOrder.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      status: true,
      totalQuantity: true,
      targetCompletionDate: true,
      actualCompletionDate: true,
    },
  });

  const statusCount = new Map<string, number>();
  let totalUnits = 0;
  let onTimeCount = 0;

  workOrders.forEach((wo) => {
    statusCount.set(wo.status, (statusCount.get(wo.status) || 0) + 1);
    totalUnits += wo.totalQuantity;

    if (wo.actualCompletionDate && wo.targetCompletionDate) {
      if (wo.actualCompletionDate <= wo.targetCompletionDate) {
        onTimeCount += 1;
      }
    }
  });

  return {
    totalWorkOrders: workOrders.length,
    totalUnitsProduced: totalUnits,
    statusDistribution: Object.fromEntries(statusCount),
    onTimeDeliveryRate: workOrders.length > 0 ? (onTimeCount / workOrders.length) * 100 : 0,
  };
}
```

---

## PHASE 2: DASHBOARD API ENDPOINTS

### 2.1 Create `app/api/admin/analytics/dashboard/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import {
  getRevenueMetrics,
  getOrderMetrics,
  getMaterialUsageMetrics,
  getSupplierMetrics,
  getCustomerMetrics,
  getProductionMetrics,
} from "@/lib/analytics";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verify(token, JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Fetch all analytics in parallel
    const [revenue, orders, materials, suppliers, customers, production] = await Promise.all([
      getRevenueMetrics(startDate, endDate),
      getOrderMetrics(startDate, endDate),
      getMaterialUsageMetrics(startDate, endDate),
      getSupplierMetrics(startDate, endDate),
      getCustomerMetrics(startDate, endDate),
      getProductionMetrics(startDate, endDate),
    ]);

    return NextResponse.json({
      period: `Last ${period} days`,
      dateRange: { startDate, endDate },
      revenue,
      orders,
      materials,
      suppliers,
      customers,
      production,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
```

### 2.2 Create `app/api/admin/analytics/export/route.ts`

Export analytics as CSV/JSON:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jose";
import {
  getRevenueMetrics,
  getOrderMetrics,
  getMaterialUsageMetrics,
  getSupplierMetrics,
} from "@/lib/analytics";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "");

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sat_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await verify(token, JWT_SECRET);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json or csv
    const period = searchParams.get("period") || "30";

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [revenue, orders, materials, suppliers] = await Promise.all([
      getRevenueMetrics(startDate, endDate),
      getOrderMetrics(startDate, endDate),
      getMaterialUsageMetrics(startDate, endDate),
      getSupplierMetrics(startDate, endDate),
    ]);

    if (format === "csv") {
      // Convert to CSV
      const csv = generateReportCSV({ revenue, orders, materials, suppliers });
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="satriano-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json({
      period: `Last ${period} days`,
      dateRange: { startDate, endDate },
      revenue,
      orders,
      materials,
      suppliers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateReportCSV(data: any): string {
  const lines = [
    "SATRIANO ANALYTICS REPORT",
    `Generated: ${new Date().toISOString()}`,
    "",
    "REVENUE SUMMARY",
    `Total Revenue,${(data.revenue.totalRevenue / 100).toFixed(2)}`,
    `M2O Revenue,${(data.revenue.m2oRevenue / 100).toFixed(2)}`,
    `Wholesale Revenue,${(data.revenue.wholesaleRevenue / 100).toFixed(2)}`,
    `Average Order Value,${(data.revenue.averageOrderValue / 100).toFixed(2)}`,
    "",
    "ORDER METRICS",
    `Total Orders,${data.orders.totalOrders}`,
    `Paid Orders,${data.orders.paidOrders}`,
    `Success Rate,${data.orders.successRate.toFixed(2)}%`,
    "",
    "TOP MATERIALS",
    "Material Name,Quantity,Orders",
  ];

  data.materials.topMaterials.forEach((m: any) => {
    lines.push(`${m.name},${m.quantity},${m.orders}`);
  });

  lines.push("");
  lines.push("SUPPLIER PERFORMANCE");
  lines.push("Supplier,POs,Total Value,On-Time Rate %");

  data.suppliers.suppliers.forEach((s: any) => {
    lines.push(`${s.name},${s.poCount},${(s.totalValue / 100).toFixed(2)},${s.onTimeRate.toFixed(2)}`);
  });

  return lines.join("\n");
}
```

---

## PHASE 3: REPORTING COMPONENTS

### 3.1 Create `components/admin/AnalyticsDashboard.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  revenue: any;
  orders: any;
  materials: any;
  suppliers: any;
  customers: any;
  production: any;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/dashboard?period=${period}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-600">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-8 p-8">
      {/* Period Selector */}
      <div className="flex gap-4">
        {[7, 30, 90, 365].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p.toString())}
            className={`px-4 py-2 rounded ${
              period === p.toString()
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p} days
          </button>
        ))}
        <a
          href={`/api/admin/analytics/export?format=csv&period=${period}`}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`$${(data.revenue.totalRevenue / 100).toFixed(2)}`}
          subtitle={`${data.orders.totalOrders} orders`}
        />
        <KPICard
          title="Success Rate"
          value={`${data.orders.successRate.toFixed(1)}%`}
          subtitle={`${data.orders.paidOrders}/${data.orders.totalOrders} paid`}
        />
        <KPICard
          title="Avg Order Value"
          value={`$${(data.revenue.averageOrderValue / 100).toFixed(2)}`}
          subtitle="Per order"
        />
        <KPICard
          title="Production On-Time"
          value={`${data.production.onTimeDeliveryRate.toFixed(1)}%`}
          subtitle={`${data.production.totalWorkOrders} work orders`}
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Revenue by Type</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>M2O Orders</span>
              <span className="font-semibold">${(data.revenue.m2oRevenue / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Wholesale</span>
              <span className="font-semibold">${(data.revenue.wholesaleRevenue / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Top Materials */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Top Materials</h3>
          <div className="mt-4 space-y-2">
            {data.materials.topMaterials.slice(0, 5).map((m: any) => (
              <div key={m.name} className="flex justify-between text-sm">
                <span>{m.name}</span>
                <span className="font-semibold">{m.quantity} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Performance */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Supplier Performance</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left">Supplier</th>
              <th className="text-right">POs</th>
              <th className="text-right">Total Value</th>
              <th className="text-right">On-Time %</th>
            </tr>
          </thead>
          <tbody>
            {data.suppliers.suppliers.slice(0, 10).map((s: any) => (
              <tr key={s.name} className="border-b hover:bg-gray-50">
                <td>{s.name}</td>
                <td className="text-right">{s.poCount}</td>
                <td className="text-right">${(s.totalValue / 100).toFixed(2)}</td>
                <td className="text-right">{s.onTimeRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ title, value, subtitle }: any) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
```

---

## PHASE 4: SCHEDULED REPORT GENERATION

### 4.1 Create `lib/reportScheduler.ts`

Automated report generation:

```typescript
import { prisma } from "./prisma";
import { getRevenueMetrics, getOrderMetrics } from "./analytics";

/**
 * Generate and email weekly report to admins
 */
export async function generateWeeklyReport(): Promise<void> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const revenue = await getRevenueMetrics(startDate, endDate);
  const orders = await getOrderMetrics(startDate, endDate);

  // TODO: Email report to admins
  console.log("Weekly Report Generated:", {
    revenue: revenue.totalRevenue,
    orders: orders.totalOrders,
  });
}

/**
 * Generate and email monthly report
 */
export async function generateMonthlyReport(): Promise<void> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);

  const revenue = await getRevenueMetrics(startDate, endDate);
  const orders = await getOrderMetrics(startDate, endDate);

  // TODO: Email report to admins
  console.log("Monthly Report Generated:", {
    revenue: revenue.totalRevenue,
    orders: orders.totalOrders,
  });
}
```

---

## PHASE 5: VALIDATION CHECKLIST

After implementation, verify:

- [ ] Analytics queries execute without errors
- [ ] Dashboard API returns correct metrics
- [ ] CSV export generates valid format
- [ ] Revenue metrics aggregate correctly
- [ ] Order success rate calculates accurately
- [ ] Supplier performance ranks by value
- [ ] Customer metrics identify top customers
- [ ] Production metrics track on-time delivery
- [ ] Dashboard components render
- [ ] Period selector filters data correctly

---

## 🎯 EXECUTION RULES (NON-NEGOTIABLE)

1. **EXECUTE WITHOUT ASKING** — Never ask "Should I continue?"
2. **ON ERRORS** — Try to fix automatically. If unfixable, document the error and skip to next phase
3. **COMPLETE ALL PHASES** — Don't stop halfway, execute everything
4. **REPORT AT END** — List what worked, what failed, any notes for morning review

---

**Status:** Execute all 5 phases now. Do not wait for any confirmation. Report results when complete.

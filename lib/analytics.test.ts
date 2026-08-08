import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRevenueMetrics, getOrderMetrics, getMaterialUsageMetrics, getSupplierPerformanceMetrics, getDashboardOverview } from './analytics';
import { prisma } from './prisma';

vi.mock('./prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
    orderLine: {
      findMany: vi.fn(),
    },
    supplier: {
      findMany: vi.fn(),
    },
  },
}));

describe('Analytics Library', () => {
  const startDate = new Date('2026-08-01');
  const endDate = new Date('2026-08-31');

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getRevenueMetrics should calculate revenue correctly', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { finalPriceCents: 10000, orderType: 'M2O', createdAt: new Date('2026-08-05') },
      { finalPriceCents: 20000, orderType: 'WHOLESALE', createdAt: new Date('2026-08-10') },
    ] as any);

    const metrics = await getRevenueMetrics(startDate, endDate);
    expect(metrics.totalRevenueCents).toBe(30000);
    expect(metrics.m2oRevenue).toBe(10000);
    expect(metrics.wholesaleRevenue).toBe(20000);
    expect(metrics.orderCount).toBe(2);
    expect(metrics.averageOrderValue).toBe(15000);
  });

  it('getOrderMetrics should calculate order funnel correctly', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([
      { status: 'PAID', orderType: 'M2O', createdAt: new Date('2026-08-05') },
      { status: 'PENDING', orderType: 'WHOLESALE', createdAt: new Date('2026-08-10') },
      { status: 'PAID', orderType: 'WHOLESALE', createdAt: new Date('2026-08-15') },
    ] as any);

    const metrics = await getOrderMetrics(startDate, endDate);
    expect(metrics.totalOrders).toBe(3);
    expect(metrics.paidOrders).toBe(2);
    expect(metrics.successRate).toBeCloseTo(66.67, 1);
    expect(metrics.m2oOrders).toBe(1);
    expect(metrics.wholesaleOrders).toBe(2);
  });

  it('getMaterialUsageMetrics should calculate material usage', async () => {
    vi.mocked(prisma.orderLine.findMany).mockResolvedValue([
      {
        quantity: 5,
        materials: [
          { material: { name: 'Cotton' } },
          { material: { name: 'Silk' } },
        ],
      },
      {
        quantity: 3,
        materials: [
          { material: { name: 'Cotton' } },
        ],
      },
    ] as any);

    const metrics = await getMaterialUsageMetrics(startDate, endDate);
    expect(metrics.totalMaterialVariants).toBe(2);
    expect(metrics.topMaterials[0].name).toBe('Cotton');
    expect(metrics.topMaterials[0].quantity).toBe(8);
  });

  it('getSupplierPerformanceMetrics should return supplier data', async () => {
    vi.mocked(prisma.supplier.findMany).mockResolvedValue([
      { firmName: 'Supplier A', wholesaleProducts: [{}, {}] },
      { firmName: 'Supplier B', wholesaleProducts: [{}] },
    ] as any);

    const metrics = await getSupplierPerformanceMetrics(startDate, endDate);
    expect(metrics.totalSuppliers).toBe(2);
    expect(metrics.suppliers[0].name).toBe('Supplier A');
    expect(metrics.suppliers[0].productCount).toBe(2);
  });

  it('getDashboardOverview should aggregate all metrics', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValue([]);
    vi.mocked(prisma.orderLine.findMany).mockResolvedValue([]);
    vi.mocked(prisma.supplier.findMany).mockResolvedValue([]);

    const overview = await getDashboardOverview(startDate, endDate);
    expect(overview.dateRange.startDate).toBe(startDate);
    expect(overview.dateRange.endDate).toBe(endDate);
    expect(overview).toHaveProperty('revenue');
    expect(overview).toHaveProperty('orders');
    expect(overview).toHaveProperty('materials');
    expect(overview).toHaveProperty('suppliers');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reserveStockForOrder, releaseExpiredReservations, StockReservationStatus } from './inventoryReservation';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(async (cb) => cb(prisma)),
    wholesaleStock: {
      findUnique: vi.fn(),
    },
    stockReservation: {
      aggregate: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe('Inventory Reservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reserveStockForOrder', () => {
    it('should successfully reserve stock if available', async () => {
      // Mock stock
      (prisma.wholesaleStock.findUnique as any).mockResolvedValue({ id: 'sku-1', quantity: 100 });
      // Mock existing reservations
      (prisma.stockReservation.aggregate as any).mockResolvedValue({ _sum: { quantity: 20 } });
      // Mock creation
      const mockReservation = { id: 'res-1', skuId: 'sku-1', quantity: 50 };
      (prisma.stockReservation.create as any).mockResolvedValue(mockReservation);

      const result = await reserveStockForOrder('order-1', 'sku-1', 50);

      expect(prisma.wholesaleStock.findUnique).toHaveBeenCalledWith({ where: { id: 'sku-1' } });
      expect(prisma.stockReservation.aggregate).toHaveBeenCalledWith({
        where: { skuId: 'sku-1', status: StockReservationStatus.ACTIVE },
        _sum: { quantity: true },
      });
      expect(prisma.stockReservation.create).toHaveBeenCalled();
      expect(result).toEqual(mockReservation);
    });

    it('should throw if insufficient stock', async () => {
      // Mock stock
      (prisma.wholesaleStock.findUnique as any).mockResolvedValue({ id: 'sku-1', quantity: 100 });
      // Mock existing reservations (only 10 available)
      (prisma.stockReservation.aggregate as any).mockResolvedValue({ _sum: { quantity: 90 } });

      await expect(reserveStockForOrder('order-1', 'sku-1', 20)).rejects.toThrow(/Insufficient stock/);
    });

    it('should throw if SKU not found', async () => {
      (prisma.wholesaleStock.findUnique as any).mockResolvedValue(null);

      await expect(reserveStockForOrder('order-1', 'unknown-sku', 20)).rejects.toThrow(/not found/);
    });
  });

  describe('releaseExpiredReservations', () => {
    it('should mark expired reservations as EXPIRED', async () => {
      (prisma.stockReservation.updateMany as any).mockResolvedValue({ count: 5 });

      const result = await releaseExpiredReservations();
      expect(result).toEqual({ count: 5 });
      expect(prisma.stockReservation.updateMany).toHaveBeenCalledWith({
        where: {
          status: StockReservationStatus.ACTIVE,
          expiresAt: { lt: expect.any(Date) },
        },
        data: {
          status: StockReservationStatus.EXPIRED,
        },
      });
    });
  });
});

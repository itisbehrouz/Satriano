import { prisma } from "@/lib/prisma";

export async function createNotification(recipientEmail: string, title: string, message: string) {
  return await prisma.notification.create({
    data: { recipientEmail, title, message },
  });
}

export async function logAuditTrail(adminEmail: string, action: string, targetEntity: string, targetId?: string, details?: string) {
  return await prisma.auditLog.create({
    data: { adminEmail, action, targetEntity, targetId, details },
  });
}

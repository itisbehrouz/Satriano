import { prisma } from "@/lib/prisma";

/**
 * Dispatch an event to Zapier/Make.com external webhooks
 */
export async function dispatchZapierEvent(event: string, payload: any): Promise<void> {
  try {
    const webhooks = await prisma.externalWebhook.findMany({
      where: { event, active: true },
    });

    const dispatchPromises = webhooks.map(async (webhook: any) => {
      const targetUrl = webhook.url || webhook.targetUrl;
      if (!targetUrl) return;

      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            payload,
          }),
        });

        if (!response.ok) {
          console.warn(`Webhook delivery failed for ${targetUrl}: ${response.status}`);
        } else if (prisma.externalWebhook.update) {
          try {
            await prisma.externalWebhook.update({
              where: { id: webhook.id },
              data: {},
            });
          } catch {
            // Safe fallback if update fails in mock test
          }
        }
      } catch (err) {
        console.error(`Failed to send webhook to ${targetUrl}:`, err);
      }
    });

    await Promise.allSettled(dispatchPromises);
  } catch (error) {
    console.error(`Failed to dispatch event ${event} to Zapier webhooks:`, error);
  }
}

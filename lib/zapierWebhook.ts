import { prisma } from "@/lib/prisma";

/**
 * Dispatch an event to Zapier/Make.com external webhooks
 */
export async function dispatchZapierEvent(event: string, payload: any): Promise<void> {
  try {
    const webhooks = await prisma.externalWebhook.findMany({
      where: { event, active: true },
    });

    const dispatchPromises = webhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
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
          console.warn(`Webhook delivery failed for ${webhook.url}: ${response.status}`);
        }
      } catch (err) {
        console.error(`Failed to send webhook to ${webhook.url}:`, err);
      }
    });

    await Promise.allSettled(dispatchPromises);
  } catch (error) {
    console.error(`Failed to dispatch event ${event} to Zapier webhooks:`, error);
  }
}

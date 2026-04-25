import { Webhooks } from "@dodopayments/nextjs";
import { query } from "@/lib/db";

export const POST = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET!,

  onSubscriptionActive: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    if (userId) {
      console.log(
        `[SDK Webhook] Upgrading user ${userId} to Pro (Subscription Active)`,
      );
      await query("UPDATE users SET is_pro = true WHERE id = $1", [userId]);
    } else {
      console.warn(
        "[SDK Webhook] No userId found in subscription.active payload",
      );
    }
  },

  onPaymentSucceeded: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    if (userId) {
      console.log(
        `[SDK Webhook] Upgrading user ${userId} to Pro (Payment Succeeded)`,
      );
      await query("UPDATE users SET is_pro = true WHERE id = $1", [userId]);
    } else {
      console.warn(
        "[SDK Webhook] No userId found in payment.succeeded payload",
      );
    }
  },

  onPayload: async (payload) => {
    console.log(`[SDK Webhook] Received ${payload.type} event`);
  },
});

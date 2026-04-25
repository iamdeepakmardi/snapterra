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

    console.log(`[SDK Webhook] subscription.active: sub_id=${data.subscription_id}, userId=${userId}`);

    if (userId) {
      console.log(`[SDK Webhook] Upgrading user ${userId} to Pro (Subscription Active)`);
      await query(
        "UPDATE users SET is_pro = true, subscription_id = $1, dodo_customer_id = $2 WHERE id = $3",
        [data.subscription_id, data.customer?.customer_id, userId],
      );
    } else {
      console.warn("[SDK Webhook] No userId found in subscription.active payload metadata");
    }
  },

  onSubscriptionUpdated: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    console.log(`[SDK Webhook] subscription.updated: sub_id=${data.subscription_id}, status=${data.status}, userId=${userId}`);

    const isPro = data.status === "active" || data.status === "on_hold";
    
    if (userId) {
      await query(
        "UPDATE users SET is_pro = $1, subscription_id = $2 WHERE id = $3",
        [isPro, data.subscription_id, userId],
      );
    } else {
      // Fallback: search by subscription_id
      await query(
        "UPDATE users SET is_pro = $1 WHERE subscription_id = $2",
        [isPro, data.subscription_id],
      );
    }
  },

  onPaymentSucceeded: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    console.log(`[SDK Webhook] payment.succeeded: userId=${userId}`);

    if (userId) {
      console.log(`[SDK Webhook] Upgrading user ${userId} to Pro (Payment Succeeded)`);
      await query("UPDATE users SET is_pro = true WHERE id = $1", [userId]);
    }
  },

  onSubscriptionCancelled: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    console.log(`[SDK Webhook] subscription.cancelled: sub_id=${data.subscription_id}, userId=${userId}`);

    if (userId) {
      console.log(`[SDK Webhook] Downgrading user ${userId} (Subscription Cancelled)`);
      await query("UPDATE users SET is_pro = false, subscription_id = NULL WHERE id = $1", [userId]);
    } else {
      // Fallback: search by subscription_id
      console.log(`[SDK Webhook] No userId in metadata, downgrading by sub_id=${data.subscription_id}`);
      await query("UPDATE users SET is_pro = false, subscription_id = NULL WHERE subscription_id = $1", [data.subscription_id]);
    }
  },

  onSubscriptionExpired: async (payload) => {
    const { data } = payload;
    const userId =
      data.metadata?.client_reference_id ||
      data.metadata?.external_user_id ||
      data.customer?.metadata?.client_reference_id;

    console.log(`[SDK Webhook] subscription.expired: sub_id=${data.subscription_id}, userId=${userId}`);

    if (userId) {
      console.log(`[SDK Webhook] Downgrading user ${userId} (Subscription Expired)`);
      await query("UPDATE users SET is_pro = false, subscription_id = NULL WHERE id = $1", [userId]);
    } else {
      // Fallback: search by subscription_id
      await query("UPDATE users SET is_pro = false, subscription_id = NULL WHERE subscription_id = $1", [data.subscription_id]);
    }
  },

  onPayload: async (payload) => {
    console.log(`[SDK Webhook] Received ${payload.type} event`);
  },
});

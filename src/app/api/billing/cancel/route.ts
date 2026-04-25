import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import DodoPayments from "dodopayments";

export async function POST() {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query(
      "SELECT email, subscription_id, dodo_customer_id FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];
    let subscriptionId = user?.subscription_id;
    const dodoCustomerId = user?.dodo_customer_id;
    const email = user?.email;

    console.log(
      `[Cancel Subscription] Attempting for user ${userId} (${email}). Current sub_id: ${subscriptionId}, dodo_customer_id: ${dodoCustomerId}`,
    );

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Billing not configured" },
        { status: 500 },
      );
    }

    const dodo = new DodoPayments({
      bearerToken: apiKey,
      environment:
        process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    });

    // Fallback: If subscriptionId is missing in DB, try to find it via Dodo API
    if (!subscriptionId) {
      console.log(
        `[Cancel Subscription] sub_id missing in DB, searching Dodo...`,
      );
      try {
        let customerId = dodoCustomerId;

        // 1. If we don't have a customer ID, search for the customer by email
        if (!customerId && email) {
          console.log(
            `[Cancel Subscription] Searching for customer by email: ${email}`,
          );
          const customers = await dodo.customers.list({ email });
          if (customers.items && customers.items.length > 0) {
            customerId = customers.items[0].customer_id;
            console.log(
              `[Cancel Subscription] Found customer ID: ${customerId}`,
            );
          }
        }

        // 2. If we have a customer ID, list their subscriptions
        if (customerId) {
          console.log(
            `[Cancel Subscription] Listing subscriptions for customer: ${customerId}`,
          );
          const subscriptions = await dodo.subscriptions.list({
            customer_id: customerId,
          });

          // Look for any subscription that is active, on_hold, or failing
          const activeSub = subscriptions.items?.find(
            (s: any) =>
              s.status === "active" ||
              s.status === "on_hold" ||
              s.status === "failed" ||
              s.status === "failing",
          );

          if (activeSub) {
            subscriptionId = activeSub.subscription_id;
            console.log(
              `[Cancel Subscription] Found sub in Dodo: ${subscriptionId} (Status: ${activeSub.status})`,
            );

            // Update our DB for next time
            await query(
              "UPDATE users SET subscription_id = $1, dodo_customer_id = $2 WHERE id = $3",
              [subscriptionId, customerId, userId],
            );
          }
        }
      } catch (searchError) {
        console.error(
          "[Cancel Subscription] Fallback search error:",
          searchError,
        );
      }
    }

    if (!subscriptionId) {
      console.error(
        `[Cancel Subscription] Failed: No active or cancellable subscription found for user ${userId}`,
      );
      return NextResponse.json(
        {
          error:
            "No active subscription found. If you believe this is an error, please contact support.",
        },
        { status: 400 },
      );
    }

    console.log(
      `[Cancel Subscription] Calling Dodo API to cancel ${subscriptionId}...`,
    );

    try {
      // Use cancel_at_next_billing_date: false if we want immediate cancellation,
      // but usually we want to keep it active until the end of the period.
      // status: 'cancelled' might be more direct.
      await dodo.subscriptions.update(subscriptionId, {
        status: "cancelled",
      });
      console.log(
        `[Cancel Subscription] Successfully marked ${subscriptionId} as cancelled`,
      );
    } catch (apiError: any) {
      console.error("[Cancel Subscription] Dodo API Error:", apiError);
      return NextResponse.json(
        {
          error:
            apiError.message ||
            "Failed to cancel subscription with Dodo Payments",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

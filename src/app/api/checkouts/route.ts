import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import DodoPayments from "dodopayments";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, redirectUrl } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      console.error("DODO_PAYMENTS_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const dodo = new DodoPayments({
      bearerToken: apiKey,
      environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    });

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      metadata: {
        client_reference_id: userId.toString(),
      },
      return_url: redirectUrl || `${new URL(request.url).origin}/tasks`,
    });

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error: any) {
    console.error("Checkout Session Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

"use client";

import { useUserQuery } from "@/hooks/useUser";
import { Loader2, Check, Zap } from "lucide-react";
import { useState } from "react";
import api from "@/lib/axios";

export default function UpgradePage() {
  const { data: user, isLoading: userLoading } = useUserQuery();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setUpgrading(true);
    setError("");
    try {
      const productId = "pdt_0NdRyp745XA5HyJZHmJ3s";
      const { data } = await api.post("/checkouts", {
        productId,
        redirectUrl: window.location.origin + "/tasks",
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to initiate checkout. Please try again.",
      );
      setUpgrading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-black tracking-tight mb-4">
            Level Up Your Workflow
          </h1>
          <p className="text-zinc-500 text-lg">
            Get unlimited access to all premium features with Snapterra Pro.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden transition-all hover:shadow-2xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-black">Pro Plan</h3>
                <p className="text-zinc-500 text-sm">
                  Everything you need to scale
                </p>
              </div>
              <div className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-zinc-200">
                <Zap className="w-6 h-6 fill-current" />
              </div>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-black">$10</span>
              <span className="text-zinc-500 ml-2">/month</span>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                "Unlimited Links & Storage",
                "Unlimited Screenshots",
                "Priority Task Management",
                "Custom Tags & Organization",
                "Priority Email Support",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-zinc-600 text-sm font-medium"
                >
                  <div className="bg-green-100 p-1 rounded-full">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-4 bg-black text-white text-center rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-300 hover:shadow-zinc-400 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing Checkout...
                </>
              ) : (
                "Subscribe for $10/mo"
              )}
            </button>

            <p className="text-center text-zinc-400 text-xs mt-6">
              Secure payment via Dodo Payments.
              <br />
              Cancel anytime with one click.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-400 text-sm">
            Already paid? Wait a few seconds or{" "}
            <button
              onClick={() => window.location.reload()}
              className="text-black font-semibold hover:underline"
            >
              refresh the page
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

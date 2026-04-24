"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { 
        email: email.trim(), 
        password: password.trim() 
      });
      localStorage.setItem("token", response.data.token);
      router.push("/screenshots");
    } catch (err: unknown) {
      const axiosError = err as any; 
      const errorMsg = axiosError.response?.data?.message || axiosError.response?.data?.error || "Invalid credentials";
      console.error(errorMsg);
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Snapterra</h1>
          <p className="text-zinc-600">Sign in to manage your screenshots.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all text-black"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-zinc-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none transition-all text-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg active:scale-95"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

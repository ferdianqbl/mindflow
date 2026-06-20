"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrorMsg(errData.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070a13] font-sans text-slate-100">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0d1527_0%,#070a13_100%)]" />

      {/* Decorative Glow Elements */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px] animate-pulse" />

      {/* Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-[24px] border border-white/5 bg-[rgba(13,20,38,0.45)] p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to focus and log your accomplishments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm font-medium text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@mindflow.app"
                disabled={loading}
                className="w-full rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500/30 focus:bg-slate-950/60 focus:ring-1 focus:ring-cyan-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="w-full rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-cyan-500/30 focus:bg-slate-950/60 focus:ring-1 focus:ring-cyan-500/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/15 outline-none transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/25 active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DIAL_CODE = "+998";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePhoneChange = (e) => {
    // faqat raqamlarni qoldiramiz, prefiks doim yopishib turadi
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setPhone(digitsOnly.slice(0, 9));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fullPhone = `${DIAL_CODE}${phone}`;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          password: password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        let msg = data.error || "Xatolik";
        if (data.debug) {
          msg += " — " + JSON.stringify(data.debug);
        }
        setError(msg);
        return;
      }

      router.push(data.role === "admin" ? "/admin" : "/karta");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Server bilan bog'lanishda xatolik");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-300 transition"
          >
            ← Bosh sahifa
          </Link>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-8 sm:p-10 shadow-2xl shadow-black/40">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Tizimga kirish
            </h1>
            <p className="text-neutral-400 text-sm">
              Telefon raqam va parol bilan kiring.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 break-all">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Telefon raqam
              </label>
              <div className="flex items-stretch rounded-xl border border-neutral-700 bg-neutral-950 focus-within:border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/30 transition overflow-hidden">
                <span className="flex items-center px-4 text-sm font-medium text-neutral-400 bg-neutral-900 border-r border-neutral-700 select-none">
                  {DIAL_CODE}
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="90 123 45 67"
                  required
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-red-600/20"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-500">
            Kartangiz yo&apos;qmi?{" "}
            <Link
              href="/register"
              className="text-red-400 hover:text-red-300 font-medium transition"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
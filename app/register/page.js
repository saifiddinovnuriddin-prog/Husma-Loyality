// FAYL: app/register/page.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const COUNTRIES = [
  { code: "UZ", label: "O'zbekiston", dial: "+998" },
  { code: "KZ", label: "Qozog'iston", dial: "+7" },
  { code: "KG", label: "Qirg'iziston", dial: "+996" },
  { code: "TJ", label: "Tojikiston", dial: "+992" },
  { code: "TM", label: "Turkmaniston", dial: "+993" },
  { code: "RU", label: "Rossiya", dial: "+7" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const dialCode = COUNTRIES.find((c) => c.code === country)?.dial || "+998";

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setPhone(digitsOnly.slice(0, 9));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fullName = `${name} ${surname}`.trim();
    const fullPhone = `${dialCode}${phone}`;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          country,
          phone: fullPhone,
          password,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setLoading(false);
        setError("Server javob bermadi (API topilmadi)");
        return;
      }

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Xatolik yuz berdi");
        return;
      }

      router.push("/karta");
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Server bilan bog'lanishda xatolik");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6 py-12">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              +50 coin bonus
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Kartangizni oching
            </h1>
            <p className="text-neutral-400 text-sm">
              Ro&apos;yxatdan o&apos;ting va darhol 50 coin oling. Keyin
              sovg&apos;alarga almashtirishingiz mumkin.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Ism
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aziz"
                  required
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                  Familiya
                </label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Karimov"
                  required
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Mamlakat
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3.5 text-sm text-white outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition appearance-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.dial})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Telefon raqam
              </label>
              <div className="flex items-stretch rounded-xl border border-neutral-700 bg-neutral-950 focus-within:border-red-500/60 focus-within:ring-1 focus-within:ring-red-500/30 transition overflow-hidden">
                <span className="flex items-center px-4 text-sm font-medium text-neutral-400 bg-neutral-900 border-r border-neutral-700 select-none">
                  {dialCode}
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
                placeholder="kamida 6 belgi"
                required
                minLength={6}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg shadow-red-600/20"
            >
              {loading ? "Yaratilmoqda..." : "Karta ochish + 50 coin"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-neutral-500">
            Kartangiz bormi?{" "}
            <Link
              href="/login"
              className="text-red-400 hover:text-red-300 font-medium transition"
            >
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
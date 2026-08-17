"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

const GIFTS = [
  {
    id: 1,
    name: "Xush kelibsiz meva savati",
    coins: 30,
    icon: "🍇",
    desc: "Xonangizga kirishingiz bilan tayyor turadigan meva va shirinliklar savati.",
    category: "Kichik e'tibor",
  },
  {
    id: 2,
    name: "Bepul nonushta (1 kishi)",
    coins: 50,
    icon: "🥐",
    desc: "Mehmonxona restoranida bir kishilik to'liq nonushta.",
    category: "Ovqatlanish",
  },
  {
    id: 3,
    name: "Kech chiqish (Late checkout)",
    coins: 60,
    icon: "🕒",
    desc: "Standart vaqtdan 3 soatgacha kechroq xonani bo'shatish imkoniyati.",
    category: "Qulaylik",
  },
  {
    id: 4,
    name: "Kir yuvish xizmati",
    coins: 70,
    icon: "🧺",
    desc: "Turingiz davomida bir marta bepul kir yuvish va dazmollash xizmati.",
    category: "Qulaylik",
  },
  {
    id: 5,
    name: "Aeroportdan olib ketish (Transfer)",
    coins: 150,
    icon: "🚗",
    desc: "Aeroportdan mehmonxonagacha shaxsiy avtomobilda bepul transfer.",
    category: "Transport",
  },
  {
    id: 6,
    name: "SPA va basseyn kirish",
    coins: 180,
    icon: "💆",
    desc: "Mehmonxona SPA markazi va basseyniga bir kunlik bepul kirish.",
    category: "Dam olish",
  },
  {
    id: 7,
    name: "Kechki ovqat 2 kishiga",
    coins: 220,
    icon: "🍽️",
    desc: "Mehmonxona restoranida romantik kechki ovqat, 2 kishi uchun.",
    category: "Ovqatlanish",
  },
  {
    id: 8,
    name: "Xona darajasini oshirish",
    coins: 300,
    icon: "⬆️",
    desc: "Keyingi bronlashda bir daraja yuqori xonaga bepul upgrade.",
    category: "Xona",
  },
  {
    id: 9,
    name: "1 kecha bepul turar joy",
    coins: 500,
    icon: "🏨",
    desc: "Standart xonada bir kechalik mehmonxona bepul.",
    category: "Xona",
  },
  {
    id: 10,
    name: "Butler (shaxsiy xizmatkor) kuni",
    coins: 700,
    icon: "🎩",
    desc: "Turingiz davomida bir kunlik shaxsiy butler xizmati.",
    category: "VIP",
  },
  {
    id: 11,
    name: "Deluxe xonada 2 kecha",
    coins: 1100,
    icon: "✨",
    desc: "Deluxe xonada ikki kechalik bepul turar joy.",
    category: "Xona",
  },
  {
    id: 12,
    name: "Presidential Suite — 1 kecha",
    coins: 2000,
    icon: "👑",
    desc: "Eng yuqori darajadagi Presidential Suite'da bir kechalik bepul VIP turar joy.",
    category: "VIP",
  },
];

function formatCoins(n) {
  return n.toLocaleString("uz-UZ");
}

export default function SovgalarPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = hali aniqlanmagan
  const [redeemedId, setRedeemedId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) {
          setIsLoggedIn(false);
          return null;
        }
        setIsLoggedIn(true);
        return res.json();
      })
      .then((data) => {
        if (data) setCoins(data.coins ?? 0);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleRedeem(gift) {
    if (!isLoggedIn) {
      router.push("/login?next=/sovgalar");
      return;
    }
    if (coins === null) return;
    if (coins < gift.coins) {
      setMessage(`Yetarli coin yo'q — "${gift.name}" uchun ${formatCoins(gift.coins)} coin kerak.`);
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setRedeemedId(gift.id);
    setMessage(`"${gift.name}" muvaffaqiyatli tanlandi! Resepshenda kartangizni ko'rsating.`);
    setTimeout(() => setMessage(""), 4000);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-14">
        {/* Hero */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Coinlaringizni sarflang
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Sovg&apos;alar
            </h1>
            <p className="text-neutral-400 max-w-xl text-base sm:text-lg">
              To&apos;plagan coinlaringizni mehmonxona xizmatlariga
              almashtiring.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 px-6 py-4 shrink-0">
            {isLoggedIn === false ? (
              <>
                <p className="text-xs text-neutral-500 mb-1">Balansni ko&apos;rish uchun</p>
                <Link
                  href="/login?next=/sovgalar"
                  className="text-sm font-semibold text-red-400 hover:text-red-300 transition"
                >
                  Kirish →
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-neutral-500 mb-1">Sizning balansingiz</p>
                <p className="text-2xl font-black text-white">
                  {coins === null ? "—" : formatCoins(coins)}
                  <span className="text-sm text-red-400 ml-1.5 font-semibold">coin</span>
                </p>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-4 py-3">
            {message}
          </div>
        )}

        {/* Gifts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GIFTS.map((gift) => {
            const affordable = isLoggedIn && coins !== null && coins >= gift.coins;
            const isRedeemed = redeemedId === gift.id;
            const needsLogin = isLoggedIn === false;

            return (
              <div
                key={gift.id}
                className={`group rounded-2xl border bg-neutral-900/50 overflow-hidden transition-all duration-300 flex flex-col ${
                  affordable || needsLogin
                    ? "border-neutral-800 hover:border-red-500/40"
                    : "border-neutral-800/50 opacity-60"
                }`}
              >
                <div className="h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-5xl">
                  {gift.icon}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs text-neutral-500 mb-2">
                    {gift.category}
                  </span>
                  <h2 className="text-base font-semibold text-white mb-2">
                    {gift.name}
                  </h2>
                  <p className="text-sm text-neutral-400 mb-6 leading-relaxed flex-1">
                    {gift.desc}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-800">
                    <span className="text-sm font-bold text-red-400">
                      {formatCoins(gift.coins)} coin
                    </span>
                    <button
                      onClick={() => handleRedeem(gift)}
                      disabled={!affordable && !needsLogin}
                      className={`rounded-xl text-sm font-semibold px-4 py-2.5 transition ${
                        isRedeemed
                          ? "bg-green-600 text-white"
                          : needsLogin
                          ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                          : affordable
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
                          : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      }`}
                    >
                      {isRedeemed
                        ? "Tanlandi ✓"
                        : needsLogin
                        ? "Kirish"
                        : affordable
                        ? "Almashtirish"
                        : "Coin yetmaydi"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom info */}
        <div className="mt-16 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/60 via-neutral-900 to-neutral-950 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Coin yetarli emasmi?
          </h2>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">
            Xona band qilgan sari coinlaringiz ko&apos;payib boradi. Har bir
            tun — yangi coin.
          </p>
          <Link
            href="/xonalar"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 font-semibold text-sm px-7 py-3.5 hover:bg-neutral-100 transition shadow-xl"
          >
            Xonalarni ko&apos;rish
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
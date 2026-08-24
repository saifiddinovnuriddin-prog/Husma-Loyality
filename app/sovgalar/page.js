"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useI18n } from "../../lib/i18n";

function formatCoins(n) {
  return (Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function SovgalarPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("spa");
  const [coins, setCoins] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [redeemedId, setRedeemedId] = useState(null);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const TABS = [
    { id: "spa", label: t("sovgalar.tabs.spa"), icon: "💆‍♂️" },
    { id: "restaurant", label: t("sovgalar.tabs.restaurant"), icon: "🍽️" },
    { id: "hotel", label: t("sovgalar.tabs.hotel"), icon: "🏨" },
  ];

  const GIFTS = [
    // SPA
    { id: 101, name: t("sovgalar.gifts.101.name"), coins: 100000, icon: "🏋️‍♂️", image: "/gym.jpg", desc: t("sovgalar.gifts.101.desc"), category: "spa" },
    { id: 102, name: t("sovgalar.gifts.102.name"), coins: 140000, icon: "🏊‍♂️", image: "/bas.jpeg", desc: t("sovgalar.gifts.102.desc"), category: "spa" },
    { id: 103, name: t("sovgalar.gifts.103.name"), coins: 200000, icon: "💪", image: "/gym.jpg", desc: t("sovgalar.gifts.103.desc"), category: "spa" },
    { id: 104, name: t("sovgalar.gifts.104.name"), coins: 250000, icon: "🧖‍♂️", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.104.desc"), category: "spa" },
    { id: 105, name: t("sovgalar.gifts.105.name"), coins: 450000, icon: "💆‍♂️", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.105.desc"), category: "spa" },
    { id: 106, name: t("sovgalar.gifts.106.name"), coins: 500000, icon: "🌿", image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.106.desc"), category: "spa" },
    { id: 107, name: t("sovgalar.gifts.107.name"), coins: 400000, icon: "🏃‍♂️", image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.107.desc"), category: "spa" },
    { id: 108, name: t("sovgalar.gifts.108.name"), coins: 400000, icon: "🔥", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.108.desc"), category: "spa" },
    { id: 109, name: t("sovgalar.gifts.109.name"), coins: 250000, icon: "💆‍♂️", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.109.desc"), category: "spa" },
    { id: 110, name: t("sovgalar.gifts.110.name"), coins: 400000, icon: "🍯", image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.110.desc"), category: "spa" },
    { id: 111, name: t("sovgalar.gifts.111.name"), coins: 400000, icon: "🍫", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.111.desc"), category: "spa" },
    { id: 112, name: t("sovgalar.gifts.112.name"), coins: 400000, icon: "🧼", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.112.desc"), category: "spa" },
    { id: 113, name: t("sovgalar.gifts.113.name"), coins: 250000, icon: "🫧", image: "https://images.unsplash.com/photo-1620733723572-11c53f73a416?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.113.desc"), category: "spa" },
    { id: 114, name: t("sovgalar.gifts.114.name"), coins: 850000, icon: "👑", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.114.desc"), category: "spa" },
    { id: 115, name: t("sovgalar.gifts.115.name"), coins: 600000, icon: "👶", image: "https://images.unsplash.com/photo-1560089168-6516aa3f9dcd?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.115.desc"), category: "spa" },
    { id: 116, name: t("sovgalar.gifts.116.name"), coins: 1600000, icon: "🏛️", image: "https://images.unsplash.com/photo-1591343395902-1adc9a4d4a02?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.116.desc"), category: "spa" },

    // RESTAURANT
    { id: 201, name: t("sovgalar.gifts.201.name"), coins: 50000, icon: "🍇", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.201.desc"), category: "restaurant" },
    { id: 202, name: t("sovgalar.gifts.202.name"), coins: 80000, icon: "🥐", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.202.desc"), category: "restaurant" },
    { id: 203, name: t("sovgalar.gifts.203.name"), coins: 400000, icon: "🍽️", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.203.desc"), category: "restaurant" },

    // HOTEL
    { id: 301, name: t("sovgalar.gifts.301.name"), coins: 100000, icon: "🕒", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.301.desc"), category: "hotel" },
    { id: 302, name: t("sovgalar.gifts.302.name"), coins: 60000, icon: "🧺", image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.302.desc"), category: "hotel" },
    { id: 303, name: t("sovgalar.gifts.303.name"), coins: 250000, icon: "🚗", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.303.desc"), category: "hotel" },
    { id: 304, name: t("sovgalar.gifts.304.name"), coins: 500000, icon: "⬆️", image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.304.desc"), category: "hotel" },
    { id: 305, name: t("sovgalar.gifts.305.name"), coins: 900000, icon: "🏨", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.305.desc"), category: "hotel" },
    { id: 306, name: t("sovgalar.gifts.306.name"), coins: 5000000, icon: "👑", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop", desc: t("sovgalar.gifts.306.desc"), category: "hotel" },
  ];

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

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/redemptions")
      .then((res) => res.json())
      .then((data) => setHistory(data.redemptions || []))
      .catch(() => {});
  }, [isLoggedIn]);

  async function handleRedeem(gift) {
    if (!isLoggedIn) {
      router.push("/login?next=/sovgalar");
      return;
    }
    if (coins === null) return;
    if (coins < gift.coins) {
      setMessage(
        t("sovgalar.msg.notEnough", {
          name: gift.name,
          coins: formatCoins(gift.coins),
        })
      );
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: gift.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || t("sovgalar.msg.error"));
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      setCoins(data.coins);
      setRedeemedId(gift.id);
      setMessage(t("sovgalar.msg.success", { name: gift.name }));
      setTimeout(() => setMessage(""), 4000);

      if (data.redemption) {
        setHistory((prev) => [data.redemption, ...prev]);
      } else {
        fetch("/api/redemptions")
          .then((res) => res.json())
          .then((d) => setHistory(d.redemptions || []))
          .catch(() => {});
      }
    } catch {
      setMessage(t("sovgalar.msg.network"));
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const filteredGifts = GIFTS.filter((g) => g.category === activeTab);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-10 py-14">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {t("sovgalar.badge")}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              {t("sovgalar.title")}
            </h1>
            <p className="text-neutral-400 max-w-xl text-base sm:text-lg">
              {t("sovgalar.desc")}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 px-6 py-4 shrink-0">
            {isLoggedIn === false ? (
              <>
                <p className="text-xs text-neutral-500 mb-1">
                  {t("sovgalar.balance.needLogin")}
                </p>
                <Link
                  href="/login?next=/sovgalar"
                  className="text-sm font-semibold text-red-400 hover:text-red-300 transition"
                >
                  {t("sovgalar.balance.login")}
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-neutral-500 mb-1">
                  {t("sovgalar.balance.your")}
                </p>
                <p className="text-2xl font-black text-white">
                  {coins === null ? "—" : formatCoins(coins)}
                  <span className="text-sm text-red-400 ml-1.5 font-semibold">
                    coin
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {isLoggedIn && history.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">
              {t("sovgalar.history.title")}
            </h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-white">
                      {item.giftName || item.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(item.createdAt).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-400">
                      −{formatCoins(item.coinsSpent || item.coins)} coin
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.status === "pending"
                        ? t("sovgalar.history.pending")
                        : item.status === "completed"
                        ? t("sovgalar.history.completed")
                        : item.status || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm px-4 py-3">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGifts.map((gift) => {
            const affordable =
              isLoggedIn && coins !== null && coins >= gift.coins;
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
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.classList.add(
                        "bg-gradient-to-br",
                        "from-neutral-800",
                        "to-neutral-900",
                        "flex",
                        "items-center",
                        "justify-center"
                      );
                      const fallback = document.createElement("span");
                      fallback.textContent = gift.icon;
                      fallback.className = "text-5xl";
                      e.currentTarget.parentElement.appendChild(fallback);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  <span className="absolute top-3 left-3 text-2xl drop-shadow-lg">
                    {gift.icon}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
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
                        ? t("sovgalar.btn.redeemed")
                        : needsLogin
                        ? t("sovgalar.btn.login")
                        : affordable
                        ? t("sovgalar.btn.redeem")
                        : t("sovgalar.btn.notEnough")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/60 via-neutral-900 to-neutral-950 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t("sovgalar.banner.title")}
          </h2>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">
            {t("sovgalar.banner.desc")}
          </p>
          <Link
            href="/xonalar"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 font-semibold text-sm px-7 py-3.5 hover:bg-neutral-100 transition shadow-xl"
          >
            {t("sovgalar.banner.cta")}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
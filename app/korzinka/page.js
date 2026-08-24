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

function formatDate(dateStr, locale) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const loc = locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ";
  return date.toLocaleString(loc, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KorzinkaPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) {
          setIsLoggedIn(false);
          setLoading(false);
          return null;
        }
        setIsLoggedIn(true);
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        return fetch("/api/redemptions", { cache: "no-store" });
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        if (data) setHistory(data.redemptions || []);
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  function getStatusText(status) {
    switch (status) {
      case "pending":
      case "kutilmoqda":
        return t("korzinka.status.pending");
      case "completed":
      case "bajarildi":
        return t("korzinka.status.completed");
      case "cancelled":
      case "bekor qilindi":
        return t("korzinka.status.cancelled");
      default:
        return status || "—";
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "completed":
      case "bajarildi":
        return "text-green-400";
      case "pending":
      case "kutilmoqda":
        return "text-yellow-400";
      case "cancelled":
      case "bekor qilindi":
        return "text-red-400";
      default:
        return "text-neutral-500";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">{t("korzinka.loading")}</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {t("korzinka.badge")}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            {t("korzinka.title")}
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            {t("korzinka.desc")}
          </p>
        </div>

        {isLoggedIn === false ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 px-6 py-12 text-center">
            <p className="text-neutral-400 mb-4">{t("korzinka.needLogin")}</p>
            <Link
              href="/login?next=/korzinka"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition"
            >
              {t("korzinka.login")}
            </Link>
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 px-6 py-12 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-neutral-400 mb-4">{t("korzinka.empty")}</p>
            <Link
              href="/sovgalar"
              className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
            >
              {t("korzinka.goGifts")} →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3.5 sm:px-5 sm:py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm sm:text-base truncate">
                    {item.giftName || item.name || t("korzinka.gift")}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                    {formatDate(item.createdAt, locale)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-400">
                    −{formatCoins(item.coinsSpent ?? item.coins ?? 0)} coin
                  </p>
                  <p className={`text-[11px] font-medium mt-0.5 ${getStatusClass(item.status)}`}>
                    {getStatusText(item.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
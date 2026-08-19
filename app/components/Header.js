"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Coins, Globe, ChevronDown } from "lucide-react";

const LANGS = [
  { code: "UZ", label: "O'zbek" },
  { code: "RU", label: "Русский" },
  { code: "EN", label: "English" },
];

const NAV_LINKS = [
  { href: "/xonalar", label: "CoinSHop" },
  { href: "https://husmahotel.uz/booking?date=2026-08-17&nights=1&adults=2&children-age=", label: "Xona olish" },
  { href: "/karta", label: "Mening kartam" },
];

function Header() {
  const [me, setMe] = useState(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("UZ");
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // =====================================================
  // FOYDALANUVCHI MA'LUMOTINI OLISH (/api/me)
  // =====================================================
  useEffect(() => {
    let cancelled = false;

    fetch("/api/me")
      .then((res) => {
        // 401 (login qilinmagan) yoki boshqa xatolik bo'lsa —
        // JSON parse qilishga urinmasdan to'g'ridan-to'g'ri null qilamiz.
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        // /api/me endpoint foydalanuvchi obyektini to'g'ridan-to'g'ri
        // qaytaradi ({ user: {...} } emas), shuning uchun data.user emas,
        // data ni o'zini ishlatamiz.
        setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // =====================================================
  // SCROLL HOLATI
  // =====================================================
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // =====================================================
  // TIL TANLASH DROPDOWN — TASHQARIGA BOSISH
  // =====================================================
  useEffect(() => {
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // =====================================================
  // MOBIL MENYU OCHIQ BO'LSA — SCROLLNI BLOKLASH
  // =====================================================
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // =====================================================
  // SAHIFA O'ZGARSA — MOBIL MENYUNI YOPISH
  // =====================================================
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setMe(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const isActive = (href) => pathname === href;

  // =====================================================
  // TIL TANLAGICH
  // =====================================================
  const LangSwitcher = ({ mobile = false }) => (
    <div ref={!mobile ? langRef : undefined} className="relative">
      <button
        onClick={() => setLangOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition ${
          mobile ? "w-full justify-between" : ""
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Globe size={14} />
          {lang}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${langOpen ? "rotate-180" : ""}`}
        />
      </button>

      {langOpen && (
        <div
          className={`${
            mobile ? "mt-2 w-full" : "absolute right-0 mt-2 w-36 z-50"
          } rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl overflow-hidden`}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setLangOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition ${
                lang === l.code
                  ? "bg-red-600/20 text-red-400"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {l.label}
              <span className="text-neutral-500">{l.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // =====================================================
  // COIN BADGE
  // =====================================================
  const CoinBadge = ({ mobile = false }) =>
    me ? (
      <div
        className={`flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 ${
          mobile ? "w-fit" : ""
        }`}
      >
        <Coins size={14} />
        {typeof me.coins === "number" ? me.coins.toLocaleString() : 0}
      </div>
    ) : null;

  return (
    <header
      className={`w-full sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-neutral-800"
          : "bg-black border-neutral-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-18 flex items-center justify-between">
        {/* Logotip */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-red-500 transition">
            HUSMA{" "}
            <span className="text-red-600 font-semibold text-sm sm:text-base">
              Loyalty
            </span>
          </span>
        </Link>

        {/* Desktop navigatsiya */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative transition ${
                isActive(link.href)
                  ? "text-red-500"
                  : "text-neutral-300 hover:text-red-500"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-red-600" />
              )}
            </Link>
          ))}

          {me && me.role === "admin" && (
            <Link
              href="/admin"
              className={`font-medium transition ${
                isActive("/admin")
                  ? "text-red-500"
                  : "text-neutral-300 hover:text-red-500"
              }`}
            >
              Admin panel
            </Link>
          )}
        </nav>

        {/* Desktop o'ng blok */}
        <div className="hidden lg:flex items-center gap-3">
          <CoinBadge />
          <LangSwitcher />

          {me ? (
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-800">
              <span className="text-white font-medium text-sm">{me.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-800 hover:text-white transition"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-neutral-200 hover:text-red-500 transition font-medium text-sm"
              >
                Kirish
              </Link>
            </div>
          )}
        </div>

        {/* Mobil */}
        <div className="flex lg:hidden items-center gap-3">
          <CoinBadge />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Menyuni ochish"
            className="p-2 -mr-2 text-white hover:text-red-500 transition"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobil menyu */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-sm bg-neutral-950 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-800">
            <span className="text-lg font-black text-white">
              HUSMA <span className="text-red-600">Loyalty</span>
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Menyuni yopish"
              className="p-2 text-neutral-400 hover:text-white transition"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
            {me ? (
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
                <div>
                  <div className="text-white font-medium text-sm">{me.name}</div>
                  <div className="text-neutral-500 text-xs mt-0.5">
                    Xush kelibsiz
                  </div>
                </div>
                <CoinBadge mobile />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2.5 rounded-lg border border-neutral-700 text-neutral-200 font-medium text-sm hover:bg-neutral-800 transition"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition"
                >
                  Karta ochish
                </Link>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-red-600/10 text-red-500"
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {me && me.role === "admin" && (
                <Link
                  href="/admin"
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition ${
                    isActive("/admin")
                      ? "bg-red-600/10 text-red-500"
                      : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  Admin panel
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-4 border-t border-neutral-800">
              <LangSwitcher mobile />
            </div>

            {me && (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 text-sm font-medium hover:bg-neutral-800 hover:text-white transition"
              >
                Chiqish
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
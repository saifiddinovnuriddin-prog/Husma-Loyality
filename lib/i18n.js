"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import uz from "../messages/uz.json";
import ru from "../messages/ru.json";
import en from "../messages/en.json";

const dicts = { uz, ru, en };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState("uz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && dicts[saved]) {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((code) => {
    const next = String(code).toLowerCase();
    if (!dicts[next]) return;
    setLocaleState(next);
    localStorage.setItem("lang", next);
  }, []);

  const t = useCallback(
    (path) => {
      const keys = path.split(".");
      let val = dicts[locale];
      for (const k of keys) {
        if (val == null) return path;
        val = val[k];
      }
      return typeof val === "string" ? val : path;
    },
    [locale]
  );

  // Hydration mismatch oldini olish uchun (ixtiyoriy)
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "uz", setLocale, t }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
}
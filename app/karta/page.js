"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { useI18n } from "../../lib/i18n";

import {
  Crown,
  Lock,
  Check,
  Sparkles,
  Dices,
  MessageSquare,
  Send,
  AlertCircle,
  Receipt,
  X,
  CheckCircle2,
  LogOut,
  Medal,
  Award,
  Trophy,
  Gem,
  Diamond as DiamondIcon,
  Star,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
  ShieldCheck,
  Gift,
  ShoppingCart,
  BedDouble,
  ArrowRight,
  IdCard,
  Menu,
  Home,
} from "lucide-react";

function formatCoins(n) {
  return (Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const LEVEL_PERKS_PREVIEW = 3;

const WHEEL_LABEL_POS = [
  { top: "26%", left: "72%" },
  { top: "72%", left: "72%" },
  { top: "72%", left: "26%" },
  { top: "26%", left: "26%" },
];

function getCurrentLevelByCoins(coins, LEVELS) {
  const amount = Number(coins) || 0;
  return (
    LEVELS.slice()
      .reverse()
      .find((level) => amount >= level.minCoins) || LEVELS[0]
  );
}

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_COLORS = [
  "bg-neutral-700",
  "bg-red-500",
  "bg-amber-500",
  "bg-yellow-400",
  "bg-emerald-500",
];

// Kompakt yuqori navigatsiya (desktop uchun, bo'limlarga sakrash)
const QUICK_NAV = [
  { href: "#balans", label: "karta.nav.balance", icon: IdCard },
  { href: "#darajalar", label: "karta.nav.levels", icon: Crown },
  { href: "#sovgalar", label: "karta.quick.gifts", icon: Gift },
  { href: "#buyurtmalar", label: "karta.quick.orders", icon: ShoppingCart },
  { href: "#xonalar", label: "karta.quick.rooms", icon: BedDouble },
  { href: "#fikr", label: "karta.feedback.title", icon: MessageSquare },
];

// Mobil pastki tab-bar (telefon uchun alohida, ilova-uslubidagi navigatsiya)
const MOBILE_TABS = [
  { href: "#balans", label: "karta.nav.balance", icon: Home },
  { href: "#darajalar", label: "karta.nav.levels", icon: Crown },
  { href: "#sovgalar", label: "karta.quick.gifts", icon: Gift },
  { href: "#buyurtmalar", label: "karta.quick.orders", icon: ShoppingCart },
];

// Mobil "Ko'proq" menyusidagi qo'shimcha havolalar
const MOBILE_MORE_LINKS = [
  { href: "#xonalar", label: "karta.quick.rooms", icon: BedDouble },
  { href: "#fikr", label: "karta.feedback.title", icon: MessageSquare },
];

export default function KartaPage() {
  const { t } = useI18n();
  const router = useRouter();

  // t() ba'zan {n}/{coins} kabi joy egalarini avtomatik almashtirmasligi
  // mumkin (i18n kutubxonasiga bog'liq) — shuning uchun almashtirishni
  // o'zimiz, qo'lda bajaramiz. Bu tarjima matnida "{level} uchun {coins}
  // coin kerak" kabi xom ko'rinishlarni butunlay oldini oladi.
  function tf(key, vars) {
    let str = t(key);
    if (!vars || typeof str !== "string") return str;
    Object.keys(vars).forEach((k) => {
      str = str.split(`{${k}}`).join(String(vars[k]));
    });
    return str;
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [highestCoins, setHighestCoins] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const [showReceipt, setShowReceipt] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState(() => new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [spinStatus, setSpinStatus] = useState(null);
  const [spinStatusLoading, setSpinStatusLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [spinError, setSpinError] = useState(null);

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [settingsLogin, setSettingsLogin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const LEVELS = [
    {
      key: "Standard",
      name: "Standard",
      icon: Sparkles,
      minCoins: 0,
      color: "from-neutral-700/40 to-neutral-900/20",
      border: "border-neutral-500/40",
      text: "text-neutral-300",
      badge: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
      perks: [t("karta.levels.standard.1"), t("karta.levels.standard.2")],
      autoGift: null,
    },
    {
      key: "Bronze",
      name: "Bronze",
      icon: Medal,
      minCoins: 99000,
      color: "from-amber-800/40 to-amber-950/20",
      border: "border-amber-600/40",
      text: "text-amber-300",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      perks: [
        t("karta.levels.bronze.1"),
        t("karta.levels.bronze.2"),
        t("karta.levels.bronze.3"),
      ],
      autoGift: { name: t("karta.levels.bronze.gift"), coins: 0 },
    },
    {
      key: "Silver",
      name: "Silver",
      icon: Award,
      minCoins: 199000,
      color: "from-slate-500/20 to-slate-800/20",
      border: "border-slate-400/40",
      text: "text-slate-200",
      badge: "bg-slate-400/15 text-slate-300 border-slate-400/30",
      perks: [
        t("karta.levels.silver.1"),
        t("karta.levels.silver.2"),
        t("karta.levels.silver.3"),
        t("karta.levels.silver.4"),
      ],
      autoGift: { name: t("karta.levels.silver.gift"), coins: 0 },
    },
    {
      key: "Gold",
      name: "Gold",
      icon: Trophy,
      minCoins: 399000,
      color: "from-yellow-700/30 to-yellow-950/20",
      border: "border-yellow-500/40",
      text: "text-yellow-300",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      perks: [
        t("karta.levels.gold.1"),
        t("karta.levels.gold.2"),
        t("karta.levels.gold.3"),
        t("karta.levels.gold.4"),
        t("karta.levels.gold.5"),
        t("karta.levels.gold.6"),
        t("karta.levels.gold.7"),
      ],
      autoGift: { name: t("karta.levels.gold.gift"), coins: 0 },
    },
    {
      key: "Platinum",
      name: "Platinum",
      icon: Gem,
      minCoins: 599000,
      color: "from-neutral-400/20 to-neutral-800/20",
      border: "border-neutral-300/40",
      text: "text-neutral-100",
      badge: "bg-neutral-300/15 text-neutral-200 border-neutral-300/30",
      perks: [
        t("karta.levels.platinum.1"),
        t("karta.levels.platinum.2"),
        t("karta.levels.platinum.3"),
        t("karta.levels.platinum.4"),
        t("karta.levels.platinum.5"),
        t("karta.levels.platinum.6"),
        t("karta.levels.platinum.7"),
        t("karta.levels.platinum.8"),
        t("karta.levels.platinum.9"),
      ],
      autoGift: { name: t("karta.levels.platinum.gift"), coins: 0 },
    },
    {
      key: "Diamond",
      name: "Diamond",
      icon: DiamondIcon,
      minCoins: 799000,
      color: "from-cyan-700/30 to-sky-950/20",
      border: "border-cyan-400/50",
      text: "text-cyan-300",
      badge: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
      perks: [
        t("karta.levels.diamond.1"),
        t("karta.levels.diamond.2"),
        t("karta.levels.diamond.3"),
        t("karta.levels.diamond.4"),
        t("karta.levels.diamond.5"),
        t("karta.levels.diamond.6"),
        t("karta.levels.diamond.7"),
        t("karta.levels.diamond.8"),
        t("karta.levels.diamond.9"),
      ],
      autoGift: { name: t("karta.levels.diamond.gift"), coins: 0 },
    },
    {
      key: "VIP",
      name: "VIP",
      icon: Star,
      minCoins: 999000,
      color: "from-purple-700/30 to-fuchsia-950/20",
      border: "border-purple-400/50",
      text: "text-purple-300",
      badge: "bg-purple-500/15 text-purple-300 border-purple-400/40",
      perks: [
        t("karta.levels.vip.1"),
        t("karta.levels.vip.2"),
        t("karta.levels.vip.3"),
        t("karta.levels.vip.4"),
        t("karta.levels.vip.5"),
        t("karta.levels.vip.6"),
        t("karta.levels.vip.7"),
        t("karta.levels.vip.8"),
        t("karta.levels.vip.9"),
      ],
      autoGift: { name: t("karta.levels.vip.gift"), coins: 0 },
    },
  ];

  const WHEEL_SEGMENTS = [
    { prize: 0, label: t("karta.wheel.seg0"), short: "0", color: "#3f3f46" },
    { prize: 5, label: t("karta.wheel.seg5"), short: "5", color: "#0891b2" },
    { prize: 10, label: t("karta.wheel.seg10"), short: "10", color: "#eab308" },
    { prize: 15, label: t("karta.wheel.seg15"), short: "15", color: "#dc2626" },
  ];

  const WHEEL_GRADIENT = `conic-gradient(
    ${WHEEL_SEGMENTS[0].color} 0deg 90deg,
    ${WHEEL_SEGMENTS[1].color} 90deg 180deg,
    ${WHEEL_SEGMENTS[2].color} 180deg 270deg,
    ${WHEEL_SEGMENTS[3].color} 270deg 360deg
  )`;

  const STRENGTH_LABELS = [
    t("karta.settings.strength0"),
    t("karta.settings.strength1"),
    t("karta.settings.strength2"),
    t("karta.settings.strength3"),
    t("karta.settings.strength4"),
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  function toggleLevelExpanded(key) {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openSettings() {
    setSettingsError(null);
    setSettingsSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSettingsLogin(user?.login || user?.phone || user?.username || "");
    setShowSettings(true);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const userRes = await fetch("/api/me", { cache: "no-store" });
        if (!userRes.ok) {
          if (!cancelled) router.replace("/login");
          return;
        }

        const userData = await userRes.json();
        if (cancelled) return;

        setUser(userData);

        const currentCoins = Number(userData.coins) || 0;
        const storageKey = `husma_highest_coins_${userData.id}`;
        const savedHighest = Number(localStorage.getItem(storageKey) || 0);
        const newHighest = Math.max(savedHighest, currentCoins);
        localStorage.setItem(storageKey, String(newHighest));
        setHighestCoins(newHighest);

        // Pending buyurtmalar soni
        try {
          const histRes = await fetch("/api/redemptions", { cache: "no-store" });
          if (histRes.ok) {
            const histData = await histRes.json();
            if (!cancelled && Array.isArray(histData.redemptions)) {
              const pending = histData.redemptions.filter(
                (item) =>
                  item.status === "pending" || item.status === "kutilmoqda"
              ).length;
              setPendingCount(pending);
            }
          }
        } catch {
          /* ignore */
        }

        setSpinStatusLoading(true);
        try {
          const spinRes = await fetch("/api/spin", { cache: "no-store" });
          if (spinRes.ok) {
            const spinData = await spinRes.json();
            if (!cancelled) setSpinStatus(spinData);
          } else if (!cancelled) {
            setSpinStatus({ canSpin: false, todaySpin: null });
          }
        } catch {
          if (!cancelled) setSpinStatus({ canSpin: false, todaySpin: null });
        } finally {
          if (!cancelled) setSpinStatusLoading(false);
        }
      } catch (error) {
        console.error("Karta load error:", error);
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user?.cardNumber) return;
    const raw = String(user.cardNumber).replace(/\s/g, "");
    QRCode.toDataURL(raw, {
      margin: 1,
      width: 220,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(null));
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    const coinsForLevel = Math.max(Number(user.coins) || 0, highestCoins);
    const level = getCurrentLevelByCoins(coinsForLevel, LEVELS);

    if (!level || !level.autoGift) return;

    const rewardedKey = `husma_level_reward_${user.id}_${level.key}`;
    if (localStorage.getItem(rewardedKey)) return;

    localStorage.setItem(rewardedKey, "1");

    fetch("/api/level-reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: level.key,
        giftName: level.autoGift.name,
        coins: level.autoGift.coins,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("level-reward failed");
        return res.json();
      })
      .then(() => {
        setPendingCount((c) => c + 1);
      })
      .catch((err) => {
        console.error("Level reward error:", err);
        localStorage.removeItem(rewardedKey);
      });
  }, [user?.id, user?.coins, highestCoins]);

  async function handleSpin() {
    if (!spinStatus?.canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinError(null);
    setSpinResult(null);

    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setSpinError(data.error || t("karta.msg.error"));
        setIsSpinning(false);
        return;
      }

      const segmentIndex = WHEEL_SEGMENTS.findIndex(
        (s) => s.prize === data.prize
      );
      const segmentCenterAngle = segmentIndex * 90 + 45;
      const targetAngle = (360 - segmentCenterAngle + 360) % 360;
      const extraSpins = 5;

      setSpinRotation((prev) => {
        const prevMod = ((prev % 360) + 360) % 360;
        const delta = 360 - prevMod + 360 * extraSpins + targetAngle;
        return prev + delta;
      });

      setTimeout(() => {
        setIsSpinning(false);
        setSpinResult(data.prize);
        setSpinStatus({
          canSpin: false,
          todaySpin: { prize: data.prize },
        });

        if (data.prize > 0) {
          setUser((prev) =>
            prev ? { ...prev, coins: data.coins } : prev
          );
        }
      }, 1600);
    } catch (err) {
      console.error(err);
      setSpinError(t("karta.msg.network"));
      setIsSpinning(false);
    }
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    const trimmed = feedbackMessage.trim();
    if (!trimmed || feedbackSubmitting) return;

    setFeedbackSubmitting(true);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(feedbackRating > 0 ? { rating: feedbackRating } : {}),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbackMessage("");
        setFeedbackRating(0);
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 3500);
      } else {
        setFeedbackError(data.error || t("karta.msg.error"));
      }
    } catch (err) {
      console.error(err);
      setFeedbackError(t("karta.msg.network"));
    }

    setFeedbackSubmitting(false);
  }

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    if (settingsSubmitting) return;

    setSettingsError(null);
    setSettingsSuccess(false);

    const wantsPasswordChange =
      newPassword.length > 0 || confirmPassword.length > 0;

    if (wantsPasswordChange) {
      if (!currentPassword) {
        setSettingsError(t("karta.settings.errCurrent"));
        return;
      }
      if (newPassword.length < 6) {
        setSettingsError(t("karta.settings.errMin"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setSettingsError(t("karta.settings.errMatch"));
        return;
      }
    }

    if (!settingsLogin.trim()) {
      setSettingsError(t("karta.settings.errLogin"));
      return;
    }

    setSettingsSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: settingsLogin.trim(),
          currentPassword: wantsPasswordChange ? currentPassword : undefined,
          newPassword: wantsPasswordChange ? newPassword : undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser((prev) =>
          prev ? { ...prev, login: settingsLogin.trim() } : prev
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3500);
      } else {
        setSettingsError(data.error || t("karta.msg.error"));
      }
    } catch (err) {
      console.error(err);
      setSettingsError(t("karta.msg.network"));
    }

    setSettingsSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-3">
        <div className="text-neutral-500 text-sm">{t("karta.loading")}</div>
      </main>
    );
  }

  if (!user) return null;

  const currentCoins = Number(user.coins) || 0;
  const levelCoins = Math.max(currentCoins, highestCoins);
  const currentLevel = getCurrentLevelByCoins(levelCoins, LEVELS);
  const currentKey = currentLevel.key;
  const currentIndex = LEVELS.findIndex((l) => l.key === currentKey);
  const nextLevel = LEVELS[currentIndex + 1];

  let progress = 100;
  let needCoins = 0;

  if (nextLevel) {
    const prevMin = currentLevel.minCoins;
    const range = nextLevel.minCoins - prevMin;
    progress = Math.min(
      100,
      Math.max(0, Math.round(((levelCoins - prevMin) / range) * 100))
    );
    needCoins = Math.max(0, nextLevel.minCoins - levelCoins);
  }

  // Ranglar palitrasi soddalashtirildi: cyan — asosiy amallar/joriy daraja,
  // gold — darajalar tizimi, green — bajarilgan imtiyozlar,
  // red — faqat xato/xavfli amallar uchun.
  const tierStyles = {
    Standard: {
      text: "text-neutral-300 border-neutral-500/50",
      gradient: "from-neutral-700/40 via-neutral-900 to-neutral-950",
      glow: "bg-neutral-500/10",
    },
    Bronze: {
      text: "text-amber-300 border-amber-600/50",
      gradient: "from-amber-900/40 via-neutral-900 to-neutral-950",
      glow: "bg-amber-600/15",
    },
    Silver: {
      text: "text-slate-200 border-slate-400/50",
      gradient: "from-slate-600/30 via-neutral-900 to-neutral-950",
      glow: "bg-slate-400/10",
    },
    Gold: {
      text: "text-yellow-400 border-yellow-500/60",
      gradient: "from-yellow-700/40 via-neutral-900 to-neutral-950",
      glow: "bg-yellow-500/15",
    },
    Platinum: {
      text: "text-neutral-100 border-neutral-300/50",
      gradient: "from-neutral-500/30 via-neutral-900 to-neutral-950",
      glow: "bg-neutral-300/10",
    },
    Diamond: {
      text: "text-cyan-300 border-cyan-400/50",
      gradient: "from-cyan-800/40 via-sky-950/30 to-neutral-950",
      glow: "bg-cyan-400/15",
    },
    VIP: {
      text: "text-purple-300 border-purple-400/50",
      gradient: "from-purple-800/40 via-fuchsia-950/30 to-neutral-950",
      glow: "bg-purple-400/15",
    },
  };

  const style = tierStyles[currentKey] || tierStyles.Standard;
  const cardNumber = user.cardNumber || "•••• •••• •••• ••••";
  const maskedCardNumber = cardNumber.replace(/\S(?=\S{4})/g, "•");
  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 overflow-x-hidden pb-20 sm:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 w-full">

        {/* NAVBAR — mobil va desktop uchun boshqacha tarkib */}
        <div className="flex flex-col gap-3 mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-neutral-900">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-neutral-500 mb-0.5">
                {t("karta.hello")}
              </p>
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                {user.name}
              </h1>
            </div>

            {/* Desktop: to'liq tugmalar qatori */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link
                href="/"
                className="text-sm text-neutral-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 whitespace-nowrap"
              >
                {t("karta.nav.home")}
              </Link>
              <button
                onClick={openSettings}
                aria-label={t("karta.nav.settings")}
                className="flex items-center gap-1 text-sm text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 whitespace-nowrap"
              >
                <Settings size={13} />
                {t("karta.nav.settings")}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-400 transition px-2.5 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 whitespace-nowrap"
              >
                <LogOut size={13} />
                {t("karta.nav.logout")}
              </button>
            </div>

            {/* Mobil: faqat hamburger tugmasi */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t("karta.nav.menu")}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-300 shrink-0"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Desktop: tezkor navigatsiya paneli */}
          <nav className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
            {QUICK_NAV.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-neutral-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition px-2.5 py-1.5 rounded-full border border-neutral-800 whitespace-nowrap"
              >
                <Icon size={12} />
                {t(label)}
              </a>
            ))}
          </nav>
        </div>

        {/* HERO: karta + balans + progress — bitta asosiy blokka birlashtirildi.
            Butun karta bosiladigan: istalgan joyiga tegish/bosish rekvizitlar
            (raqamli chek) modalini ochadi. Mobil va desktop uchun ikki xil
            joylashuv (mobil: vertikal/markazlashgan, desktop: gorizontal qator). */}
        <div id="balans" className="mb-6 sm:mb-10 scroll-mt-20">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowReceipt(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowReceipt(true);
            }}
            className={`
              cursor-pointer active:scale-[0.99] sm:active:scale-100 transition-transform duration-150
              rounded-2xl border border-neutral-800 bg-gradient-to-br
              ${style.gradient} p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-2xl
            `}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 ${style.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-6 -left-6 w-24 h-24 sm:w-40 sm:h-40 ${style.glow} rounded-full blur-3xl pointer-events-none`} />

            <div className="relative">
              {/* Ustki qator: brend + rekvizitlarni ko'rsatish tugmasi
                  (mobil: faqat ikonka, desktop: matn bilan) */}
              <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                <span className="text-[11px] sm:text-sm font-bold tracking-widest text-neutral-300">
                  HUSMA
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReceipt(true);
                  }}
                  aria-label={t("karta.card.showDetails")}
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-neutral-200 bg-black/30 hover:bg-black/50 active:bg-black/60 border border-white/10 px-2.5 py-1.5 sm:px-3 rounded-lg transition"
                >
                  <IdCard size={13} />
                  <span className="hidden sm:inline">{t("karta.card.showDetails")}</span>
                </button>
              </div>

              {/* MOBIL LAYOUT — vertikal, chapga tekislangan */}
              <div className="sm:hidden flex flex-col items-start text-left">
                <p className="text-[11px] text-neutral-400 mb-1">
                  {t("karta.coins.your")}
                </p>
                <p className="text-4xl font-black text-white tracking-tight leading-none mb-3">
                  {formatCoins(currentCoins)}
                  <span className="text-base text-neutral-400 ml-1.5 font-semibold">
                    coin
                  </span>
                </p>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${style.text} bg-black/20 mb-4`}
                >
                  <Crown size={13} />
                  <span className="text-sm font-bold">{currentLevel.name}</span>
                </div>

                {nextLevel ? (
                  <div className="w-full">
                    <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5">
                      <span className="font-semibold text-neutral-300">{progress}%</span>
                      <span className="text-right">
                        {needCoins > 0
                          ? tf("karta.coins.needToNext", {
                              coins: formatCoins(needCoins),
                              level: nextLevel.name,
                            })
                          : t("karta.coins.unlocked")}
                      </span>
                    </div>
                    {highestCoins > currentCoins && (
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {t("karta.coins.highest")}: {formatCoins(highestCoins)} coin
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {t("karta.coins.maxLevel")}
                  </p>
                )}

                <p className="text-[10px] text-neutral-500 mt-4 pt-3 border-t border-white/10 w-full">
                  {t("karta.coins.totalSpent")}: {formatCoins(user.totalSpent || 0)} {t("karta.coins.som")}
                </p>

                <p className="flex items-center gap-1 text-[10px] text-neutral-600 mt-2">
                  <IdCard size={11} />
                  {t("karta.card.hint")}
                </p>
              </div>

              {/* DESKTOP LAYOUT — gorizontal qator */}
              <div className="hidden sm:block">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-400 mb-1">
                      {t("karta.coins.your")}
                    </p>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                      {formatCoins(currentCoins)}
                      <span className="text-lg text-neutral-400 ml-1.5 font-semibold">
                        coin
                      </span>
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.text} bg-black/20`}
                  >
                    <Crown size={14} />
                    <span className="text-base font-bold">
                      {currentLevel.name}
                    </span>
                  </div>
                </div>

                {nextLevel ? (
                  <div>
                    <div className="flex justify-between text-xs text-neutral-300 mb-1.5 gap-1">
                      <span className="truncate font-medium">{currentLevel.name}</span>
                      <span className="text-right shrink-0 font-medium">
                        {needCoins > 0
                          ? tf("karta.coins.needToNext", {
                              coins: formatCoins(needCoins),
                              level: nextLevel.name,
                            })
                          : t("karta.coins.unlocked")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1.5">
                      {progress}%
                      {highestCoins > currentCoins && (
                        <span className="ml-2 text-neutral-500">
                          ({t("karta.coins.highest")}: {formatCoins(highestCoins)} coin)
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {t("karta.coins.maxLevel")}
                  </p>
                )}

                <p className="text-sm text-neutral-400 mt-4 pt-3 border-t border-white/10">
                  {t("karta.coins.totalSpent")}: {formatCoins(user.totalSpent || 0)} {t("karta.coins.som")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BARABAN */}
        <div id="wheel" className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 md:p-6 mb-6 sm:mb-10 scroll-mt-20">
          <div className="flex items-center gap-1.5 mb-1">
            <Dices size={15} className="text-cyan-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-white">
              {t("karta.wheel.title")}
            </h2>
          </div>
          <p className="text-[11px] sm:text-sm text-neutral-500 mb-4">
            {t("karta.wheel.desc")}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div
              className="relative shrink-0 mx-auto"
              style={{
                width: "clamp(140px, 55vw, 200px)",
                height: "clamp(140px, 55vw, 200px)",
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-0.5 z-10"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "12px solid #22d3ee",
                }}
              />

              <div
                className="w-full h-full rounded-full border-[3px] sm:border-4 border-neutral-800 relative overflow-hidden shadow-lg"
                style={{
                  background: WHEEL_GRADIENT,
                  transform: `rotate(${spinRotation}deg)`,
                  transition: isSpinning
                    ? "transform 1.6s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                    : "none",
                }}
              >
                {WHEEL_SEGMENTS.map((seg, i) => (
                  <span
                    key={seg.prize}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-[9px] sm:text-xs font-bold text-white/90"
                    style={{
                      top: WHEEL_LABEL_POS[i].top,
                      left: WHEEL_LABEL_POS[i].left,
                    }}
                  >
                    {seg.short}
                  </span>
                ))}
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-neutral-950 border-2 border-neutral-700 flex items-center justify-center">
                  <Dices size={12} className="sm:w-4 sm:h-4 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              {spinStatusLoading ? (
                <p className="text-[11px] sm:text-sm text-neutral-500">
                  {t("karta.wheel.checking")}
                </p>
              ) : spinResult !== null ? (
                <div>
                  {spinResult > 0 ? (
                    <p className="text-sm sm:text-lg font-bold text-emerald-400 mb-1">
                      {tf("karta.wheel.win", { prize: spinResult })}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-lg font-bold text-neutral-300 mb-1">
                      {t("karta.wheel.lose")}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-neutral-500">
                    {t("karta.wheel.tomorrow")}
                  </p>
                </div>
              ) : spinStatus?.canSpin ? (
                <>
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="w-full sm:w-auto rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 active:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? t("karta.wheel.spinning") : t("karta.wheel.spin")}
                  </button>
                  {spinError && (
                    <p className="mt-2.5 flex items-center justify-center sm:justify-start gap-1.5 text-[10px] sm:text-xs text-red-400">
                      <AlertCircle size={12} />
                      {spinError}
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-[11px] sm:text-sm text-neutral-400 mb-1">
                    {t("karta.wheel.already")}
                  </p>
                  {spinStatus?.todaySpin && (
                    <p className="text-[10px] sm:text-xs text-neutral-600">
                      {t("karta.wheel.todayPrize")}:{" "}
                      {spinStatus.todaySpin.prize > 0
                        ? `+${spinStatus.todaySpin.prize} coin`
                        : t("karta.wheel.noPrize")}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5">
                    {t("karta.wheel.tryTomorrow")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DARAJALAR */}
        <div id="darajalar" className="mb-6 sm:mb-10 scroll-mt-20">
          <div className="flex items-center gap-1.5 mb-3.5 sm:mb-5">
            <Crown size={15} className="text-amber-400 shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-white">
              {t("karta.levelsTitle")}
            </h2>
            <span className="sm:hidden ml-auto text-[10px] text-neutral-600">
              {t("karta.swipeHint")}
            </span>
          </div>

          {/* Mobil: gorizontal snap-scroll karusel. Desktop: grid */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {LEVELS.map((level) => {
              const isUnlocked = levelCoins >= level.minCoins;
              const isCurrent = level.key === currentKey;
              const isExpanded = expandedLevels.has(level.key);
              const LevelIcon = level.icon;
              const hasMore = level.perks.length > LEVEL_PERKS_PREVIEW;
              const displayedPerks = isExpanded
                ? level.perks
                : level.perks.slice(0, LEVEL_PERKS_PREVIEW);

              return (
                <div
                  key={level.key}
                  className={`
                    flex flex-col rounded-xl border p-3 sm:p-4 transition-all min-h-[220px]
                    w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-auto sm:max-w-none
                    ${
                      isCurrent
                        ? `${level.border} bg-gradient-to-br ${level.color} ring-1 ring-cyan-400/40`
                        : isUnlocked
                        ? "border-neutral-700 bg-neutral-900/60"
                        : "border-neutral-800/60 bg-neutral-900/30 opacity-70"
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 ${
                          isUnlocked ? level.badge : "border-neutral-700 text-neutral-600"
                        }`}
                      >
                        <LevelIcon size={14} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3
                            className={`text-sm font-semibold truncate ${
                              isUnlocked ? level.text : "text-neutral-500"
                            }`}
                          >
                            {level.name}
                          </h3>
                          {isCurrent && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500 text-neutral-950 shrink-0">
                              {t("karta.current")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isUnlocked ? level.badge : "border-neutral-700 text-neutral-600"
                      }`}
                    >
                      {formatCoins(level.minCoins)}
                    </span>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {displayedPerks.map((perk) => (
                      <li key={perk} className="flex items-start gap-1.5 text-[11px] sm:text-[12.5px] leading-snug">
                        {isUnlocked ? (
                          <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Lock size={11} className="text-neutral-600 mt-0.5 shrink-0" />
                        )}
                        <span className={isUnlocked ? "text-neutral-300" : "text-neutral-600"}>
                          {perk}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2">
                    {hasMore && (
                      <button
                        onClick={() => toggleLevelExpanded(level.key)}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-neutral-400 hover:text-cyan-300 transition"
                      >
                        {isExpanded
                          ? t("karta.showLess")
                          : tf("karta.showMore", { n: level.perks.length - LEVEL_PERKS_PREVIEW })}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}

                    {!isUnlocked && (
                      <p className="mt-1.5 text-[9px] sm:text-[11px] text-neutral-600">
                        {tf("karta.needCoins", { coins: formatCoins(level.minCoins) })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TEZKOR AMALLAR — mobilda uzun ro'yxat qatorlari, desktopda karta-grid */}

        {/* MOBIL: skrinshotdagi profil-menyu uslubida uzun qatorlar */}
        <div className="sm:hidden rounded-xl border border-neutral-800 bg-neutral-900/50 divide-y divide-neutral-800 mb-6 overflow-hidden">
          <Link
            id="sovgalar"
            href="/sovgalar"
            className="flex items-center gap-3 px-4 py-4 active:bg-neutral-800/60 transition scroll-mt-20"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
              <Gift size={16} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-white">
                {t("karta.quick.gifts")}
              </span>
              <span className="block text-[11px] text-neutral-500 truncate">
                {t("karta.quick.giftsDesc")}
              </span>
            </span>
            <ChevronRight size={18} className="text-neutral-600 shrink-0" />
          </Link>

          <Link
            id="buyurtmalar"
            href="/korzinka"
            className="flex items-center gap-3 px-4 py-4 active:bg-neutral-800/60 transition scroll-mt-20"
          >
            <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
              <ShoppingCart size={16} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-white">
                {t("karta.quick.orders")}
              </span>
              <span className="block text-[11px] text-neutral-500 truncate">
                {t("karta.quick.ordersDesc")}
              </span>
            </span>
            <ChevronRight size={18} className="text-neutral-600 shrink-0" />
          </Link>

          <Link
            id="xonalar"
            href="https://husmahotel.uz/booking?date=2026-08-15&nights=1&adults=2&children-age="
            className="flex items-center gap-3 px-4 py-4 active:bg-neutral-800/60 transition scroll-mt-20"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
              <BedDouble size={16} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-white">
                {t("karta.quick.rooms")}
              </span>
              <span className="block text-[11px] text-neutral-500 truncate">
                {t("karta.quick.roomsDesc")}
              </span>
            </span>
            <ChevronRight size={18} className="text-neutral-600 shrink-0" />
          </Link>
        </div>

        {/* DESKTOP: karta-grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-10">
          <Link
            href="/sovgalar"
            className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 hover:border-cyan-500/50 active:border-cyan-500/70 transition"
          >
            <div>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-2.5">
                <Gift size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                {t("karta.quick.gifts")}
              </h3>
              <p className="text-[11px] sm:text-sm text-neutral-500 mt-0.5">
                {t("karta.quick.giftsDesc")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-cyan-300 mt-3">
              {t("karta.quick.cta")}
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/korzinka"
            className="group relative flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 hover:border-cyan-500/50 active:border-cyan-500/70 transition"
          >
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-lg z-10">
                {pendingCount > 99 ? "99+" : pendingCount}
              </span>
            )}
            <div>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-2.5">
                <ShoppingCart size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                {t("karta.quick.orders")}
              </h3>
              <p className="text-[11px] sm:text-sm text-neutral-500 mt-0.5">
                {t("karta.quick.ordersDesc")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-cyan-300 mt-3">
              {t("karta.quick.cta")}
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="https://husmahotel.uz/booking?date=2026-08-15&nights=1&adults=2&children-age="
            className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 hover:border-cyan-500/50 active:border-cyan-500/70 transition"
          >
            <div>
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-2.5">
                <BedDouble size={16} />
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                {t("karta.quick.rooms")}
              </h3>
              <p className="text-[11px] sm:text-sm text-neutral-500 mt-0.5">
                {t("karta.quick.roomsDesc")}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-cyan-300 mt-3">
              {t("karta.quick.cta")}
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>

        {/* FIKR VA TAKLIFLAR */}
        <div id="fikr" className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 md:p-6 mb-6 sm:mb-10 scroll-mt-20">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={15} className="text-cyan-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-white">
              {t("karta.feedback.title")}
            </h2>
          </div>
          <p className="text-[11px] sm:text-sm text-neutral-500 mb-3.5">
            {t("karta.feedback.desc")}
          </p>

          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            {/* Yulduzcha baho */}
            <div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mb-1.5">
                {t("karta.feedback.ratingLabel")}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = (feedbackHoverRating || feedbackRating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFeedbackRating(n)}
                      onMouseEnter={() => setFeedbackHoverRating(n)}
                      onMouseLeave={() => setFeedbackHoverRating(0)}
                      aria-label={`${n} star`}
                      className="p-0.5"
                    >
                      <Star
                        size={22}
                        className={
                          filled
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-700"
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder={t("karta.feedback.placeholder")}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:outline-none transition resize-none"
            />

            {feedbackError && (
              <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-red-400">
                <AlertCircle size={12} />
                {feedbackError}
              </p>
            )}

            {feedbackSent && (
              <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400">
                <CheckCircle2 size={12} />
                {t("karta.feedback.sent")}
              </p>
            )}

            <button
              type="submit"
              disabled={feedbackSubmitting || !feedbackMessage.trim()}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-xl bg-cyan-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-cyan-500 active:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <Send size={13} />
              {feedbackSubmitting ? t("karta.feedback.sending") : t("karta.feedback.send")}
            </button>
          </form>
        </div>
      </div>

      {/* MOBIL PASTKI TAB-BAR — faqat telefon uchun, ilova-uslubidagi navigatsiya */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-neutral-950/95 backdrop-blur border-t border-neutral-900 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-between px-1">
          {MOBILE_TABS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-neutral-400 active:text-cyan-300 transition"
            >
              <Icon size={18} />
              {t(label)}
            </a>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-neutral-400 active:text-cyan-300 transition"
          >
            <Menu size={18} />
            {t("karta.nav.more")}
          </button>
        </div>
      </nav>

      {/* MOBIL MENYU SHEET — sozlamalar, chiqish va qo'shimcha bo'limlar */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-full rounded-t-2xl border-t border-neutral-800 bg-neutral-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto mb-4" />

            <div className="space-y-0 divide-y divide-neutral-800 mb-3 rounded-xl overflow-hidden border border-neutral-800">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-neutral-200 active:bg-neutral-800 transition"
              >
                <Home size={17} className="text-neutral-400 shrink-0" />
                <span className="flex-1">{t("karta.nav.home")}</span>
                <ChevronRight size={17} className="text-neutral-600 shrink-0" />
              </Link>
              {MOBILE_MORE_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 text-sm font-medium text-neutral-200 active:bg-neutral-800 transition"
                >
                  <Icon size={17} className="text-neutral-400 shrink-0" />
                  <span className="flex-1">{t(label)}</span>
                  <ChevronRight size={17} className="text-neutral-600 shrink-0" />
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSettings();
                }}
                className="w-full flex items-center gap-3 px-4 py-4 text-sm font-medium text-neutral-200 active:bg-neutral-800 transition"
              >
                <Settings size={17} className="text-neutral-400 shrink-0" />
                <span className="flex-1 text-left">{t("karta.nav.settings")}</span>
                <ChevronRight size={17} className="text-neutral-600 shrink-0" />
              </button>
            </div>

            <div className="h-px bg-neutral-800 mb-3" />

            {/* Chiqish shu yerda ham oddiy, outline — xavfli amal sifatida bo'rttirilmagan */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold text-neutral-300 border border-neutral-800 active:text-red-400 active:border-red-900/50 transition"
            >
              <LogOut size={16} />
              {t("karta.nav.logout")}
            </button>
          </div>
        </div>
      )}

      {/* RAQAMLI CHEK / REKVIZITLAR MODAL */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 shadow-2xl text-neutral-200">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white transition rounded-lg bg-neutral-800/50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
              <Receipt className="text-cyan-400 shrink-0" size={18} />
              <h3 className="text-base font-bold text-white">
                {t("karta.receipt.title")}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm mb-6">
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">{t("karta.receipt.client")}</span>
                <span className="font-medium text-white">{user.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">{t("karta.receipt.card")}</span>
                <span className="font-mono text-white">{cardNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">{t("karta.receipt.level")}</span>
                <span className={`font-semibold ${currentLevel.text}`}>{currentLevel.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">{t("karta.receipt.balance")}</span>
                <span className="font-bold text-emerald-400">{formatCoins(currentCoins)} coin</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">{t("karta.receipt.spent")}</span>
                <span className="font-medium text-white">{formatCoins(user.totalSpent || 0)} {t("karta.coins.som")}</span>
              </div>
            </div>

            {qrDataUrl && (
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white mb-4">
                <img src={qrDataUrl} alt="QR" className="w-32 h-32" />
                <span className="text-[10px] text-neutral-800 font-mono mt-1">{cardNumber}</span>
              </div>
            )}

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-semibold text-white transition"
            >
              {t("karta.receipt.close")}
            </button>
          </div>
        </div>
      )}

      {/* SOZLAMALAR MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl text-neutral-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white transition rounded-lg bg-neutral-800/50 z-10"
            >
              <X size={18} />
            </button>

            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Settings size={16} />
                </span>
                <h3 className="text-base font-bold text-white">
                  {t("karta.settings.title")}
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 mb-5">
                {t("karta.settings.desc")}
              </p>

              <form onSubmit={handleSettingsSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-neutral-400 mb-1.5">
                    <UserRound size={12} />
                    {t("karta.settings.loginLabel")}
                  </label>
                  <input
                    type="text"
                    value={settingsLogin}
                    onChange={(e) => setSettingsLogin(e.target.value)}
                    placeholder={t("karta.settings.loginPlaceholder")}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:outline-none transition"
                  />
                </div>

                <div className="h-px bg-neutral-800" />

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-neutral-400 mb-3">
                    <KeyRound size={12} />
                    {t("karta.settings.passwordTitle")}
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("karta.settings.currentPassword")}
                        autoComplete="current-password"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("karta.settings.newPassword")}
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {newPassword.length > 0 && (
                      <div>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i < passwordStrength
                                  ? STRENGTH_COLORS[passwordStrength]
                                  : "bg-neutral-800"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          {STRENGTH_LABELS[passwordStrength]}
                        </p>
                      </div>
                    )}

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("karta.settings.confirmPassword")}
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <p className="flex items-start gap-1.5 text-[10px] sm:text-[11px] text-neutral-600 mt-2.5">
                    <ShieldCheck size={12} className="mt-0.5 shrink-0" />
                    {t("karta.settings.passwordHint")}
                  </p>
                </div>

                {settingsError && (
                  <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-red-400">
                    <AlertCircle size={12} />
                    {settingsError}
                  </p>
                )}

                {settingsSuccess && (
                  <p className="flex items-center gap-1.5 text-[10px] sm:text-xs text-emerald-400">
                    <CheckCircle2 size={12} />
                    {t("karta.settings.success")}
                  </p>
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-semibold text-white transition"
                  >
                    {t("karta.settings.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={settingsSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-xs sm:text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {settingsSubmitting ? t("karta.settings.saving") : t("karta.settings.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
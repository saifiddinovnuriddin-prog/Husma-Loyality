"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

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
} from "lucide-react";

function formatCoins(n) {
  return (Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ===================== DARAJALAR (7 ta) ===================== */
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
    perks: [
      "Ilovani o'rnatganda 50 000 so'mlik chegirma (Husma fit, Mavi restoranda ham)",
      "Har bir xariddan 1% coin qaytariladi (1 coin = 1 so'm)",
    ],
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
      "Kelganda xonada VIP 1 mevalar savati",
      "Kir yuvish xizmatida 5% chegirma",
      "Husma Spa va Fitness xizmatlarida 5% chegirma",
    ],
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
      "Mavjud bo'lsa bepul upgrade",
      "Xonalarda 5% chegirma",
      "Mavi restoranda 5% chegirma",
      "Kelganda xonada VIP 2 mevalar savati",
    ],
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
      "Mavjud bo'lsa bepul erta check-in",
      "Mavjud bo'lsa bepul kech check-out",
      "Bepul aeroport/vokzalga transfer",
      "Xonalarda 10% chegirma",
      "Kir yuvishda 10% chegirma",
      "Mavi restoranda 10% chegirma",
      "Kelganda xonada VIP 3 mevalar savati",
    ],
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
      "Bepul erta check-in",
      "Bepul kech check-out",
      "Bepul xona upgrade",
      "Biznes-klass aeroport/vokzalga bepul transfer",
      "Xonalarda 10% chegirma",
      "Kir yuvishda 20% chegirma",
      "Mavi restoranda 10% chegirma",
      "Kelganda xonada VIP 4 mevalar savati",
      "Jo'nab ketishda sovg'a 🎁 1-daraja",
    ],
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
      "Bepul erta check-in",
      "Bepul kech check-out",
      "Mavjud bo'lsa Suite xonaga bepul upgrade",
      "Biznes-klass aeroport/vokzalga bepul transfer",
      "Xonalarda 15% chegirma",
      "Har kuni 2 dona kir yuvish bepul",
      "Mavi restoranda 10% chegirma",
      "Kelganda va har kuni yangilanadigan VIP 5 mevalar savati",
      "Jo'nab ketishda sovg'a 🎁 2-daraja",
    ],
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
      "Bepul erta check-in",
      "Bepul kech check-out",
      "Mavjud bo'lsa Suite xonaga bepul upgrade",
      "Biznes-klass aeroport/vokzalga bepul transfer",
      "Xonalarda 15% chegirma",
      "Bepul kir yuvish xizmati",
      "Mavi restoranda 15% chegirma",
      "Kelganda va har kuni yangilanadigan VIP 6 mevalar savati",
      "Jo'nab ketishda sovg'a 🎁 3-daraja",
    ],
  },
];

const LEVEL_PERKS_PREVIEW = 3;

/* ===================== BARABAN ===================== */
const WHEEL_SEGMENTS = [
  { prize: 0, label: "Yutuqsiz", short: "0", color: "#3f3f46" },
  { prize: 5, label: "5 coin", short: "5", color: "#f59e0b" },
  { prize: 10, label: "10 coin", short: "10", color: "#eab308" },
  { prize: 15, label: "15 coin", short: "15", color: "#dc2626" },
];

const WHEEL_LABEL_POS = [
  { top: "26%", left: "72%" },
  { top: "72%", left: "72%" },
  { top: "72%", left: "26%" },
  { top: "26%", left: "26%" },
];

const WHEEL_GRADIENT = `conic-gradient(
  ${WHEEL_SEGMENTS[0].color} 0deg 90deg,
  ${WHEEL_SEGMENTS[1].color} 90deg 180deg,
  ${WHEEL_SEGMENTS[2].color} 180deg 270deg,
  ${WHEEL_SEGMENTS[3].color} 270deg 360deg
)`;

function getCurrentLevelByCoins(coins) {
  const amount = Number(coins) || 0;
  return (
    LEVELS.slice()
      .reverse()
      .find((level) => amount >= level.minCoins) || LEVELS[0]
  );
}

function getStatusText(status) {
  switch (status) {
    case "pending":
    case "kutilmoqda":
      return "Kutilmoqda";
    case "completed":
    case "bajarildi":
      return "Bajarildi";
    case "cancelled":
    case "bekor qilindi":
      return "Bekor qilindi";
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

export default function KartaPage() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [highestCoins, setHighestCoins] = useState(0);

  const [showReceipt, setShowReceipt] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState(() => new Set());

  const [spinStatus, setSpinStatus] = useState(null);
  const [spinStatusLoading, setSpinStatusLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [spinError, setSpinError] = useState(null);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const router = useRouter();

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

        setHistoryLoading(true);
        const historyRes = await fetch("/api/redemptions", {
          method: "GET",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (!cancelled) {
            setHistory(
              Array.isArray(historyData.redemptions)
                ? historyData.redemptions
                : []
            );
          }
        } else if (!cancelled) {
          setHistory([]);
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
        if (!cancelled) {
          setLoading(false);
          setHistoryLoading(false);
        }
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

  async function handleSpin() {
    if (!spinStatus?.canSpin || isSpinning) return;

    setIsSpinning(true);
    setSpinError(null);
    setSpinResult(null);

    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setSpinError(data.error || "Xatolik yuz berdi");
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
      setSpinError("Server bilan bog'lanishda xatolik");
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
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbackMessage("");
        setFeedbackSent(true);
        setTimeout(() => setFeedbackSent(false), 3500);
      } else {
        setFeedbackError(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      setFeedbackError("Server bilan bog'lanishda xatolik");
    }

    setFeedbackSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-3">
        <div className="text-neutral-500 text-sm">Yuklanmoqda...</div>
      </main>
    );
  }

  if (!user) return null;

  const currentCoins = Number(user.coins) || 0;
  const levelCoins = Math.max(currentCoins, highestCoins);
  const currentLevel = getCurrentLevelByCoins(levelCoins);
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

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-3 sm:px-5 md:px-6 py-5 sm:py-8 md:py-12 w-full">

        {/* NAVBAR */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-8 pb-3 sm:pb-4 border-b border-neutral-900">
          <div className="min-w-0">
            <p className="text-[11px] sm:text-sm text-neutral-500 mb-0.5">Salom,</p>
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="text-[11px] sm:text-sm text-neutral-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800 whitespace-nowrap"
            >
              Bosh sahifa
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-[11px] sm:text-sm text-red-400 hover:text-red-300 transition px-2.5 py-1.5 rounded-lg bg-red-950/30 border border-red-900/50 font-medium whitespace-nowrap"
            >
              <LogOut size={13} />
              Chiqish
            </button>
          </div>
        </div>

        {/* KARTA */}
        <div className="mb-4 sm:mb-6">
          <div
            onClick={() => setShowReceipt(true)}
            className={`
              group cursor-pointer active:scale-[0.99] transition-all duration-300
              rounded-2xl border border-neutral-800 bg-gradient-to-br
              ${style.gradient} p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-2xl
            `}
            style={{ minHeight: "160px" }}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 ${style.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-6 -left-6 w-24 h-24 sm:w-40 sm:h-40 ${style.glow} rounded-full blur-3xl pointer-events-none`} />

            <div className="relative flex flex-col justify-between gap-4 min-h-[140px]">
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${style.text}`}>
                  <Crown size={10} />
                  {currentLevel.name}
                </span>
                <span className="text-[11px] sm:text-sm font-bold tracking-widest text-neutral-300">
                  HUSMA
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-xs text-neutral-500 mb-1 tracking-wide">
                    KARTA RAQAMI
                  </p>
                  <p className="text-sm sm:text-lg md:text-2xl font-mono font-semibold tracking-wide text-white break-all leading-tight">
                    {cardNumber}
                  </p>
                  <p className="text-[9px] sm:text-xs text-neutral-500 mt-1.5 uppercase truncate">
                    {user.name}
                  </p>
                </div>

                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Karta QR kodi"
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] sm:text-xs text-neutral-500 mt-1.5 px-1">
            💡 Raqamli chekni ko‘rish uchun karta ustiga bosing
          </p>
        </div>

        {/* COINLAR */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-8">
          <div className="flex items-end justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm text-neutral-400 mb-0.5">Sizning coinlaringiz</p>
              <p className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {formatCoins(currentCoins)}
                <span className="text-xs sm:text-base text-red-400 ml-1 font-semibold">coin</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] sm:text-xs text-neutral-500">Joriy daraja</p>
              <p className={`text-base sm:text-xl font-bold ${currentLevel.text}`}>
                {currentLevel.name}
              </p>
            </div>
          </div>

          {nextLevel ? (
            <div>
              <div className="flex justify-between text-[10px] sm:text-xs text-neutral-500 mb-1.5 gap-1">
                <span className="truncate">{currentLevel.name}</span>
                <span className="text-right shrink-0">
                  {needCoins > 0
                    ? `${formatCoins(needCoins)} coin`
                    : "Ochildi!"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {highestCoins > currentCoins && (
                <p className="text-[9px] sm:text-[11px] text-neutral-600 mt-1.5">
                  Eng yuqori: {formatCoins(highestCoins)} coin
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] sm:text-sm text-purple-300 flex items-center gap-1.5">
              <Sparkles size={12} />
              Eng yuqori daraja — VIP
            </p>
          )}

          <p className="text-[11px] sm:text-sm text-neutral-500 mt-2.5">
            Jami xarajat: {formatCoins(user.totalSpent || 0)} so&apos;m
          </p>
        </div>

        {/* BARABAN */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 md:p-6 mb-5 sm:mb-8">
          <div className="flex items-center gap-1.5 mb-1">
            <Dices size={15} className="text-red-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-white">Kunlik baraban</h2>
          </div>
          <p className="text-[11px] sm:text-sm text-neutral-500 mb-4">
            Kuniga 1 marta bepul aylantiring — 0, 5, 10 yoki 15 coin!
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
                  borderTop: "12px solid #ef4444",
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
                  <Dices size={12} className="sm:w-4 sm:h-4 text-red-400" />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              {spinStatusLoading ? (
                <p className="text-[11px] sm:text-sm text-neutral-500">Tekshirilmoqda...</p>
              ) : spinResult !== null ? (
                <div>
                  {spinResult > 0 ? (
                    <p className="text-sm sm:text-lg font-bold text-emerald-400 mb-1">
                      Tabriklaymiz! +{spinResult} coin 🎉
                    </p>
                  ) : (
                    <p className="text-sm sm:text-lg font-bold text-neutral-300 mb-1">
                      Bu safar yutuqsiz. Ertaga urinib ko‘ring!
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-neutral-500">
                    Ertaga yana bepul aylantirishingiz mumkin.
                  </p>
                </div>
              ) : spinStatus?.canSpin ? (
                <>
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="w-full sm:w-auto rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? "Aylanmoqda..." : "Aylantirish"}
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
                    Bugungi barabanni allaqachon aylantirgansiz.
                  </p>
                  {spinStatus?.todaySpin && (
                    <p className="text-[10px] sm:text-xs text-neutral-600">
                      Bugungi yutuq:{" "}
                      {spinStatus.todaySpin.prize > 0
                        ? `+${spinStatus.todaySpin.prize} coin`
                        : "yutuqsiz"}
                    </p>
                  )}
                  <p className="text-[10px] sm:text-xs text-neutral-600 mt-0.5">
                    Ertaga qayta urinib ko‘ring.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DARAJALAR — ixcham, ikonkali, yig'iladigan */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-1.5 mb-3.5 sm:mb-5">
            <Crown size={15} className="text-amber-400 shrink-0" />
            <h2 className="text-base sm:text-xl font-bold text-white">Darajalar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 items-start">
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
                    rounded-xl border p-3 sm:p-4 transition-all
                    ${
                      isCurrent
                        ? `${level.border} bg-gradient-to-br ${level.color} ring-1 ring-amber-500/30`
                        : isUnlocked
                        ? "border-neutral-700 bg-neutral-900/60"
                        : "border-neutral-800/60 bg-neutral-900/30 opacity-70"
                    }
                  `}
                >
                  {/* Sarlavha qatori: ikonka + nom + (Hozirgi) chap tomonda, coin talabi o'ngda */}
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
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 shrink-0">
                              HOZIRGI
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

                  {/* Imtiyozlar ro'yxati (qisqartirilgan) */}
                  <ul className="space-y-1.5">
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

                  {/* Yig'ish / kengaytirish tugmasi */}
                  {hasMore && (
                    <button
                      onClick={() => toggleLevelExpanded(level.key)}
                      className="mt-2 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-neutral-400 hover:text-white transition"
                    >
                      {isExpanded
                        ? "Kamroq ko'rsatish"
                        : `Yana ${level.perks.length - LEVEL_PERKS_PREVIEW} ta imtiyoz`}
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}

                  {!isUnlocked && (
                    <p className="mt-2 text-[9px] sm:text-[11px] text-neutral-600">
                      {formatCoins(level.minCoins)} coin kerak
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TEZKOR AMALLAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-6 sm:mb-10">
          <Link
            href="/sovgalar"
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 hover:border-red-500/40 active:border-red-500/60 transition group"
          >
            <div className="text-xl mb-1.5 sm:mb-3">🎁</div>
            <h3 className="text-sm font-semibold text-white group-hover:text-red-300 transition">
              Sovg&apos;alarga almashtirish
            </h3>
            <p className="text-[11px] sm:text-sm text-neutral-500 mt-0.5">
              Coinlaringizni sovg&apos;alarga almashtiring
            </p>
          </Link>

          <Link
            href="https://husmahotel.uz/booking?date=2026-08-15&nights=1&adults=2&children-age="
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 hover:border-red-500/40 active:border-red-500/60 transition group"
          >
            <div className="text-xl mb-1.5 sm:mb-3">🛏️</div>
            <h3 className="text-sm font-semibold text-white group-hover:text-red-300 transition">
              Xonalarni ko&apos;rish
            </h3>
            <p className="text-[11px] sm:text-sm text-neutral-500 mt-0.5">
              Yangi bron qiling va coin to&apos;plang
            </p>
          </Link>
        </div>

        {/* ALMASHTIRILGAN SOVG‘ALAR */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-base sm:text-xl font-bold text-white mb-3">
            Almashtirilgan sovg‘alar
          </h2>

          {historyLoading ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center">
              <p className="text-neutral-500 text-xs">Tarix yuklanmoqda...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-8 text-center">
              <div className="text-2xl mb-2">🎁</div>
              <p className="text-neutral-500 text-xs">Hali hech narsa almashtirilmagan</p>
              <Link
                href="/sovgalar"
                className="inline-block mt-3 text-xs text-red-400 hover:text-red-300 transition"
              >
                Sovg‘alarni ko‘rish →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2.5 sm:px-5 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.giftName || item.name || "Sovg'a"}
                    </p>
                    <p className="text-[9px] sm:text-xs text-neutral-500 mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-red-400">
                      −{formatCoins(item.coinsSpent ?? item.coins ?? 0)} coin
                    </p>
                    <p className={`text-[10px] font-medium mt-0.5 ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIKR VA TAKLIFLAR */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3.5 sm:p-5 md:p-6 mb-6 sm:mb-10">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={15} className="text-red-400 shrink-0" />
            <h2 className="text-sm sm:text-lg font-bold text-white">Fikr va takliflar</h2>
          </div>
          <p className="text-[11px] sm:text-sm text-neutral-500 mb-3.5">
            Xizmat sifati bo'yicha taklif va mulohazalaringizni yuboring.
          </p>

          <form onSubmit={handleFeedbackSubmit} className="space-y-2.5">
            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Fikringizni yozing..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs sm:text-sm text-white placeholder-neutral-600 focus:border-red-500/50 focus:outline-none transition resize-none"
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
                Fikringiz muvaffaqiyatli yuborildi!
              </p>
            )}

            <button
              type="submit"
              disabled={feedbackSubmitting || !feedbackMessage.trim()}
              className="flex items-center justify-center gap-1.5 w-full sm:w-auto rounded-xl bg-red-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              <Send size={13} />
              {feedbackSubmitting ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </form>
        </div>

      </div>

      {/* RAQAMLI CHEK MODAL */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 shadow-2xl text-neutral-200">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white transition rounded-lg bg-neutral-800/50"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
              <Receipt className="text-red-400 shrink-0" size={18} />
              <h3 className="text-base font-bold text-white">Raqamli Chek</h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm mb-6">
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">Mijoz:</span>
                <span className="font-medium text-white">{user.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">Karta raqami:</span>
                <span className="font-mono text-white">{cardNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">Joriy daraja:</span>
                <span className={`font-semibold ${currentLevel.text}`}>{currentLevel.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">Balans:</span>
                <span className="font-bold text-emerald-400">{formatCoins(currentCoins)} coin</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-neutral-500">Jami xarajat:</span>
                <span className="font-medium text-white">{formatCoins(user.totalSpent || 0)} so'm</span>
              </div>
            </div>

            {qrDataUrl && (
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white mb-4">
                <img src={qrDataUrl} alt="QR Kod" className="w-32 h-32" />
                <span className="text-[10px] text-neutral-800 font-mono mt-1">{cardNumber}</span>
              </div>
            )}

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs sm:text-sm font-semibold text-white transition"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
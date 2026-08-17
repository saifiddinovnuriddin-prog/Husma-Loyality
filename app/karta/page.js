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

/* ===================== DARAJALAR (4 ta) ===================== */
const LEVELS = [
  {
    key: "Bronza",
    name: "Bronza",
    multiplier: "1.5x",
    minCoins: 0,
    color: "from-amber-800/40 to-amber-950/20",
    border: "border-amber-600/40",
    text: "text-amber-300",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    perks: [
      { title: "Har tun 1.5x coin", free: true },
      { title: "Bepul nonushta imkoniyati", free: true },
      { title: "Priority support", free: true },
    ],
  },
  {
    key: "GOLD",
    name: "GOLD",
    multiplier: "2x",
    minCoins: 500,
    color: "from-yellow-700/30 to-yellow-950/20",
    border: "border-yellow-500/40",
    text: "text-yellow-300",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    perks: [
      { title: "Har tun 2x coin", free: true },
      { title: "Spa 20% chegirma", free: true },
      { title: "Room upgrade imkoniyati", free: true },
    ],
  },
  {
    key: "PLATINUM",
    name: "PLATINUM",
    multiplier: "3x",
    minCoins: 1500,
    color: "from-neutral-500/20 to-neutral-800/20",
    border: "border-neutral-400/40",
    text: "text-neutral-200",
    badge: "bg-neutral-500/15 text-neutral-300 border-neutral-400/30",
    perks: [
      { title: "Har tun 3x coin", free: true },
      { title: "Basseyn bepul", free: true },
      { title: "VIP lounge + maxsus sovg‘alar", free: true },
    ],
  },
  {
    key: "DIAMOND",
    name: "DIAMOND",
    multiplier: "4x",
    minCoins: 3000,
    color: "from-cyan-700/30 to-sky-950/20",
    border: "border-cyan-400/50",
    text: "text-cyan-300",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
    perks: [
      { title: "Har tun 4x coin", free: true },
      { title: "Barcha xizmatlar bepul", free: true },
      { title: "Shaxsiy menejer + maxsus sovg‘alar", free: true },
    ],
  },
];

/* ===================== BARABAN ===================== */
const WHEEL_SEGMENTS = [
  { prize: 0,  label: "Yutuqsiz", short: "0",  color: "#3f3f46" },
  { prize: 5,  label: "5 coin",   short: "5",  color: "#f59e0b" },
  { prize: 10, label: "10 coin",  short: "10", color: "#eab308" },
  { prize: 15, label: "15 coin",  short: "15", color: "#dc2626" },
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
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-500">Yuklanmoqda...</div>
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
    VIP: {
      text: "text-amber-400 border-amber-500/50",
      gradient: "from-amber-900/40 via-neutral-900 to-neutral-950",
      glow: "bg-amber-600/15",
    },
    GOLD: {
      text: "text-yellow-400 border-yellow-500/60",
      gradient: "from-yellow-700/40 via-neutral-900 to-neutral-950",
      glow: "bg-yellow-500/15",
    },
    PLATINUM: {
      text: "text-neutral-200 border-neutral-400/50",
      gradient: "from-neutral-600/30 via-neutral-900 to-neutral-950",
      glow: "bg-neutral-400/10",
    },
    DIAMOND: {
      text: "text-cyan-300 border-cyan-400/50",
      gradient: "from-cyan-800/40 via-sky-950/30 to-neutral-950",
      glow: "bg-cyan-400/15",
    },
  };

  const style = tierStyles[currentKey] || tierStyles.VIP;
  const cardNumber = user.cardNumber || "•••• •••• •••• ••••";

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-12">

        {/* NAVBAR */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Salom,</p>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-neutral-900/60 border border-neutral-800"
            >
              Bosh sahifa
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-900/50 font-medium"
            >
              <LogOut size={15} />
              Chiqish
            </button>
          </div>
        </div>

        {/* KARTA */}
        <div className="mb-6">
          <div
            onClick={() => setShowReceipt(true)}
            className={`
              group cursor-pointer hover:scale-[1.01] transition-all duration-300
              rounded-3xl border border-neutral-800 bg-gradient-to-br
              ${style.gradient} p-7 sm:p-8 relative overflow-hidden shadow-2xl
            `}
            style={{ aspectRatio: "1.6 / 1", minHeight: "210px" }}
          >
            <div className={`absolute top-0 right-0 w-40 h-40 ${style.glow} rounded-full blur-3xl`} />
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 ${style.glow} rounded-full blur-3xl`} />

            <div className="relative h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${style.text}`}>
                  <Crown size={12} />
                  {currentLevel.name}
                </span>
                <span className="text-sm font-bold tracking-widest text-neutral-300">
                  HUSMA
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-2 tracking-wide">
                    KARTA RAQAMI
                  </p>
                  <p className="text-lg sm:text-2xl font-mono font-semibold tracking-widest text-white">
                    {cardNumber}
                  </p>
                  <p className="text-xs text-neutral-500 mt-3 uppercase">
                    {user.name}
                  </p>
                </div>

                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Karta QR kodi"
                    className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-2">
            💡 Raqamli chekni ko‘rish uchun karta ustiga bosing
          </p>
        </div>

        {/* COINLAR */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6 mb-8">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral-400 mb-1">Sizning coinlaringiz</p>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatCoins(currentCoins)}
                <span className="text-base text-red-400 ml-2 font-semibold">coin</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Multiplikator</p>
              <p className={`text-xl font-bold ${currentLevel.text}`}>
                {currentLevel.multiplier}
              </p>
            </div>
          </div>

          {nextLevel ? (
            <div>
              <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                <span>{currentLevel.name}</span>
                <span>
                  {needCoins > 0
                    ? `Keyingi darajaga ${formatCoins(needCoins)} coin`
                    : "Keyingi daraja ochildi!"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {highestCoins > currentCoins && (
                <p className="text-[11px] text-neutral-600 mt-2">
                  Eng yuqori erishilgan: {formatCoins(highestCoins)} coin
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={14} />
              Eng yuqori darajadasiz — DIAMOND
            </p>
          )}

          <p className="text-sm text-neutral-500 mt-3">
            Jami xarajat: {formatCoins(user.totalSpent || 0)} so&apos;m
          </p>
        </div>

        {/* BARABAN */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Dices size={18} className="text-red-400" />
            <h2 className="text-lg font-bold text-white">Kunlik baraban</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-5">
            Kuniga 1 marta bepul aylantiring — 0, 5, 10 yoki 15 coin yutib oling!
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0" style={{ width: 200, height: 200 }}>
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-1 z-10"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: "16px solid #ef4444",
                }}
              />

              <div
                className="w-full h-full rounded-full border-4 border-neutral-800 relative overflow-hidden shadow-lg"
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
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white/90"
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
                <div className="h-10 w-10 rounded-full bg-neutral-950 border-2 border-neutral-700 flex items-center justify-center">
                  <Dices size={16} className="text-red-400" />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              {spinStatusLoading ? (
                <p className="text-sm text-neutral-500">Tekshirilmoqda...</p>
              ) : spinResult !== null ? (
                <div>
                  {spinResult > 0 ? (
                    <p className="text-lg font-bold text-emerald-400 mb-1">
                      Tabriklaymiz! +{spinResult} coin yutdingiz 🎉
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-neutral-300 mb-1">
                      Bu safar yutuqsiz. Ertaga qayta urinib ko‘ring!
                    </p>
                  )}
                  <p className="text-xs text-neutral-500">
                    Ertaga yana bepul aylantirishingiz mumkin.
                  </p>
                </div>
              ) : spinStatus?.canSpin ? (
                <>
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? "Aylanmoqda..." : "Aylantirish"}
                  </button>
                  {spinError && (
                    <p className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-red-400">
                      <AlertCircle size={13} />
                      {spinError}
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm text-neutral-400 mb-1">
                    Bugungi barabaningizni allaqachon aylantirgansiz.
                  </p>
                  {spinStatus?.todaySpin && (
                    <p className="text-xs text-neutral-600">
                      Bugungi yutuq:{" "}
                      {spinStatus.todaySpin.prize > 0
                        ? `+${spinStatus.todaySpin.prize} coin`
                        : "yutuqsiz"}
                    </p>
                  )}
                  <p className="text-xs text-neutral-600 mt-1">
                    Ertaga qayta urinib ko‘ring.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DARAJALAR */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Crown size={18} className="text-amber-400" />
            <h2 className="text-xl font-bold text-white">Darajalar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEVELS.map((level) => {
              const isUnlocked = levelCoins >= level.minCoins;
              const isCurrent = level.key === currentKey;

              return (
                <div
                  key={level.key}
                  className={`
                    relative rounded-2xl border p-5 transition-all
                    ${
                      isCurrent
                        ? `${level.border} bg-gradient-to-br ${level.color} ring-1 ring-amber-500/30`
                        : isUnlocked
                        ? "border-neutral-700 bg-neutral-900/60"
                        : "border-neutral-800/60 bg-neutral-900/30 opacity-70"
                    }
                  `}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950">
                      Hozirgi
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${isUnlocked ? level.text : "text-neutral-500"}`}>
                      {level.name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isUnlocked ? level.badge : "border-neutral-700 text-neutral-600"
                      }`}
                    >
                      {level.multiplier}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {level.perks.map((perk) => (
                      <li key={perk.title} className="flex items-start gap-2 text-sm">
                        {isUnlocked ? (
                          <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Lock size={14} className="text-neutral-600 mt-0.5 shrink-0" />
                        )}
                        <span className={isUnlocked ? "text-neutral-300" : "text-neutral-600"}>
                          {perk.title}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {!isUnlocked && (
                    <p className="mt-3 text-[11px] text-neutral-600">
                      {formatCoins(level.minCoins)} coin kerak
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TEZKOR AMALLAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/sovgalar"
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 hover:border-red-500/40 transition group"
          >
            <div className="text-2xl mb-3">🎁</div>
            <h3 className="font-semibold text-white group-hover:text-red-300 transition">
              Sovg&apos;alarga almashtirish
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Coinlaringizni sovg&apos;alarga almashtiring
            </p>
          </Link>

          <Link
            href="https://husmahotel.uz/booking?date=2026-08-15&nights=1&adults=2&children-age="
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 hover:border-red-500/40 transition group"
          >
            <div className="text-2xl mb-3">🛏️</div>
            <h3 className="font-semibold text-white group-hover:text-red-300 transition">
              Xonalarni ko&apos;rish
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Yangi bron qiling va coin to&apos;plang
            </p>
          </Link>
        </div>

        {/* ALMASHTIRILGAN SOVG‘ALAR */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">
            Almashtirilgan sovg‘alar
          </h2>

          {historyLoading ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
              <p className="text-neutral-500 text-sm">Tarix yuklanmoqda...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
              <div className="text-3xl mb-3">🎁</div>
              <p className="text-neutral-500 text-sm">Hali hech narsa almashtirilmagan</p>
              <Link
                href="/sovgalar"
                className="inline-block mt-4 text-sm text-red-400 hover:text-red-300 transition"
              >
                Sovg‘alarni ko‘rish →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                      {item.giftName || item.name || "Sovg'a"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-red-400">
                      −{formatCoins(item.coinsSpent ?? item.coins ?? 0)} coin
                    </p>
                    <p className={`text-xs mt-0.5 ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FIKR-MULOHAZA */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-red-400" />
            <h2 className="text-xl font-bold text-white">Fikr yoki savol qoldiring</h2>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6">
            <p className="text-sm text-neutral-500 mb-4">
              Kamchilik ko&apos;rdingizmi yoki savolingiz bormi? Bu yerga yozing — admin ko&apos;rib chiqadi.
            </p>

            <form onSubmit={handleFeedbackSubmit}>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Fikringizni shu yerga yozing..."
                rows={4}
                maxLength={1000}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition resize-none"
              />

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs">
                  {feedbackError && (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <AlertCircle size={13} />
                      {feedbackError}
                    </span>
                  )}
                  {feedbackSent && !feedbackError && (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Check size={13} />
                      Yuborildi, rahmat!
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!feedbackMessage.trim() || feedbackSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  {feedbackSubmitting ? "Yuborilmoqda..." : "Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ===================== CHEK (RECEIPT) MODAL ===================== */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fon */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowReceipt(false)}
          />

          {/* Chek qog‘ozi */}
          <div className="relative w-full max-w-sm bg-white text-black rounded-2xl shadow-2xl overflow-hidden">
            {/* Yopish tugmasi */}
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="bg-neutral-900 text-white px-6 py-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Receipt size={24} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold tracking-wider">HUSMA CHEK</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Loyallik kartasi kvitansiyasi
              </p>
            </div>

            <div className="px-6 py-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-2">
                <span className="text-neutral-500">Egasining ismi</span>
                <span className="font-semibold uppercase">{user.name}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-2">
                <span className="text-neutral-500">Karta raqami</span>
                <span className="font-mono font-semibold">{cardNumber}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-2">
                <span className="text-neutral-500">Joriy darajasi</span>
                <span className="font-semibold text-amber-600">{currentLevel.name}</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-neutral-200 pb-2">
                <span className="text-neutral-500">Mavjud coinlar</span>
                <span className="font-semibold">{formatCoins(currentCoins)} coin</span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Faol
                </span>
              </div>
            </div>

            {/* QR + pastki yozuv */}
            <div className="px-6 pb-6 pt-2 text-center border-t border-dashed border-neutral-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto mb-3 rounded-lg border border-neutral-200"
                />
              ) : (
                <div className="w-32 h-32 mx-auto mb-3 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
                  QR yuklanmoqda...
                </div>
              )}

              <p className="text-[11px] text-neutral-500 uppercase tracking-widest">
                Xaridlaringiz uchun rahmat!
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
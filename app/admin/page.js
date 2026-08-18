"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QrScanner from "@/app/components/QrScanner";
import {
  Users,
  Coins,
  Wallet,
  LogOut,
  Home,
  Search,
  Gift,
  Bell,
  Menu,
  X,
  Lock,
  Settings,
  QrCode,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Trash2,
  ShieldCheck,
  MessageSquare,
  MinusCircle,
  PlusCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "users", icon: Users, label: "Foydalanuvchilar" },
  { id: "scanner", icon: QrCode, label: "Skaner" },
  { id: "gifts", icon: Gift, label: "Sovg'alar" },
  { id: "notifications", icon: Bell, label: "Bildirishnomalar" },
  { id: "settings", icon: Settings, label: "Sozlamalar" },
];

const LEVELS = [
  { key: "Standard", name: "Standard", minCoins: 0 },
  { key: "Bronze",   name: "Bronze",   minCoins: 99000 },
  { key: "Silver",   name: "Silver",   minCoins: 199000 },
  { key: "Gold",     name: "Gold",     minCoins: 399000 },
  { key: "Platinum", name: "Platinum", minCoins: 599000 },
  { key: "Diamond",  name: "Diamond",  minCoins: 799000 },
  { key: "VIP",      name: "VIP",      minCoins: 999000 },
];

const TIER_STYLES = {
  Standard: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
  Bronze:   "bg-amber-600/15 text-amber-400 border-amber-600/30",
  Silver:   "bg-slate-400/15 text-slate-300 border-slate-400/30",
  Gold:     "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Platinum: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Diamond:  "bg-sky-500/15 text-sky-300 border-sky-400/40",
  VIP:      "bg-purple-500/15 text-purple-300 border-purple-400/40",
};

// 1 coin necha so'mga teng — kassada to'lov summasini hisoblash uchun.
// Bu qiymat /api/admin/coins/spend endpointidagi SOM_PER_COIN bilan bir xil bo'lishi shart.
const SOM_PER_COIN = 10000;

function getLevelByCoins(coins) {
  const amount = Number(coins) || 0;
  return (
    [...LEVELS].reverse().find((l) => amount >= l.minCoins) || LEVELS[0]
  );
}

// Endi daraja foizi ishlatilmaydi — coin qo'shish faqat SOM_PER_COIN
// nisbati bo'yicha hisoblanadi (masalan 100 so'm = 1 coin).
function calcCoinsFromPurchase(sum) {
  const s = Number(sum) || 0;
  if (s <= 0) return 0;
  return Math.floor(s / SOM_PER_COIN);
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatFeedbackDate(dateStr) {
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

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("users");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  const topRef = useRef(null);

  // Skaner
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scannedUser, setScannedUser] = useState(null);
  const [manualCard, setManualCard] = useState("");
  const [spentAmount, setSpentAmount] = useState("");
  const [scanSubmitting, setScanSubmitting] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(null);

  // YANGI: rejim — "earn" (coin qo'shish) yoki "spend" (coin bilan to'lash)
  const [scanMode, setScanMode] = useState("earn");
  const [coinsToUse, setCoinsToUse] = useState("");

  // Sovg'alar
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionActionLoading, setRedemptionActionLoading] = useState(null);

  // Bildirishnomalar
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackActionLoading, setFeedbackActionLoading] = useState(null);

  // Profil
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profilePasswordConfirm, setProfilePasswordConfirm] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.role !== "admin") {
          router.push("/karta");
          return;
        }
        setUser(data);
        return fetch("/api/admin/users");
      })
      .then((res) => (res ? res.json() : null))
      .then((data) => {
        if (data?.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (user?.phone) setProfilePhone(user.phone);
  }, [user]);

  const loadRedemptions = async () => {
    setRedemptionsLoading(true);
    try {
      const res = await fetch("/api/admin/redemptions");
      const data = await res.json();
      if (res.ok) setRedemptions(data.redemptions || []);
      else setToast(data.error || "Buyurtmalarni yuklashda xatolik");
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setRedemptionsLoading(false);
  };

  const updateRedemptionStatus = async (id, status) => {
    setRedemptionActionLoading(id);
    try {
      const res = await fetch("/api/admin/redemptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setRedemptions((prev) =>
          prev.map((r) => (r.id === id || r.id === Number(id) ? { ...r, status } : r))
        );
        setToast("Status yangilandi");
      } else {
        const data = await res.json();
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setRedemptionActionLoading(null);
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (res.ok) setFeedbackList(data.feedback || []);
      else setToast(data.error || "Bildirishnomalarni yuklashda xatolik");
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setFeedbackLoading(false);
  };

  const toggleFeedbackRead = async (id, currentRead) => {
    setFeedbackActionLoading(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentRead }),
      });
      if (res.ok) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === id ? { ...f, read: !currentRead } : f))
        );
      } else {
        const data = await res.json();
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setFeedbackActionLoading(null);
  };

  const unreadFeedbackCount = useMemo(
    () => feedbackList.filter((f) => !f.read).length,
    [feedbackList]
  );

  const addCoins = async (userId, amount) => {
    if (userId === user?.id) {
      setToast("O'zingizga coin qo'sha olmaysiz");
      return;
    }
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, coins: data.coins } : u))
        );
        setToast(`${amount > 0 ? "+" : ""}${amount} coin qo'shildi`);
      } else {
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const deleteUser = async (userId, userName, isProtected) => {
    if (userId === user?.id) {
      setToast("O'zingizni o'chira olmaysiz");
      return;
    }
    if (isProtected) {
      setToast("Bu foydalanuvchi Save qilingan! Uni o'chira olmaysiz.");
      return;
    }
    if (!confirm(`${userName} nomli foydalanuvchini o'chirishni tasdiqlaysizmi?`)) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setToast("Foydalanuvchi o'chirildi");
      } else {
        const data = await res.json();
        setToast(data.error || "O'chirishda xatolik");
      }
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const toggleSaveUser = async (userId, currentProtected) => {
    if (userId === user?.id) {
      setToast("O'zingizni Save qila olmaysiz");
      return;
    }
    setActionLoading(userId);
    const newStatus = !currentProtected;
    try {
      const res = await fetch("/api/admin/users/protect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isProtected: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isProtected: newStatus } : u))
        );
        setToast(newStatus ? "Foydalanuvchi Saqlandi" : "Himoya olib tashlandi");
      } else {
        const data = await res.json();
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const openScanner = () => {
    setScannerOpen(true);
    setScanActive(true);
    setScannedUser(null);
    setScanError(null);
    setScanSuccess(null);
    setManualCard("");
    setSpentAmount("");
    setCoinsToUse("");
    setScanMode("earn");
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setScanActive(false);
    setScannedUser(null);
    setScanError(null);
    setScanSuccess(null);
    setManualCard("");
    setSpentAmount("");
    setCoinsToUse("");
    setScanMode("earn");
  };

  const lookupCard = async (rawCard) => {
    const card = String(rawCard || "").trim();
    if (!card) return;

    setScanActive(false);
    setScanLoading(true);
    setScanError(null);
    setScanSuccess(null);

    try {
      const res = await fetch(`/api/admin/lookup?card=${encodeURIComponent(card)}`);
      const data = await res.json();
      if (res.ok) setScannedUser(data.user);
      else setScanError(data.error || "Foydalanuvchi topilmadi");
    } catch {
      setScanError("Server bilan bog'lanishda xatolik");
    }
    setScanLoading(false);
  };

  const scanNext = () => {
    setScannedUser(null);
    setScanError(null);
    setScanSuccess(null);
    setManualCard("");
    setSpentAmount("");
    setCoinsToUse("");
    setScanMode("earn");
    setScanActive(true);
  };

  // ===== Coin QO'SHISH (xarid qilinganda) =====
  const submitScanSpent = async () => {
    if (!scannedUser) return;
    const spent = Number(spentAmount);
    if (!spent || spent <= 0) return;

    if (scannedUser.id === user?.id) {
      setScanError("O'zingizga coin qo'sha olmaysiz");
      return;
    }

    const coinsToAdd = calcCoinsFromPurchase(spent);

    if (coinsToAdd <= 0) {
      setScanError(`Hisoblangan coin 0 dan katta bo'lishi kerak (minimal ${SOM_PER_COIN} so'm kerak)`);
      return;
    }

    setScanSubmitting(true);
    setScanError(null);
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: scannedUser.id,
          amount: coinsToAdd,
          spent: spent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setScannedUser((prev) => ({
          ...prev,
          coins: data.coins,
          totalSpent: data.totalSpent ?? (prev.totalSpent || 0) + spent,
        }));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === scannedUser.id
              ? {
                  ...u,
                  coins: data.coins,
                  totalSpent: data.totalSpent ?? (u.totalSpent || 0) + spent,
                }
              : u
          )
        );
        setScanSuccess(
          `+${coinsToAdd} coin qo'shildi (${spent.toLocaleString()} so'm ÷ ${SOM_PER_COIN})`
        );
        setSpentAmount("");
      } else {
        setScanError(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setScanError("Server bilan bog'lanishda xatolik");
    }
    setScanSubmitting(false);
  };

  // ===== YANGI: Coin BILAN TO'LASH (kassada, Korzinka kartadagidek) =====
  const submitSpendCoins = async () => {
    if (!scannedUser) return;
    const spend = Number(coinsToUse);

    if (!spend || spend <= 0) {
      setScanError("Coin miqdorini kiriting");
      return;
    }

    if (spend > (scannedUser.coins || 0)) {
      setScanError(`Balansda yetarli coin yo'q. Mavjud: ${scannedUser.coins}`);
      return;
    }

    if (scannedUser.id === user?.id) {
      setScanError("O'zingizga amal bajara olmaysiz");
      return;
    }

    setScanSubmitting(true);
    setScanError(null);
    try {
      const res = await fetch("/api/admin/coins/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: scannedUser.id,
          coinsToSpend: spend,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setScannedUser((prev) => ({ ...prev, coins: data.coins }));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === scannedUser.id ? { ...u, coins: data.coins } : u
          )
        );
        setScanSuccess(
          `−${data.spent} coin ishlatildi (${(data.spent * SOM_PER_COIN).toLocaleString()} so'mga teng). Qolgan balans: ${data.coins}`
        );
        setCoinsToUse("");
      } else {
        setScanError(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setScanError("Server bilan bog'lanishda xatolik");
    }
    setScanSubmitting(false);
  };

  const handleNavClick = (item) => {
    setActiveNav(item.id);
    setMobileNavOpen(false);

    if (item.id === "users") {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (item.id === "scanner") {
      openScanner();
      return;
    }
    if (item.id === "gifts") {
      loadRedemptions();
      return;
    }
    if (item.id === "notifications") {
      loadFeedback();
      return;
    }
    if (item.id === "settings") {
      setProfileError(null);
      setProfileSuccess(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.card?.includes(q)
    );
  }, [users, query]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const phoneChanged = profilePhone.trim() && profilePhone.trim() !== user?.phone;
    const wantsPasswordChange = profilePassword.trim().length > 0;

    if (!phoneChanged && !wantsPasswordChange) {
      setProfileError("O'zgartiriladigan maydon yo'q");
      return;
    }

    if (wantsPasswordChange) {
      if (profilePassword.length < 6) {
        setProfileError("Yangi parol kamida 6 belgidan iborat bo'lishi kerak");
        return;
      }
      if (profilePassword !== profilePasswordConfirm) {
        setProfileError("Yangi parollar bir-biriga mos emas");
        return;
      }
      if (!profileCurrentPassword) {
        setProfileError("Parolni o'zgartirish uchun joriy parolni kiriting");
        return;
      }
    }

    setProfileLoading(true);
    try {
      const body = {};
      if (phoneChanged) body.phone = profilePhone.trim();
      if (wantsPasswordChange) {
        body.currentPassword = profileCurrentPassword;
        body.newPassword = profilePassword;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setUser((prev) => ({ ...prev, phone: data.phone ?? prev.phone }));
        setProfileCurrentPassword("");
        setProfilePassword("");
        setProfilePasswordConfirm("");
        setProfileSuccess("Ma'lumotlar muvaffaqiyatli yangilandi");
        setToast("Profil yangilandi");
      } else {
        setProfileError(data.error || "Xatolik yuz berdi");
      }
    } catch {
      setProfileError("Server bilan bog'lanishda xatolik");
    }
    setProfileLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Yuklanmoqda...</div>
      </main>
    );
  }

  if (!user) return null;

  const totalUsers = users.length;
  const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);
  const totalSpent = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-sm">
          H
        </div>
        <span className="text-lg font-black text-white">
          HUSMA <span className="text-red-600">Admin</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition text-left relative ${
              activeNav === item.id
                ? "bg-red-600/15 text-red-400 border border-red-500/20"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.id === "notifications" && unreadFeedbackCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold">
                {unreadFeedbackCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-neutral-800 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
        >
          <Home size={18} />
          Bosh sahifa
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40 transition"
        >
          <LogOut size={18} />
          Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex overflow-x-hidden">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white shadow-2xl shadow-black/40 text-center sm:text-left max-w-sm sm:max-w-none mx-auto sm:mx-0">
          {toast}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-neutral-800 bg-black/40 px-4 py-6 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex flex-col w-[min(300px,88vw)] bg-neutral-950 border-r border-neutral-800 px-4 py-6 z-50 h-full">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white transition rounded-lg hover:bg-neutral-900"
            >
              <X size={20} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ===================== QR SKANER MODAL ===================== */}
      {scannerOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeScanner} />
          <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-5 py-4 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-2">
                <ScanLine size={18} className="text-red-400" />
                <h3 className="font-semibold text-white text-base">Mijozni skanerlash</h3>
              </div>
              <button
                onClick={closeScanner}
                className="text-neutral-500 hover:text-white transition p-2 -mr-1 rounded-lg hover:bg-neutral-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {!scannedUser && !scanLoading && (
                <>
                  <QrScanner active={scanActive} onResult={(text) => lookupCard(text)} onError={() => {}} />

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                      Yoki karta raqamini qo&apos;lda kiriting
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        value={manualCard}
                        onChange={(e) => setManualCard(e.target.value)}
                        placeholder="0000 0000 0000"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                      />
                      <button
                        onClick={() => lookupCard(manualCard)}
                        disabled={!manualCard.trim()}
                        className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Qidirish
                      </button>
                    </div>
                  </div>

                  {scanError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                      <AlertCircle size={16} className="shrink-0" />
                      {scanError}
                    </div>
                  )}
                </>
              )}

              {scanLoading && (
                <div className="py-16 text-center text-sm text-neutral-500">Qidirilmoqda...</div>
              )}

              {scannedUser && !scanLoading && (
                <div>
                  {/* Mijoz kartasi */}
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 sm:px-4 py-3.5 mb-5">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300">
                      {initials(scannedUser.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-white truncate text-base">
                          {scannedUser.name}
                        </span>
                        {(() => {
                          const lvl = getLevelByCoins(scannedUser.coins);
                          return (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                                TIER_STYLES[lvl.key] || TIER_STYLES.Bronza
                              }`}
                            >
                              {lvl.name}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {scannedUser.phone || scannedUser.card}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-amber-400">
                        {(scannedUser.coins || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500">coin</p>
                    </div>
                  </div>

                  {scannedUser.id === user.id ? (
                    <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-3 text-sm text-neutral-400">
                      <Lock size={16} className="shrink-0" />
                      O&apos;zingizga amal bajara olmaysiz
                    </div>
                  ) : (
                    <>
                      {/* YANGI: rejim tanlash — Coin qo'shish / Coin bilan to'lash */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          onClick={() => {
                            setScanMode("earn");
                            setScanError(null);
                            setScanSuccess(null);
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-medium border transition ${
                            scanMode === "earn"
                              ? "border-amber-500/40 bg-amber-600/15 text-amber-400"
                              : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                          }`}
                        >
                          <PlusCircle size={15} />
                          Coin qo&apos;shish
                        </button>
                        <button
                          onClick={() => {
                            setScanMode("spend");
                            setScanError(null);
                            setScanSuccess(null);
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-medium border transition ${
                            scanMode === "spend"
                              ? "border-red-500/40 bg-red-600/15 text-red-400"
                              : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                          }`}
                        >
                          <MinusCircle size={15} />
                          Coin bilan to&apos;lash
                        </button>
                      </div>

                      {scanMode === "earn" ? (
                        <>
                          {/* Xarid summasi */}
                          <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                            Xarid summasi (so&apos;m)
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={spentAmount}
                            onChange={(e) => setSpentAmount(e.target.value)}
                            placeholder="Masalan: 800000"
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition mb-3"
                          />

                          {/* Avtomatik hisoblangan coin */}
                          {spentAmount && Number(spentAmount) > 0 && (() => {
                            const coins = calcCoinsFromPurchase(spentAmount);
                            return (
                              <div className="mb-4 rounded-xl bg-neutral-900/80 border border-neutral-800 px-4 py-3 flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-neutral-500">Qo&apos;shiladigan coin</p>
                                  <p className="text-lg font-bold text-amber-400">
                                    +{coins.toLocaleString()} coin
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-neutral-500">Nisbat</p>
                                  <p className="text-sm font-semibold text-white">
                                    {SOM_PER_COIN} so&apos;m = 1 coin
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          <button
                            onClick={submitScanSpent}
                            disabled={!spentAmount || Number(spentAmount) <= 0 || scanSubmitting}
                            className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {scanSubmitting ? "Qo'shilmoqda..." : "Qo'shish"}
                          </button>
                        </>
                      ) : (
                        <>
                          {/* YANGI: coin bilan to'lash (kassada) */}
                          <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                            Ishlatiladigan coin
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={coinsToUse}
                            onChange={(e) => setCoinsToUse(e.target.value)}
                            placeholder={`Maksimal: ${scannedUser.coins || 0}`}
                            max={scannedUser.coins || 0}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition mb-3"
                          />

                          {coinsToUse && Number(coinsToUse) > 0 && (
                            <div className="mb-4 rounded-xl bg-neutral-900/80 border border-neutral-800 px-4 py-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-neutral-500">Ishlatiladi</span>
                                <span className="text-lg font-bold text-red-400">
                                  −{Number(coinsToUse).toLocaleString()} coin
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-neutral-500">
                                <span>Chekdan ayiriladi</span>
                                <span className="text-neutral-300 font-medium">
                                  ≈ {(Number(coinsToUse) * SOM_PER_COIN).toLocaleString()} so&apos;m
                                </span>
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-800">
                                <span className="text-xs text-neutral-500">Qoladigan balans</span>
                                <span className="text-sm font-semibold text-white">
                                  {((scannedUser.coins || 0) - Number(coinsToUse)).toLocaleString()} coin
                                </span>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={submitSpendCoins}
                            disabled={
                              !coinsToUse ||
                              Number(coinsToUse) <= 0 ||
                              Number(coinsToUse) > (scannedUser.coins || 0) ||
                              scanSubmitting
                            }
                            className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {scanSubmitting ? "Bajarilmoqda..." : "To'lovni tasdiqlash"}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {scanSuccess && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
                      <CheckCircle2 size={16} className="shrink-0" />
                      {scanSuccess}
                    </div>
                  )}

                  {scanError && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                      <AlertCircle size={16} className="shrink-0" />
                      {scanError}
                    </div>
                  )}

                  <button
                    onClick={scanNext}
                    className="mt-5 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
                  >
                    Boshqa mijozni skanerlash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 -ml-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-white text-sm">
            HUSMA <span className="text-red-500">Admin</span>
          </span>
          <div className="w-9" />
        </div>

        <div ref={topRef} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {/* Stats */}
          {activeNav === "users" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Users size={14} />
                    Jami foydalanuvchilar
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{totalUsers}</p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Coins size={14} />
                    Jami coinlar
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    {totalCoins.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Wallet size={14} />
                    Jami xarajat
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">
                    {totalSpent.toLocaleString()} so&apos;m
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4 sm:mb-6">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ism, telefon, karta yoki email bo'yicha qidirish..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 pl-10 pr-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/40 transition"
                />
              </div>

              {/* Users list */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-neutral-800/60">
                  {filteredUsers.length === 0 ? (
                    <div className="px-4 py-12 text-center text-neutral-500 text-sm">
                      {users.length === 0
                        ? "Foydalanuvchilar mavjud emas"
                        : "Qidiruv bo'yicha hechnarsa topilmadi"}
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === user.id;
                      const lvl = getLevelByCoins(u.coins);
                      return (
                        <div key={u.id} className="p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300 shrink-0">
                              {initials(u.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-medium text-white text-base">{u.name}</p>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400">
                                    Siz
                                  </span>
                                )}
                                {u.isProtected && (
                                  <ShieldCheck size={15} className="text-emerald-400" />
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 truncate mt-0.5">{u.email}</p>
                              <p className="text-xs text-neutral-400 mt-1 font-mono">{u.card || "Karta yo'q"}</p>
                              <p className="text-xs text-neutral-500">{u.phone}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-amber-400">
                                {(u.coins || 0).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-neutral-500">coin</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span
                              className={`text-xs px-2.5 py-1.5 rounded-full border font-medium ${
                                TIER_STYLES[lvl.key] || TIER_STYLES.Bronza
                              }`}
                            >
                              {lvl.name}
                            </span>
                            <p className="text-neutral-400 text-xs">
                              {(u.totalSpent || 0).toLocaleString()} so&apos;m
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <button
                              onClick={() => toggleSaveUser(u.id, u.isProtected)}
                              disabled={actionLoading === u.id || isSelf}
                              className={`flex-1 min-w-[70px] rounded-xl border px-3 py-2.5 text-xs font-medium transition disabled:opacity-30 ${
                                u.isProtected
                                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                  : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                              }`}
                            >
                              {u.isProtected ? "Saved" : "Save"}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id, u.name, u.isProtected)}
                              disabled={actionLoading === u.id || u.isProtected || isSelf}
                              className="rounded-xl border border-red-900/40 bg-red-950/30 p-2.5 text-red-400 hover:bg-red-900/50 active:bg-red-900/70 transition disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 text-left">
                        <th className="px-4 sm:px-6 py-3 font-medium">Foydalanuvchi</th>
                        <th className="px-4 sm:px-6 py-3 font-medium">Karta / Telefon</th>
                        <th className="px-4 sm:px-6 py-3 font-medium">Daraja</th>
                        <th className="px-4 sm:px-6 py-3 font-medium">Coin</th>
                        <th className="px-4 sm:px-6 py-3 font-medium">Xarajat</th>
                        <th className="px-4 sm:px-6 py-3 font-medium">Amallar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                            {users.length === 0
                              ? "Foydalanuvchilar mavjud emas"
                              : "Qidiruv bo'yicha hechnarsa topilmadi"}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelf = u.id === user.id;
                          const lvl = getLevelByCoins(u.coins);
                          return (
                            <tr
                              key={u.id}
                              className="border-b border-neutral-800/60 hover:bg-neutral-900/40 transition"
                            >
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                                    {initials(u.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-white truncate flex items-center gap-1.5">
                                      {u.name}
                                      {isSelf && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 shrink-0">
                                          Siz
                                        </span>
                                      )}
                                      {u.isProtected && (
                                        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                                      )}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <p className="font-mono text-xs text-neutral-300">{u.card || "Karta yo'q"}</p>
                                <p className="text-xs text-neutral-500">{u.phone}</p>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                                    TIER_STYLES[lvl.key] || TIER_STYLES.Bronza
                                  }`}
                                >
                                  {lvl.name}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-amber-400">
                                {(u.coins || 0).toLocaleString()}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-neutral-300">
                                {(u.totalSpent || 0).toLocaleString()} so&apos;m
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => toggleSaveUser(u.id, u.isProtected)}
                                    disabled={actionLoading === u.id || isSelf}
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition disabled:opacity-30 ${
                                      u.isProtected
                                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                                        : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                    }`}
                                  >
                                    {u.isProtected ? "Saved" : "Save"}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u.id, u.name, u.isProtected)}
                                    disabled={actionLoading === u.id || u.isProtected || isSelf}
                                    className="rounded-lg border border-red-900/40 bg-red-950/30 p-1.5 text-red-400 hover:bg-red-900/50 transition disabled:opacity-30"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ===== SOVG'ALAR ===== */}
          {activeNav === "gifts" && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Gift size={20} className="text-red-500 shrink-0" />
                    Sovg&apos;a buyurtmalari
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Foydalanuvchilar tomonidan almashtirilgan sovg&apos;alarni boshqaring.
                  </p>
                </div>
                <button
                  onClick={loadRedemptions}
                  disabled={redemptionsLoading}
                  className="p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white active:bg-neutral-800 transition shrink-0"
                >
                  <RefreshCw size={18} className={redemptionsLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {redemptionsLoading ? (
                <div className="py-12 text-center text-sm text-neutral-500">Yuklanmoqda...</div>
              ) : redemptions.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Hali sovg&apos;a buyurtmalari mavjud emas.
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-base">{r.giftTitle || r.title || "Sovg'a"}</p>
                        <p className="text-sm text-neutral-400 mt-1">
                          Foydalanuvchi: <span className="text-white">{r.userName || r.userId}</span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Sana: {formatFeedbackDate(r.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-bold text-amber-400">
                          {r.cost || r.coins} coin
                        </span>
                        <select
                          value={r.status || "pending"}
                          onChange={(e) => updateRedemptionStatus(r.id, e.target.value)}
                          disabled={redemptionActionLoading === r.id}
                          className="text-sm px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 outline-none min-w-[130px]"
                        >
                          <option value="pending">Kutilmoqda</option>
                          <option value="completed">Bajarildi</option>
                          <option value="rejected">Bekor qilindi</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== BILDIRISHNOMALAR ===== */}
          {activeNav === "notifications" && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Bell size={20} className="text-red-500 shrink-0" />
                    Fikr-mulohazalar
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Foydalanuvchilardan kelgan xabar va takliflar.
                  </p>
                </div>
                <button
                  onClick={loadFeedback}
                  disabled={feedbackLoading}
                  className="p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white active:bg-neutral-800 transition shrink-0"
                >
                  <RefreshCw size={18} className={feedbackLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {feedbackLoading ? (
                <div className="py-12 text-center text-sm text-neutral-500">Yuklanmoqda...</div>
              ) : feedbackList.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Bildirishnomalar mavjud emas.
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border transition ${
                        f.read
                          ? "border-neutral-800/60 bg-neutral-900/20 text-neutral-400"
                          : "border-red-500/30 bg-red-950/10 text-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare
                            size={16}
                            className={f.read ? "text-neutral-500 shrink-0" : "text-red-400 shrink-0"}
                          />
                          <span className="font-semibold text-white truncate text-sm sm:text-base">
                            {f.userName || f.email || "Foydalanuvchi"}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 whitespace-nowrap shrink-0">
                          {formatFeedbackDate(f.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mb-3 whitespace-pre-wrap leading-relaxed">{f.message}</p>
                      <button
                        onClick={() => toggleFeedbackRead(f.id, f.read)}
                        disabled={feedbackActionLoading === f.id}
                        className="text-xs text-neutral-400 hover:text-white underline transition py-1"
                      >
                        {f.read ? "O'qilmagan deb belgilash" : "O'qildi deb belgilash"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SOZLAMALAR ===== */}
          {activeNav === "settings" && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4 sm:p-6 max-w-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
                <Settings size={20} className="text-red-500" />
                Tizim sozlamalari
              </h2>
              <p className="text-sm text-neutral-400 mb-5 sm:mb-6">
                Husma loyallik kartasi tizimi va administrator profili sozlamalari.
              </p>

              <div className="space-y-3 text-sm text-neutral-300 mb-6 sm:mb-8">
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col gap-1">
                  <span className="text-neutral-500 text-xs">Administrator</span>
                  <span className="font-semibold text-white">{user.name}</span>
                  <span className="text-neutral-400 text-xs">{user.email}</span>
                </div>
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                  <span>Tizim versiyasi</span>
                  <span className="font-semibold text-white">v1.0.0</span>
                </div>
              </div>

              <form
                onSubmit={updateProfile}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5 space-y-4 sm:space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Telefon raqami va parol</h3>
                  <p className="text-xs text-neutral-500">
                    Telefon raqamingizni yangilang yoki parolingizni almashtiring.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                    Telefon raqami
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                  />
                </div>

                <div className="h-px bg-neutral-800" />

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                    Joriy parol
                  </label>
                  <input
                    type="password"
                    value={profileCurrentPassword}
                    onChange={(e) => setProfileCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                  />
                  <p className="text-[11px] text-neutral-600 mt-1.5">
                    Faqat parolni o&apos;zgartirmoqchi bo&apos;lsangiz kerak.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                      Yangi parol
                    </label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Kamida 6 belgi"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                      Yangi parolni tasdiqlang
                    </label>
                    <input
                      type="password"
                      value={profilePasswordConfirm}
                      onChange={(e) => setProfilePasswordConfirm(e.target.value)}
                      placeholder="Qayta kiriting"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-300">
                    <AlertCircle size={16} className="shrink-0" />
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
                    <CheckCircle2 size={16} className="shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-red-500 active:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {profileLoading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

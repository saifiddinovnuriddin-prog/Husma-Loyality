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
  Crown,
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
} from "lucide-react";

const NAV_ITEMS = [
  { id: "users", icon: Users, label: "Foydalanuvchilar" },
  { id: "scanner", icon: QrCode, label: "Skaner" },
  { id: "gifts", icon: Gift, label: "Sovg'alar" },
  { id: "notifications", icon: Bell, label: "Bildirishnomalar" },
  { id: "settings", icon: Settings, label: "Sozlamalar" },
];

// 4 TA DARAJA UCHUN STIL:
const TIER_STYLES = {
  Bronza: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Platina: "bg-slate-400/15 text-slate-300 border-slate-400/30",
  Gold: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Diamond: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

const QUICK_AMOUNTS = [20, 50, 100, 200];

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
  const usersRef = useRef(null);

  // ===== Skaner holati =====
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scannedUser, setScannedUser] = useState(null);
  const [manualCard, setManualCard] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [scanSubmitting, setScanSubmitting] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(null);

  // ===== Sovg'alar (Redemptions) =====
  const [redemptions, setRedemptions] = useState([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionActionLoading, setRedemptionActionLoading] = useState(null);

  // ===== Bildirishnomalar (feedback) =====
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackActionLoading, setFeedbackActionLoading] = useState(null);

  // ===== Profil (parol / telefon) =====
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

  // user yuklangach telefon inputini joriy qiymat bilan to'ldiramiz
  useEffect(() => {
    if (user?.phone) {
      setProfilePhone(user.phone);
    }
  }, [user]);

  const loadRedemptions = async () => {
    setRedemptionsLoading(true);
    try {
      const res = await fetch("/api/admin/redemptions");
      const data = await res.json();

      if (res.ok) {
        setRedemptions(data.redemptions || []);
      } else {
        console.error("Redemptions error:", data);
        setToast(data.error || "Buyurtmalarni yuklashda xatolik");
      }
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
      setToast("Server bilan bog'lanishda xatolik");
    }
    setRedemptionActionLoading(null);
  };

  const loadFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();

      if (res.ok) {
        setFeedbackList(data.feedback || []);
      } else {
        console.error("Feedback error:", data);
        setToast(data.error || "Bildirishnomalarni yuklashda xatolik");
      }
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
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
    } catch (err) {
      console.error(err);
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const changeTier = async (userId, tier) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, tier: data.tier } : u))
        );
      } else {
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const deleteUser = async (userId, userName, isProtected) => {
    // Admin o'zini o'chira olmasin
    if (userId === user?.id) {
      setToast("O'zingizni o'chira olmaysiz");
      return;
    }

    if (isProtected) {
      setToast("Bu foydalanuvchi Save qilingan! Uni o'chira olmaysiz.");
      return;
    }

    if (!confirm(`${userName} nomli foydalanuvchini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setToast("Foydalanuvchi o'chirildi");
      } else {
        const data = await res.json();
        setToast(data.error || "O'chirishda xatolik");
      }
    } catch (err) {
      console.error(err);
      setToast("Server bilan bog'lanishda xatolik");
    }
    setActionLoading(null);
  };

  const toggleSaveUser = async (userId, currentProtected) => {
    // Admin o'zini Save qila olmasin (o'ziga nisbatan bu tugma ma'nosiz)
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
        setToast(
          newStatus
            ? "Foydalanuvchi Saqlandi (Endi o'chmaydi!)"
            : "Himoya olib tashlandi"
        );
      } else {
        const data = await res.json();
        setToast(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
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
    setCustomAmount("");
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setScanActive(false);
    setScannedUser(null);
    setScanError(null);
    setScanSuccess(null);
    setManualCard("");
    setCustomAmount("");
  };

  const lookupCard = async (rawCard) => {
    const card = String(rawCard || "").trim();
    if (!card) return;

    setScanActive(false);
    setScanLoading(true);
    setScanError(null);
    setScanSuccess(null);

    try {
      const res = await fetch(
        `/api/admin/lookup?card=${encodeURIComponent(card)}`
      );
      const data = await res.json();
      if (res.ok) {
        setScannedUser(data.user);
      } else {
        setScanError(data.error || "Foydalanuvchi topilmadi");
      }
    } catch (err) {
      console.error(err);
      setScanError("Server bilan bog'lanishda xatolik");
    }
    setScanLoading(false);
  };

  const scanNext = () => {
    setScannedUser(null);
    setScanError(null);
    setScanSuccess(null);
    setManualCard("");
    setCustomAmount("");
    setScanActive(true);
  };

  const submitScanCoins = async (amount) => {
    if (!scannedUser || !amount) return;

    if (scannedUser.id === user?.id) {
      setScanError("O'zingizga coin qo'sha olmaysiz");
      return;
    }

    setScanSubmitting(true);
    setScanError(null);
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: scannedUser.id, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setScannedUser((prev) => ({ ...prev, coins: data.coins }));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === scannedUser.id ? { ...u, coins: data.coins } : u
          )
        );
        setScanSuccess(`+${amount} coin qo'shildi`);
        setCustomAmount("");
      } else {
        setScanError(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
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

  // ===== Profilni yangilash (parol / telefon raqami) =====
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
    } catch (err) {
      console.error(err);
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left relative ${
              activeNav === item.id
                ? "bg-red-600/15 text-red-400 border border-red-500/20"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <item.icon size={17} />
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
        >
          <Home size={17} />
          Bosh sahifa
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/40 transition"
        >
          <LogOut size={17} />
          Chiqish
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-2xl shadow-black/40">
          {toast}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-neutral-800 bg-black/40 px-4 py-6">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-neutral-950 border-r border-neutral-800 px-4 py-6 z-50">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition"
            >
              <X size={18} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ===== QR SKANER MODAL ===== */}
      {scannerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeScanner}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ScanLine size={18} className="text-red-400" />
                <h3 className="font-semibold text-white">Mijozni skanerlash</h3>
              </div>
              <button
                onClick={closeScanner}
                className="text-neutral-500 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              {!scannedUser && !scanLoading && (
                <>
                  <QrScanner
                    active={scanActive}
                    onResult={(text) => lookupCard(text)}
                    onError={() => {}}
                  />

                  <div className="mt-4">
                    <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                      Yoki karta raqamini qo'lda kiriting
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={manualCard}
                        onChange={(e) => setManualCard(e.target.value)}
                        placeholder="0000 0000 0000"
                        className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                      />
                      <button
                        onClick={() => lookupCard(manualCard)}
                        disabled={!manualCard.trim()}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Qidirish
                      </button>
                    </div>
                  </div>

                  {scanError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                      <AlertCircle size={14} className="shrink-0" />
                      {scanError}
                    </div>
                  )}
                </>
              )}

              {scanLoading && (
                <div className="py-16 text-center text-sm text-neutral-500">
                  Qidirilmoqda...
                </div>
              )}

              {scannedUser && !scanLoading && (
                <div>
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 mb-5">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300">
                      {initials(scannedUser.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white truncate">
                          {scannedUser.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                            TIER_STYLES[scannedUser.tier] || TIER_STYLES.Bronza
                          }`}
                        >
                          {scannedUser.tier || "Bronza"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {scannedUser.phone}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-amber-400">
                        {(scannedUser.coins || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-neutral-500">coin</p>
                    </div>
                  </div>

                  {scannedUser.id === user.id ? (
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2.5 text-xs text-neutral-400">
                      <Lock size={14} className="shrink-0" />
                      O'zingizga coin qo'sha olmaysiz
                    </div>
                  ) : (
                    <>
                      <label className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                        Necha coin qo'shamiz?
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {QUICK_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            onClick={() => submitScanCoins(amt)}
                            disabled={scanSubmitting}
                            className="rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium py-2.5 hover:bg-red-600/30 transition disabled:opacity-50"
                          >
                            +{amt}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Boshqa miqdor"
                          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                        />
                        <button
                          onClick={() => submitScanCoins(Number(customAmount))}
                          disabled={!customAmount || scanSubmitting}
                          className="rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Qo'shish
                        </button>
                      </div>
                    </>
                  )}

                  {scanSuccess && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                      <CheckCircle2 size={14} className="shrink-0" />
                      {scanSuccess}
                    </div>
                  )}
                  {scanError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                      <AlertCircle size={14} className="shrink-0" />
                      {scanError}
                    </div>
                  )}

                  <button
                    onClick={scanNext}
                    className="mt-5 w-full rounded-lg border border-neutral-700 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-900 transition"
                  >
                    Boshqa mijozni skanerlash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div ref={topRef} className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden h-9 w-9 rounded-lg border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition shrink-0"
              >
                <Menu size={17} />
              </button>
              <div>
                <p className="text-sm text-neutral-500 mb-1">Admin panel</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Salom, {user.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openScanner}
                className="hidden sm:flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                <QrCode size={16} />
                Mijozni skanerlash
              </button>
              <div className="hidden sm:flex items-center justify-center gap-2 rounded-full h-9 w-9 bg-neutral-900 border border-neutral-800 text-red-400 font-bold text-xs">
                {initials(user.name)}
              </div>
              <div className="lg:hidden flex items-center gap-2">
                <Link
                  href="/"
                  className="text-xs text-neutral-400 hover:text-white transition px-3 py-2"
                >
                  Bosh sahifa
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-400 hover:text-red-300 transition px-3 py-2"
                >
                  Chiqish
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={openScanner}
            className="sm:hidden w-full mb-6 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
          >
            <QrCode size={16} />
            Mijozni skanerlash
          </button>

          {/* ===== FOYDALANUVCHILAR ===== */}
          {activeNav === "users" && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-red-600/15 flex items-center justify-center text-red-400 shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Foydalanuvchilar</p>
                    <p className="text-2xl font-bold text-white">{totalUsers}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Jami coinlar</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {totalCoins.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Jami xarajat</p>
                    <p className="text-2xl font-bold text-white">
                      {totalSpent.toLocaleString()}{" "}
                      <span className="text-sm font-medium text-neutral-500">so&apos;m</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Information table */}
              <div
                ref={usersRef}
                className="rounded-2xl border border-neutral-800 overflow-hidden scroll-mt-6 bg-neutral-900/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
                  <div>
                    <h2 className="font-semibold text-white flex items-center gap-2">
                      <Info size={18} className="text-red-500" />
                      <span>Information — Foydalanuvchilar ma'lumotlari</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      "Save" bosilgan foydalanuvchilar hech qachon o'chirib yuborilmaydi.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ism, telefon, karta yoki email..."
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-500 text-left">
                        <th className="px-6 py-3 font-medium">Foydalanuvchi</th>
                        <th className="px-6 py-3 font-medium">Karta / Telefon</th>
                        <th className="px-6 py-3 font-medium">Daraja</th>
                        <th className="px-6 py-3 font-medium">Coin</th>
                        <th className="px-6 py-3 font-medium">Xarajat</th>
                        <th className="px-6 py-3 font-medium">Amallar</th>
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
                          return (
                            <tr
                              key={u.id}
                              className="border-b border-neutral-800/60 hover:bg-neutral-900/40 transition"
                            >
                              <td className="px-6 py-4">
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
                                        <ShieldCheck
                                          size={14}
                                          className="text-emerald-400 shrink-0"
                                        />
                                      )}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-mono text-xs text-neutral-300">
                                  {u.card || "Karta yo'q"}
                                </p>
                                <p className="text-xs text-neutral-500">{u.phone}</p>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={u.tier || "Bronza"}
                                  onChange={(e) => changeTier(u.id, e.target.value)}
                                  disabled={actionLoading === u.id}
                                  className={`text-xs px-2.5 py-1 rounded-full border bg-neutral-950 font-medium outline-none cursor-pointer ${
                                    TIER_STYLES[u.tier] || TIER_STYLES.Bronza
                                  }`}
                                >
                                  <option value="Bronza" className="bg-neutral-900 text-neutral-200">
                                    Bronza
                                  </option>
                                  <option value="Kumush" className="bg-neutral-900 text-neutral-200">
                                    Kumush
                                  </option>
                                  <option value="Oltin" className="bg-neutral-900 text-neutral-200">
                                    Oltin
                                  </option>
                                  <option value="Platina" className="bg-neutral-900 text-neutral-200">
                                    Platina
                                  </option>
                                </select>
                              </td>
                              <td className="px-6 py-4 font-bold text-amber-400">
                                {(u.coins || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-neutral-300">
                                {(u.totalSpent || 0).toLocaleString()} so'm
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => addCoins(u.id, 10)}
                                    disabled={actionLoading === u.id || isSelf}
                                    className="rounded-lg border border-red-500/30 bg-red-600/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-600/20 transition disabled:opacity-30"
                                  >
                                    +10
                                  </button>
                                  <button
                                    onClick={() => addCoins(u.id, 50)}
                                    disabled={actionLoading === u.id || isSelf}
                                    className="rounded-lg border border-amber-500/30 bg-amber-600/10 px-2.5 py-1.5 text-xs text-amber-400 hover:bg-amber-600/20 transition disabled:opacity-30"
                                  >
                                    +50
                                  </button>
                                  <button
                                    onClick={() => toggleSaveUser(u.id, u.isProtected)}
                                    disabled={actionLoading === u.id || isSelf}
                                    title={isSelf ? "O'zingizni Save qila olmaysiz" : undefined}
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
                                    title={isSelf ? "O'zingizni o'chira olmaysiz" : "O'chirish"}
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

          {/* ===== SOVG'ALAR (REDEMPTIONS) ===== */}
          {activeNav === "gifts" && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Gift size={20} className="text-red-500" />
                    Sovg'a buyurtmalari
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Foydalanuvchilar tomonidan almashtirilgan sovg'alarni boshqaring.
                  </p>
                </div>
                <button
                  onClick={loadRedemptions}
                  disabled={redemptionsLoading}
                  className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition"
                >
                  <RefreshCw size={16} className={redemptionsLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {redemptionsLoading ? (
                <div className="py-12 text-center text-sm text-neutral-500">Yuklanmoqda...</div>
              ) : redemptions.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Hali sovg'a buyurtmalari mavjud emas.
                </div>
              ) : (
                <div className="space-y-4">
                  {redemptions.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
                    >
                      <div>
                        <p className="font-semibold text-white">{r.giftTitle || r.title || "Sovg'a"}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Foydalanuvchi: <span className="text-white">{r.userName || r.userId}</span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Sana: {formatFeedbackDate(r.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-amber-400">
                          {r.cost || r.coins} coin
                        </span>
                        <select
                          value={r.status || "pending"}
                          onChange={(e) => updateRedemptionStatus(r.id, e.target.value)}
                          disabled={redemptionActionLoading === r.id}
                          className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 text-neutral-200 outline-none cursor-pointer"
                        >
                          <option value="pending">Kutilmoqda</option>
                          <option value="completed">Bajarildi</option>
                          <option value="cancelled">Bekor qilindi</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== BILDIRISHNOMALAR (FEEDBACK) ===== */}
          {activeNav === "notifications" && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bell size={20} className="text-red-500" />
                    Fikr-mulohazalar
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Foydalanuvchilardan kelgan xabar va takliflar.
                  </p>
                </div>
                <button
                  onClick={loadFeedback}
                  disabled={feedbackLoading}
                  className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white transition"
                >
                  <RefreshCw size={16} className={feedbackLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {feedbackLoading ? (
                <div className="py-12 text-center text-sm text-neutral-500">Yuklanmoqda...</div>
              ) : feedbackList.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Bildirishnomalar mavjud emas.
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border transition ${
                        f.read
                          ? "border-neutral-800/60 bg-neutral-900/20 text-neutral-400"
                          : "border-red-500/30 bg-red-950/10 text-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className={f.read ? "text-neutral-500" : "text-red-400"} />
                          <span className="font-semibold text-white">{f.userName || f.email || "Foydalanuvchi"}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          {formatFeedbackDate(f.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mb-3 whitespace-pre-wrap">{f.message}</p>
                      <button
                        onClick={() => toggleFeedbackRead(f.id, f.read)}
                        disabled={feedbackActionLoading === f.id}
                        className="text-xs text-neutral-400 hover:text-white underline transition"
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
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 max-w-xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Settings size={20} className="text-red-500" />
                Tizim sozlamalari
              </h2>
              <p className="text-sm text-neutral-400 mb-6">
                Husma loyallik kartasi tizimi va administrator profili sozlamalari.
              </p>
              <div className="space-y-4 text-sm text-neutral-300 mb-8">
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                  <span>Administrator:</span>
                  <span className="font-semibold text-white">{user.name} ({user.email})</span>
                </div>
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 flex justify-between items-center">
                  <span>Tizim versiyasi:</span>
                  <span className="font-semibold text-white">v1.0.0</span>
                </div>
              </div>

              {/* Profil / xavfsizlik: telefon va parolni o'zgartirish */}
              <form
                onSubmit={updateProfile}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Telefon raqami va parol
                  </h3>
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
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
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                  />
                  <p className="text-[11px] text-neutral-600 mt-1.5">
                    Faqat parolni o'zgartirmoqchi bo'lsangiz kerak.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
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
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-red-500/50 transition"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                    <AlertCircle size={14} className="shrink-0" />
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300">
                    <CheckCircle2 size={14} className="shrink-0" />
                    {profileSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
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
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./karusel/page";
import {
  QrCode,
  Gift,
  Sparkles,
  Users,
  Cake,
  Smartphone,
  ArrowRight,
  Star,
  Zap,
  Coins,
  ShieldCheck,
  Rocket,
  ChevronDown,
  Flame,
  Crown,
  Percent,
} from "lucide-react";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function FaqList() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 divide-y divide-neutral-800/80 overflow-hidden">
      {FAQ.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 text-left px-4 sm:px-6 py-4 sm:py-4.5 hover:bg-neutral-900/70 active:bg-neutral-900 transition-colors min-h-[52px]"
            >
              <span className="text-sm sm:text-base font-medium text-white leading-snug pr-2">
                {item.q}
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-neutral-500 transition-transform duration-300 ${
                  open ? "rotate-180 text-amber-400" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm text-neutral-400 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STEPS = [
  {
    num: "01",
    title: "Ilovani o'rnating va kartani oching",
    desc: "1 daqiqada ro'yxatdan o'ting — 50 000 so'm chegirma va start bonusiga ega bo'ling.",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Xaridlardan coin yig'ing",
    desc: "Har bir 1000 so'm sarf-xarajat uchun 1 coin avtomatik ravishda hisobingizga tushadi.",
    icon: QrCode,
  },
  {
    num: "03",
    title: "Darajani oshiring va sovg'alar oling",
    desc: "To'plangan coinlar evaziga darajangizni oshiring, VIP xizmatlar hamda eksklyuziv sovg'alarga ega bo'ling.",
    icon: Gift,
  },
];

const FEATURES = [
  {
    title: "Coin to'plash",
    desc: "Har bir 1000 so'm sarflangan xarid uchun 1 coin hisoblanadi (Husma Fit va Mavi restorani bilan birga).",
    icon: Coins,
  },
  {
    title: "Sovg'alar va Chegirmalar",
    desc: "Mavi restorani, Spa, fitnes hamda xonalar uchun eksklyuziv chegirmalardan foydalaning.",
    icon: Gift,
  },
  {
    title: "Welcome bonus",
    desc: "Ilovani o'rnatishingiz bilan 50 000 so'm chegirma balansingizga taqdim etiladi.",
    icon: Sparkles,
  },
  {
    title: "Do'stlarni taklif qiling",
    desc: "Do'stingiz kartani ochsa — ikkalangizga ham qo'shimcha bonus coinlar tushadi.",
    icon: Users,
  },
  {
    title: "Tug'ilgan kun sovg'asi",
    desc: "Har yili tug'ilgan kuningizda maxsus coin paketi va kutilmagan sovg'alar.",
    icon: Cake,
  },
  {
    title: "Har doim telefoningizda",
    desc: "Plastik karta kerak emas. Barcha darajalar, coinlar va chegirmalar smartfoningizda.",
    icon: Smartphone,
  },
];

// MUHIM: bu yerdagi nomlar va coin narxlari `/sovgalar` sahifasidagi
// haqiqiy katalog (GIFTS massivi, sovgalar/page.js) bilan bir xil
// bo'lishi kerak — endi 1 coin = 1 so'm tizimi ishlayapti.
const GIFTS = [
  { name: "Bepul nonushta (1 kishi)", coins: 80000, icon: "🥐" },
  { name: "Kech chiqish (Late checkout)", coins: 100000, icon: "🕒" },
  { name: "Orqa massaji (30 min)", coins: 250000, icon: "💆" },
  { name: "Xona darajasini oshirish", coins: 500000, icon: "⬆️" },
  { name: "1 kecha bepul turar joy", coins: 900000, icon: "🏨" },
  { name: "Presidential Suite — 1 kecha", coins: 5000000, icon: "👑" },
];

function formatCoins(n) {
  return (Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const LAUNCH_PERKS = [
  {
    title: "50 000 so'm Welcome Chegirma",
    desc: "Ilovani o'rnatganingizda Husma, Husma Fit va Mavi restoranida amal qiladigan chegirma.",
    icon: Flame,
  },
  {
    title: "Chorsiz to'plash",
    desc: "Har 1000 so'm uchun 1 coin tushadi va darajalarga tezroq erishishga yordam beradi.",
    icon: Star,
  },
  {
    title: "Ertaroq kirish",
    desc: "Yangi sovg'alar, xonalar va maxsus aksiyalarga birinchilardan bo'lib kirish huquqi.",
    icon: Rocket,
  },
];

const LEVELS = [
  {
    name: "Standard",
    coinsReq: "0 coin",
    color: "from-neutral-700/30 to-neutral-900/10",
    border: "border-neutral-600/40",
    text: "text-neutral-300",
    badge: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
    perks: [
      "50 000 so'm chegirma (Ilovani o'rnatganda)",
      "Husma Fit va Mavi restoranida amal qiladi",
      "Har 1000 so'm uchun 1 coin",
    ],
  },
  {
    name: "Bronze",
    coinsReq: "99 000 coin",
    color: "from-amber-800/30 to-amber-950/10",
    border: "border-amber-700/40",
    text: "text-amber-400",
    badge: "bg-amber-600/15 text-amber-400 border-amber-600/30",
    perks: [
      "VIP 1 meva savati (kelganda xonada)",
      "Kir yuvish xizmatiga 5% chegirma",
      "Husma Spa va Fitness'da 5% chegirma",
    ],
  },
  {
    name: "Silver",
    coinsReq: "199 000 coin",
    color: "from-slate-400/20 to-slate-800/10",
    border: "border-slate-400/40",
    text: "text-slate-300",
    badge: "bg-slate-400/15 text-slate-300 border-slate-400/30",
    perks: [
      "Xonalarni bepul upgrade qilish (joy bo'lsa)",
      "Xonalarga 5% chegirma",
      "Mavi restoranida 5% chegirma",
      "VIP 2 meva savati xonada",
    ],
  },
  {
    name: "Gold",
    coinsReq: "399 000 coin",
    color: "from-yellow-600/25 to-yellow-900/10",
    border: "border-yellow-500/40",
    text: "text-yellow-300",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    perks: [
      "Erta kirish / kech chiqish (joy bo'lsa)",
      "Aeroport/Vokzalga bepul kuzatib qo'yish",
      "Xonalarga 10% chegirma",
      "Mavi va Kir yuvishga 10% chegirma",
      "VIP 3 meva savati xonada",
    ],
  },
  {
    name: "Platinum",
    coinsReq: "599 000 coin",
    color: "from-cyan-600/20 to-cyan-900/10",
    border: "border-cyan-500/40",
    text: "text-cyan-300",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    perks: [
      "Kafolatlangan erta kirish / kech chiqish",
      "Kafolatlangan xona upgrade",
      "Business Class aeroport/vokzal transfer",
      "Xonaga 10%, Kir yuvishga 20% chegirma",
      "Mavi restoranida 10% chegirma",
      "VIP 4 meva savati + Ketishda Level 1 sovg'a 🎁",
    ],
  },
  {
    name: "Diamond",
    coinsReq: "799 000 coin",
    color: "from-sky-600/20 to-sky-950/10",
    border: "border-sky-400/50",
    text: "text-sky-300",
    badge: "bg-sky-500/15 text-sky-300 border-sky-400/40",
    perks: [
      "Erta kirish / kech chiqish",
      "Suit xonasiga bepul upgrade (joy bo'lsa)",
      "Business Class aeroport/vokzal transfer",
      "Xonalarga 15%, Mavi'da 10% chegirma",
      "Kuniga 2 dona bepul kir yuvish xizmati",
      "VIP 5 meva savati (har kuni yangilanadi)",
      "Ketishda Level 2 sovg'a 🎁",
    ],
  },
  {
    name: "VIP",
    coinsReq: "999 000 coin",
    color: "from-rose-600/25 to-purple-950/20",
    border: "border-rose-500/50",
    text: "text-rose-300",
    badge: "bg-rose-500/15 text-rose-300 border-rose-400/40",
    perks: [
      "Erta kirish / kech chiqish",
      "Suit xonasiga bepul upgrade (joy bo'lsa)",
      "Business Class aeroport/vokzal transfer",
      "Xonalarga 15%, Mavi'da 15% chegirma",
      "Mutlaqo bepul kir yuvish xizmatlari",
      "VIP 6 meva savati (har kuni yangilanadi)",
      "Ketishda Level 3 sovg'a 🎁",
    ],
  },
];

const FAQ = [
  {
    q: "Karta uchun to'lov kerakmi?",
    a: "Yo'q. Ro'yxatdan o'tish va kartani ochish butunlay bepul.",
  },
  {
    q: "Coinlar qanday hisoblanadi?",
    a: "Har bir sarflangan 1000 so'm uchun hisobingizga 1 coin qo'shiladi.",
  },
  {
    q: "50 000 so'm chegirma bonusidan qayerda foydalansa bo'ladi?",
    a: "Ushbu chegirma ilovani o'rnatishingiz bilan beriladi va Husma hotel, Husma Fit hamda Mavi restoranida amal qiladi.",
  },
  {
    q: "Darajalar (Bronze, Silver...) qanday oshadi?",
    a: "Yetarlicha coin yig'ganingizdan so'ng mos darajaga ko'tarilasiz (masalan, 99 000 coin bilan Bronze, 999 000 coin bilan VIP darajasiga ega bo'lasiz).",
  },
];

export default function Home() {
  return (
    <main className="relative flex flex-1 w-full flex-col bg-neutral-950 min-h-screen text-neutral-100 overflow-x-hidden">
      <Header />

      <HeroSection />

      {/* ===== LAUNCH / FOUNDING ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 lg:pt-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-950 p-5 sm:p-7 lg:p-8">
            <div className="absolute -top-16 -right-16 w-48 sm:w-56 h-48 sm:h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium text-amber-400 mb-3 sm:mb-4">
                <Rocket size={12} />
                Endigina ishga tushdi
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 leading-snug">
                Birinchilardan bo&apos;ling — Eksklyuziv imtiyozlarni qo&apos;lga kiriting
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-lg mb-5 sm:mb-6 leading-relaxed">
                Husma sodiqlik kartasini oching, har 1000 so'mga 1 coin to'plang va maxsus VIP darajalariga erishing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {LAUNCH_PERKS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.title} className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-white mb-0.5">
                          {p.title}
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== DARAJA ===== */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16">
        <Reveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-amber-400 mb-3 sm:mb-4">
              <Crown size={12} />
              Darajalar
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 leading-snug">
              Husma Card darajalari — qancha yuqori, shuncha ko&apos;p VIP imtiyozlar
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Coinlar yig'ib borish orqali darajangizni oshiring. Har bir daraja o&apos;zining maxsus chegirma va bonuslariga ega.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {LEVELS.map((level, i) => (
            <Reveal key={level.name} delay={i * 60}>
              <div
                className={`relative h-full flex flex-col justify-between rounded-2xl border ${level.border} bg-gradient-to-br ${level.color} p-5 sm:p-6 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
                    <h3 className={`text-base sm:text-lg font-semibold ${level.text}`}>
                      {level.name}
                    </h3>
                    <span
                      className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${level.badge}`}
                    >
                      {level.coinsReq}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-4">
                    {level.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300"
                      >
                        <Zap size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={280}>
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 hover:border-amber-400/60 active:scale-[0.98] transition-all"
            >
              Kartani ochish va darajani oshirish
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ===== QANDAY ISHLAYDI ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
        <Reveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-red-400 mb-3 sm:mb-4">
              <Zap size={12} />
              Oddiy jarayon
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 leading-snug">
              Qanday ishlaydi?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Oddiy 3 qadam — coin to&apos;plang va VIP darajalar hamda sovg&apos;alarga almashtiring.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.num} delay={i * 100}>
                <div className="relative group h-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 sm:p-6 hover:border-red-500/30 hover:bg-neutral-900/70 hover:-translate-y-1 active:scale-[0.99] transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 group-hover:scale-110 transition-all">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <span className="text-xs font-medium text-neutral-500 tracking-wider">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== SOVG'ALAR ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16">
        <Reveal>
          <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-red-400 mb-3 sm:mb-4">
                <Gift size={12} />
                Catalog
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 leading-snug">
                Sovg&apos;alar catalogi
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
                Coinlaringizni quyidagi sovg&apos;alarga almashtiring.
              </p>
            </div>
            <Link
              href="/sovgalar"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 active:text-red-200 transition-colors group self-start sm:self-auto py-1"
            >
              Barchasini ko&apos;rish
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {GIFTS.map((g, i) => (
            <Reveal key={g.name} delay={i * 50}>
              <div className="relative rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 sm:p-5 hover:border-amber-500/30 hover:bg-neutral-900/70 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer overflow-hidden">
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-950 border border-neutral-800/80" />
                <div className="text-xl sm:text-2xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform origin-left">
                  {g.icon}
                </div>
                <h3 className="font-medium text-white text-xs sm:text-sm mb-1 group-hover:text-amber-300 transition-colors leading-snug">
                  {g.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Coins size={11} />
                  {formatCoins(g.coins)} coin
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== AFZALLIKLAR ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16">
        <Reveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
              <Star size={12} />
              Afzalliklar
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 leading-snug">
              Nima uchun Husma kartasi?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Husma tizimi — shaffof, tushunarli va real foyda beruvchi imtiyozlar majmuasi.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 50}>
                <div className="h-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 sm:p-6 hover:border-neutral-700 hover:bg-neutral-900/70 active:scale-[0.99] transition-all duration-300 group">
                  <div className="h-11 w-11 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-300 mb-3 sm:mb-4 group-hover:border-red-500/30 group-hover:text-red-400 transition-colors">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-medium text-white mb-1.5 text-base">{f.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16">
        <Reveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-3 sm:mb-4">
              <Star size={12} />
              Savol-javob
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 leading-snug">
              Ko&apos;p beriladigan savollar
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Savollaringiz bo'lsa, javoblarni shu yerdan topishingiz mumkin.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <FaqList />
        </Reveal>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-14 lg:py-16 pb-28 sm:pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/70 via-neutral-900 to-neutral-950 p-6 sm:p-10 lg:p-12">
            <div className="absolute -top-24 -right-24 w-56 sm:w-72 h-56 sm:h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 sm:w-56 h-44 sm:h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 mb-3 sm:mb-4">
                  <Sparkles size={12} />
                  Welcome bonus
                </div>
                <h2 className="text-lg sm:text-xl lg:text-3xl font-semibold text-white mb-3 leading-snug">
                  Bugun kartani oching —{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
                    50 000 so'm chegirma
                  </span>{" "}
                  darhol sizniki
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-3 sm:mb-4">
                  Ro&apos;yxatdan o&apos;tish bepul. Bonus balansingizga taqdim etiladi.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  Ma&apos;lumotlaringiz xavfsiz saqlanadi
                </div>
              </div>

              <Link
                href="/register"
                className="w-full sm:w-auto shrink-0 group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-neutral-900 font-medium text-sm hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-xl shadow-black/40"
              >
                Bepul karta + 50 000 so'm
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Mobil bottom nav ===== */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-neutral-800/80 p-2.5 shadow-2xl shadow-black/50">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center h-12 rounded-xl bg-amber-400 text-neutral-950 active:scale-95 active:bg-amber-300 transition-all"
            aria-label="Bosh sahifa"
          >
            <Star size={22} strokeWidth={2.2} />
          </Link>
          <Link
            href="/xonalar"
            className="flex-1 flex items-center justify-center h-12 rounded-xl bg-amber-400 text-neutral-950 active:scale-95 active:bg-amber-300 transition-all"
            aria-label="Xonalar"
          >
            <Percent size={22} strokeWidth={2.2} />
          </Link>
          <Link
            href="/sovgalar"
            className="flex-1 flex items-center justify-center h-12 rounded-xl bg-amber-400 text-neutral-950 active:scale-95 active:bg-amber-300 transition-all"
            aria-label="Sovg'alar"
          >
            <Gift size={22} strokeWidth={2.2} />
          </Link>
          <Link
            href="/karta"
            className="flex-1 flex items-center justify-center h-12 rounded-xl bg-amber-400 text-neutral-950 active:scale-95 active:bg-amber-300 transition-all"
            aria-label="Daraja / Karta"
          >
            <Crown size={22} strokeWidth={2.2} />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
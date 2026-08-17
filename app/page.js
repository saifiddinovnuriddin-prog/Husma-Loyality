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
} from "lucide-react";

/* ---------------------------------------------------------
   Scroll-reveal helper
--------------------------------------------------------- */
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
      { threshold: 0.15 }
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
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-neutral-900/70 transition-colors"
            >
              <span className="text-sm sm:text-base font-medium text-white">
                {item.q}
              </span>
              <ChevronDown
                size={16}
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
                <p className="px-5 sm:px-6 pb-4 text-sm text-neutral-400 leading-relaxed">
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
    title: "Kartani oching",
    desc: "1 daqiqada ro'yxatdan o'ting — telefon raqamingiz yetarli. Darhol 50 coin olasiz.",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "QR-kodni ko'rsating",
    desc: "Mehmonxonada yoki to'lovda QR-kodingizni ko'rsating — coinlar avtomatik tushadi.",
    icon: QrCode,
  },
  {
    num: "03",
    title: "Coinlarni sovg'aga almashtiring",
    desc: "To'plangan coinlaringizni catalogdan sovg'alarga almashtiring.",
    icon: Gift,
  },
];

const FEATURES = [
  {
    title: "Coin to'plash",
    desc: "Har bir tun va xizmat uchun coin olasiz. Darajangiz qancha yuqori bo'lsa — shuncha tezroq.",
    icon: Coins,
  },
  {
    title: "Sovg'alar catalogi",
    desc: "Coinlarni bepul nonushta, kech chiqish, spa yoki maxsus sovg'alarga almashtiring.",
    icon: Gift,
  },
  {
    title: "Welcome bonus",
    desc: "Kartani ochganingiz zahoti 50 coin olasiz — birinchi sovg'angizga qarab boring.",
    icon: Sparkles,
  },
  {
    title: "Do'stlarni taklif qiling",
    desc: "Do'stingiz kartani ochsa — ikkalangizga ham qo'shimcha coin tushadi.",
    icon: Users,
  },
  {
    title: "Tug'ilgan kun sovg'asi",
    desc: "Har yili tug'ilgan kuningizda maxsus coin paketi va sovg'a.",
    icon: Cake,
  },
  {
    title: "Har doim telefoningizda",
    desc: "Plastik karta kerak emas. Barcha coinlar va sovg'alar telefoningizda.",
    icon: Smartphone,
  },
];

const GIFTS = [
  { name: "Bepul nonushta", coins: "80", icon: "🍳" },
  { name: "Kech chiqish (14:00)", coins: "120", icon: "🕐" },
  { name: "Spa 30 daqiqa", coins: "200", icon: "💆" },
  { name: "Room upgrade", coins: "350", icon: "⬆️" },
  { name: "1 tun bepul", coins: "800", icon: "🛏️" },
  { name: "VIP to'plam", coins: "1500", icon: "👑" },
];

const LAUNCH_PERKS = [
  {
    title: "2x coin",
    desc: "Ochilish davrida to'plangan har bir coin ikki baravar hisoblanadi.",
    icon: Flame,
  },
  {
    title: "Doimiy status",
    desc: "Birinchi 500 a'zo umrbod \"Founding member\" belgisini saqlab qoladi.",
    icon: Star,
  },
  {
    title: "Ertaroq kirish",
    desc: "Yangi sovg'alar va funksiyalarga ommaga chiqishidan oldin kirasiz.",
    icon: Rocket,
  },
];

const LEVELS = [
  {
    name: "Bronza",
    multiplier: "3x",
    color: "from-neutral-400/15 to-neutral-700/10",
    border: "border-neutral-400/40",
    text: "text-neutral-200",
    badge: "bg-neutral-500/15 text-neutral-300 border-neutral-400/30",
    perks: [
      "Har tun 3x coin",
      "Bronza lounge",
      "Maxsus sovg‘alar",
    ],
  },
  {
    name: "PLATINUM",
    multiplier: "3x",
    color: "from-neutral-400/15 to-neutral-700/10",
    border: "border-neutral-400/40",
    text: "text-neutral-200",
    badge: "bg-neutral-500/15 text-neutral-300 border-neutral-400/30",
    perks: [
      "Har tun 3x coin",
      "VIP lounge",
      "Maxsus sovg‘alar",
    ],
  },
  {
    name: "GOLD",
    multiplier: "2x",
    color: "from-yellow-600/25 to-yellow-900/10",
    border: "border-yellow-500/40",
    text: "text-yellow-300",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    perks: [
      "Har tun 2x coin",
      "Spa chegirma",
      "Room upgrade imkoniyati",
    ],
  },
  {
    name: "Diamond",
    multiplier: "1.5x",
    color: "from-amber-700/30 to-amber-900/10",
    border: "border-amber-600/40",
    text: "text-amber-300",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    perks: [
      "Har tun 1.5x coin",
      "Bepul nonushta imkoniyati",
      "Priority support",
    ],
  },
];

const FAQ = [
  {
    q: "Karta uchun to'lov kerakmi?",
    a: "Yo'q. Ro'yxatdan o'tish butunlay bepul, telefon raqamingizni kiritish yetarli.",
  },
  {
    q: "Coinlar qachon hisobimga tushadi?",
    a: "QR-kodingiz skanerlangan zahoti — bir necha soniya ichida avtomatik tushadi.",
  },
  {
    q: "Coinlarning amal qilish muddati bormi?",
    a: "Hozircha coinlar muddatsiz saqlanadi, xohlagan vaqtingizda sovg'aga almashtirishingiz mumkin.",
  },
];

export default function Home() {
  return (
    <main className="relative flex flex-1 w-full flex-col bg-neutral-950 min-h-screen text-neutral-100 overflow-x-hidden">
      <Header />

      <HeroSection />

      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 sm:pt-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-950 p-6 sm:p-8">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 mb-4">
                <Rocket size={12} />
                Endigina ishga tushdi
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                Birinchilardan bo&apos;ling — Founding member imtiyozlarini oling
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-lg mb-6">
                Husma kartasi hozir ochilish bosqichida. Shu davrda qo&apos;shilganlar
                quyidagi maxsus imtiyozlarga ega bo&apos;ladi.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LAUNCH_PERKS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.title} className="flex items-start gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Icon size={16} strokeWidth={1.8} />
                      </div>
                      <div>
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

{/* ===== 3 DARAJA ===== */}
<section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
  <Reveal>
    <div className="mb-10 sm:mb-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-amber-400 mb-4">
        <Crown size={12} />
        Darajalar
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
        3 ta daraja — qancha yuqori, shuncha ko‘p coin
      </h2>
      <p className="text-neutral-400 text-sm sm:text-base max-w-lg">
        Har bir daraja o‘z multiplikatori va maxsus imtiyozlariga ega.
        Ko‘proq qoling — darajangiz oshadi.
      </p>
    </div>
  </Reveal>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {LEVELS.map((level, i) => (
      <Reveal key={level.name} delay={i * 90}>
        <div
          className={`relative h-full rounded-2xl border ${level.border} bg-gradient-to-br ${level.color} p-6 hover:-translate-y-1 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-lg font-semibold ${level.text}`}>
              {level.name}
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${level.badge}`}
            >
              {level.multiplier}
            </span>
          </div>

          <ul className="space-y-2.5">
            {level.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2.5 text-sm text-neutral-300"
              >
                <Zap size={14} className="text-amber-400 shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    ))}
  </div>

  {/* Pastki strelkali tugma */}
  <Reveal delay={300}>
    <div className="mt-10 flex justify-center">
      <Link
        href="/login"
        className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 hover:border-amber-400/60 transition-all"
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
      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
        <Reveal>
          <div className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-red-400 mb-4">
              <Zap size={12} />
              Oddiy jarayon
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
              Qanday ishlaydi?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg">
              Oddiy 3 qadam — coin to&apos;plang va sovg&apos;alarga almashtiring.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.num} delay={i * 100}>
                <div className="relative group h-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 hover:border-red-500/30 hover:bg-neutral-900/70 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 group-hover:scale-110 transition-all">
                      <Icon size={18} strokeWidth={1.8} />
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
      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
        <Reveal>
          <div className="mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-red-400 mb-4">
                <Gift size={12} />
                Catalog
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                Sovg&apos;alar catalogi
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-lg">
                Coinlaringizni quyidagi sovg&apos;alarga almashtiring. Catalog doim
                yangilanadi.
              </p>
            </div>
            <Link
              href="/sovgalar"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors group"
            >
              Barchasini ko&apos;rish
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {GIFTS.map((g, i) => (
            <Reveal key={g.name} delay={i * 60}>
              <div className="relative rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 hover:border-amber-500/30 hover:bg-neutral-900/70 hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden">
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-950 border border-neutral-800/80" />
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">
                  {g.icon}
                </div>
                <h3 className="font-medium text-white text-sm mb-1 group-hover:text-amber-300 transition-colors">
                  {g.name}
                </h3>
                <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Coins size={11} />
                  {g.coins} coin
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== AFZALLIKLAR ===== */}
      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
        <Reveal>
          <div className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/40 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-4">
              <Star size={12} />
              Afzalliklar
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
              Nima uchun Husma kartasi?
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg">
              Coin tizimi — sodda, tushunarli va haqiqiy foyda beradi.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 sm:p-6 hover:border-neutral-700 hover:bg-neutral-900/70 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-neutral-300 mb-4 group-hover:border-red-500/30 group-hover:text-red-400 transition-colors">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-medium text-white mb-1.5">{f.title}</h3>
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
      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
        <Reveal>
          <div className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/40 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-4">
              <Star size={12} />
              Savol-javob
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
              Ko&apos;p beriladigan savollar
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base max-w-lg">
              Aniq bo&apos;lmagan narsa bormi? Javobini shu yerdan toping.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <FaqList />
        </Reveal>
      </section>

      {/* ===== CTA ===== */}
      <section className="w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-16 pb-28 sm:pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/70 via-neutral-900 to-neutral-950 p-8 sm:p-12">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-400 mb-4">
                  <Sparkles size={12} />
                  Welcome bonus
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-3 leading-snug">
                  Bugun kartani oching —{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
                    50 coin
                  </span>{" "}
                  darhol sizniki
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                  Ro&apos;yxatdan o&apos;tish bepul. Telefon raqamingiz yetarli.
                  Coinlar darhol hisobingizga tushadi.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Ma&apos;lumotlaringiz xavfsiz saqlanadi
                </div>
              </div>

              <Link
                href="/register"
                className="shrink-0 group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-neutral-900 font-medium text-sm hover:bg-neutral-100 transition-all shadow-xl shadow-black/40 active:scale-[0.98]"
              >
                Bepul karta + 50 coin
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== Mobil sticky CTA ===== */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-neutral-950/90 backdrop-blur border-t border-neutral-800/80">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-neutral-900 font-medium text-sm active:scale-[0.98] transition-transform"
        >
          Bepul karta + 50 coin
          <ArrowRight size={16} />
        </Link>
      </div>

      <Footer />
    </main>
  );
}
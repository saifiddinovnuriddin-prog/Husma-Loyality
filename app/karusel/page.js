'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Crown,
  Percent,
  Gift,
  Star,
  Wifi,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const cards = [
  {
    id: 1,
    name: 'HUSMA',
    level: 'STANDARD',
    short: 'STANDARD',
    number: '•••• 1024',
    gradient: 'linear-gradient(135deg, #A1A1AA 0%, #71717A 45%, #3F3F46 100%)',
    text: '#18181B',
  },
  {
    id: 2,
    name: 'HUSMA',
    level: 'BRONZE',
    short: 'BRONZE',
    number: '•••• 4021',
    gradient: 'linear-gradient(135deg, #F0D28C 0%, #D4A24C 45%, #9C7326 100%)',
    text: '#2A1B04',
  },
  {
    id: 3,
    name: 'HUSMA',
    level: 'SILVER',
    short: 'SILVER',
    number: '•••• 5832',
    gradient: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 45%, #64748B 100%)',
    text: '#0F172A',
  },
  {
    id: 4,
    name: 'HUSMA',
    level: 'GOLD',
    short: 'GOLD',
    number: '•••• 8743',
    gradient: 'linear-gradient(135deg, #E8C547 0%, #C9A227 45%, #8B6914 100%)',
    text: '#1F1500',
  },
  {
    id: 5,
    name: 'HUSMA',
    level: 'PLATINUM',
    short: 'PLATINUM',
    number: '•••• 2198',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 45%, #7A7A7A 100%)',
    text: '#1A1A1A',
  },
  {
    id: 6,
    name: 'HUSMA',
    level: 'DIAMOND',
    short: 'DIAMOND',
    number: '•••• 6611',
    gradient: 'linear-gradient(135deg, #E0F7FA 0%, #80DEEA 45%, #00838F 100%)',
    text: '#002B36',
  },
  {
    id: 7,
    name: 'HUSMA',
    level: 'VIP',
    short: 'VIP',
    number: '•••• 9999',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #DB2777 45%, #9D174D 100%)',
    text: '#1F0A14',
  },
]

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

// Oldingi va keyingi indexlarni hisoblash
const getCardStyle = (index) => {
  const diff = (index - activeIndex + cards.length) % cards.length
  const normalizedDiff = diff > cards.length / 2 ? diff - cards.length : diff

  if (normalizedDiff === 0) {
    // Markaziy (faol) karta
    return {
      transform: 'translateX(0) translateY(0) rotate(-6deg) scale(1)',
      opacity: 1,
      zIndex: 30,
      filter: 'brightness(1)',
    }
  }
  if (normalizedDiff === 1 || normalizedDiff === -cards.length + 1) {
    // Keyingi karta (o‘ngda)
    return {
      transform: 'translateX(42px) translateY(12px) rotate(8deg) scale(0.88)',
      opacity: 0.55,
      zIndex: 20,
      filter: 'brightness(0.7)',
    }
  }
  if (normalizedDiff === -1 || normalizedDiff === cards.length - 1) {
    // Oldingi karta (chapda)
    return {
      transform: 'translateX(-42px) translateY(12px) rotate(-18deg) scale(0.88)',
      opacity: 0.55,
      zIndex: 20,
      filter: 'brightness(0.7)',
    }
  }
  // Qolganlari yashirin
  return {
    transform: 'translateX(0) scale(0.7)',
    opacity: 0,
    zIndex: 10,
    filter: 'brightness(0.5)',
  }
}

  return (
    <section className="relative min-h-[520px] max-w-[1250px] w-full mx-auto bg-neutral-950 px-4 py-8 sm:px-6 lg:px-12 flex items-center justify-center overflow-visible">
      <style>{`
        @keyframes husma-shine {
          0% { transform: translateX(-120%) rotate(20deg); }
          60%, 100% { transform: translateX(160%) rotate(20deg); }
        }
        .husma-shine { animation: husma-shine 3.6s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/25 via-neutral-950 to-neutral-950 pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-red-800/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1240px] rounded-[24px] border border-neutral-800/80 bg-gradient-to-br from-[#1F1218] via-[#170C13] to-[#0D070B] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 shadow-2xl overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left content */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-[11px] font-medium uppercase tracking-widest text-red-400 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Mehmonlar kartasi • Coin tizimi
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-white">
              Har bir tunni{' '}
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                coinga
              </span>{' '}
              aylantiring — Husma bilan!
            </h1>

            <p className="max-w-lg text-sm sm:text-base leading-relaxed text-neutral-400">
              Husma kartangiz bilan har bir to‘lovingiz coin beradi.
              Coinlarni yig‘ib, bepul nonushta, spa, room upgrade va boshqa maxsus sovg‘alarga almashtiring.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium text-xs sm:text-sm hover:bg-red-500 transition-all shadow-md shadow-red-600/20 hover:shadow-red-500/30 active:scale-95"
              >
                <Sparkles size={15} />
                Karta ochish + 50 coin
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/sovgalar"
                className="px-5 py-2.5 rounded-lg border border-neutral-700 text-xs sm:text-sm font-medium text-neutral-300 hover:bg-neutral-900 hover:border-neutral-500 transition-all"
              >
                Sovg‘alarni ko‘rish
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800/80 mt-2 w-full">
              <div>
                <div className="text-xl font-semibold text-white">7</div>
                <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">Daraja</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-amber-400">50</div>
                <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">Welcome coin</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-red-500">2x–3x</div>
                <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider">Multiplikator</div>
              </div>
            </div>
          </div>

          {/* Right – Phone + 3D Carousel */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center pt-6 lg:pt-0">
            <div className="relative w-[220px] mt-20 mb-12">
              
              {/* Phone */}
              <div className="relative w-[220px] h-[440px] rounded-[32px] bg-gradient-to-b from-[#2D1B24] to-[#140A10] border-[5px] border-[#0A0508] shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#0A0508] rounded-b-xl z-20" />

                <div className="flex items-center justify-between px-4 pt-5 text-neutral-400 text-[10px] font-medium">
                  <Wifi size={12} />
                  <span className="tracking-wider text-neutral-300">HUSMA APP</span>
                  <span>100%</span>
                </div>

                <div className="mt-6 px-4">
                  <div className="text-[11px] font-medium text-neutral-400 mb-2">Mening kartam</div>
                  
                  <div
                    className="h-28 rounded-xl border border-white/10 p-3 flex flex-col justify-between transition-all duration-500"
                    style={{ background: cards[activeIndex].gradient }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold" style={{ color: cards[activeIndex].text }}>
                        HUSMA {cards[activeIndex].short}
                      </span>
                      <ShieldCheck size={14} style={{ color: cards[activeIndex].text }} />
                    </div>
                    <div>
                      <div className="text-[9px] opacity-70" style={{ color: cards[activeIndex].text }}>
                        Balans
                      </div>
                      <div className="text-sm font-semibold" style={{ color: cards[activeIndex].text }}>
                        1,250 COIN
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="h-2.5 w-3/4 rounded-full bg-neutral-800/80" />
                    <div className="h-2.5 w-1/2 rounded-full bg-neutral-800/50" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  {[Star, Percent, Gift, Crown].map((Icon, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md shadow-amber-500/20"
                    >
                      <Icon size={14} strokeWidth={2.5} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ===== 3D CARD CAROUSEL ===== */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[130px] z-30">
                {cards.map((card, index) => {
                  const style = getCardStyle(index)
                  return (
                    <div
                      key={card.id}
                      className="absolute inset-0 rounded-xl p-3.5 flex flex-col justify-between overflow-hidden transition-all duration-500 ease-out cursor-pointer"
                      style={{
                        background: card.gradient,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
                        ...style,
                      }}
                      onClick={() => setActiveIndex(index)}
                    >
                      {/* Shine */}
                      <div className="husma-shine absolute -top-10 -left-10 w-14 h-[280%] bg-white/35 blur-md pointer-events-none" />

                      <div className="flex items-center justify-between relative z-10">
                        <span
                          className="font-serif font-bold text-xs tracking-wider"
                          style={{ color: card.text }}
                        >
                          {card.name}
                        </span>
                        <Crown size={15} style={{ color: card.text }} strokeWidth={2.5} />
                      </div>

                      {/* Chip */}
                      <div
                        className="h-4 w-7 rounded border relative z-10"
                        style={{
                          backgroundColor: `${card.text}22`,
                          borderColor: `${card.text}33`,
                        }}
                      />

                      <div className="flex items-center justify-between relative z-10">
                        <span
                          className="text-[10px] font-mono font-semibold tracking-[0.15em]"
                          style={{ color: card.text }}
                        >
                          {card.number}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: `${card.text}cc` }}
                        >
                          {card.level}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dots */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? 'w-5 bg-red-500'
                        : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUserCoins, createRedemption } from "@/lib/db";

// MUHIM: bu ro'yxat frontenddagi (app/sovgalar/page.js) GIFTS ro'yxati
// bilan AYNAN bir xil bo'lishi kerak — id va coins mos kelmasa,
// "Sovg'a topilmadi" xatosi chiqadi.
const GIFTS = [
  // --- SPA VA BASSEYN ---
  { id: 101, name: "Fitnes zal (1 kunlik)", coins: 100000 },
  { id: 102, name: "Basseyn (1 kunlik)", coins: 140000 },
  { id: 103, name: "Fitnes + Basseyn (1 kunlik)", coins: 200000 },
  { id: 104, name: "To'liq SPA Kompleks", coins: 250000 },
  { id: 105, name: "Ozdorovitelny massaj (60 min)", coins: 450000 },
  { id: 106, name: "Aroma terapiya massaji (60 min)", coins: 500000 },
  { id: 107, name: "Sport massaji (45 min)", coins: 400000 },
  { id: 108, name: "Ognenniy (Olovli) massaj (50 min)", coins: 400000 },
  { id: 109, name: "Orqa massaji (30 min)", coins: 250000 },
  { id: 110, name: "Asalli (Medovyy) massaj (40 min)", coins: 400000 },
  { id: 111, name: "Shokoladli massaj (40 min)", coins: 400000 },
  { id: 112, name: "Piling + Skrab + Yuvinish (30 min)", coins: 400000 },
  { id: 113, name: "Ko'pikli yuvinish (30 min)", coins: 250000 },
  { id: 114, name: "Kompleks massaj (90 min)", coins: 850000 },
  { id: 115, name: "Bolalar suzishi (12 marta)", coins: 600000 },
  { id: 116, name: "SPA Abonement (1 Oy)", coins: 1600000 },

  // --- MAVI RESTORANT ---
  { id: 201, name: "Xush kelibsiz meva savati", coins: 50000 },
  { id: 202, name: "Bepul nonushta (1 kishi)", coins: 80000 },
  { id: 203, name: "Kechki ovqat 2 kishiga", coins: 400000 },

  // --- HUSMA HOTEL ---
  { id: 301, name: "Kech chiqish (Late checkout)", coins: 100000 },
  { id: 302, name: "Kir yuvish xizmati", coins: 60000 },
  { id: 303, name: "Aeroportdan olib ketish (Transfer)", coins: 250000 },
  { id: 304, name: "Xona darajasini oshirish", coins: 500000 },
  { id: 305, name: "1 kecha bepul turar joy", coins: 900000 },
  { id: 306, name: "Presidential Suite — 1 kecha", coins: 5000000 },
];

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const user = await getUserById(session.id);   // ← await qo'shildi
    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });
    }

    const body = await req.json();
    const giftId = Number(body.giftId);

    const gift = GIFTS.find((g) => g.id === giftId);
    if (!gift) {
      return NextResponse.json({ error: "Sovg'a topilmadi" }, { status: 404 });
    }

    const currentCoins = user.coins || 0;
    if (currentCoins < gift.coins) {
      return NextResponse.json({ error: "Yetarli coin yo'q" }, { status: 400 });
    }

    const newCoins = currentCoins - gift.coins;

    await updateUserCoins(user.id, newCoins);   // ← await qo'shildi

    const redemption = await createRedemption({   // ← await qo'shildi
      userId: user.id,
      giftId: gift.id,
      giftName: gift.name,
      coinsSpent: gift.coins,
      status: "pending",
    });

    // Supabase snake_case ustunlarini frontend kutadigan camelCase
    // shakliga o'giramiz (app/sovgalar/page.js shu nomlarni kutadi).
    const mappedRedemption = redemption
      ? {
          id: redemption.id,
          userId: redemption.user_id,
          giftId: redemption.gift_id,
          giftName: redemption.gift_name,
          coinsSpent: redemption.coins_spent,
          status: redemption.status,
          createdAt: redemption.created_at,
        }
      : null;

    return NextResponse.json({
      success: true,
      coins: newCoins,
      redemption: mappedRedemption,
    });
  } catch (err) {
    console.error("REDEEM ERROR:", err);
    return NextResponse.json(
      { error: "Server xatosi: " + (err.message || "Noma'lum xato") },
      { status: 500 }
    );
  }
}
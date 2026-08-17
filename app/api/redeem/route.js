import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUserCoins, createRedemption } from "@/lib/db";

const GIFTS = [
  { id: 1, name: "Xush kelibsiz meva savati", coins: 30 },
  { id: 2, name: "Bepul nonushta (1 kishi)", coins: 50 },
  { id: 3, name: "Kech chiqish (Late checkout)", coins: 60 },
  { id: 4, name: "Kir yuvish xizmati", coins: 70 },
  { id: 5, name: "Aeroportdan olib ketish (Transfer)", coins: 150 },
  { id: 6, name: "SPA va basseyn kirish", coins: 180 },
  { id: 7, name: "Kechki ovqat 2 kishiga", coins: 220 },
  { id: 8, name: "Xona darajasini oshirish", coins: 300 },
  { id: 9, name: "1 kecha bepul turar joy", coins: 500 },
  { id: 10, name: "Butler (shaxsiy xizmatkor) kuni", coins: 700 },
  { id: 11, name: "Deluxe xonada 2 kecha", coins: 1100 },
  { id: 12, name: "Presidential Suite — 1 kecha", coins: 2000 },
];

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

setTimeout(() => {
  router.push("/karta");
}, 1500);

    if (!token) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const user = getUserById(session.id);
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

    updateUserCoins(user.id, newCoins);

    const redemption = createRedemption({
      userId: user.id,
      giftId: gift.id,
      giftName: gift.name,
      coinsSpent: gift.coins,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      coins: newCoins,
      redemption,
    });
  } catch (err) {
    console.error("REDEEM ERROR:", err);
    return NextResponse.json(
      { error: "Server xatosi: " + (err.message || "Noma'lum xato") },
      { status: 500 }
    );
  }
}
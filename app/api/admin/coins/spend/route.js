import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

const COIN_VALUE_SOM = 1;

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await getUserById(session.id);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const userId = body.userId;
    const coinsToSpend = Number(body.coinsToSpend);

    if (!userId || isNaN(coinsToSpend) || coinsToSpend <= 0) {
      return NextResponse.json(
        { error: "Coin miqdorini to'g'ri kiriting" },
        { status: 400 }
      );
    }

    if (String(userId) === String(session.id)) {
      return NextResponse.json(
        { error: "O'zingizga amal bajara olmaysiz" },
        { status: 400 }
      );
    }

    const target = await getUserById(userId);
    if (!target) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const currentCoins = Number(target.coins) || 0;

    if (coinsToSpend > currentCoins) {
      return NextResponse.json(
        { error: `Balansda yetarli coin yo'q. Mavjud: ${currentCoins}` },
        { status: 400 }
      );
    }

    const newCoins = currentCoins - coinsToSpend;

    const updated = await updateUser(userId, {
      coins: newCoins,
    });

    const finalCoins = updated?.coins ?? newCoins;

    // Telegram xabari (xato bersa ham asosiy ish to‘xtamasin)
    try {
      await notifyTelegram(
        `➖ <b>Coin bilan to'landi</b>\nMijoz: ${target.name}\nIshlatildi: -${coinsToSpend} coin (${(coinsToSpend * COIN_VALUE_SOM).toLocaleString()} so'm)\nQolgan balans: ${finalCoins}\nAdmin: ${admin.name}`
      );
    } catch (tgErr) {
      console.error("Telegram notify error:", tgErr);
    }

    return NextResponse.json({
      success: true,
      coins: finalCoins,
      spent: coinsToSpend,
      equivalentSum: coinsToSpend * COIN_VALUE_SOM,
    });
  } catch (err) {
    console.error("ADMIN COINS SPEND ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
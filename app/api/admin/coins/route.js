import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

// 1 coin = 100 so'm. Xohlasangiz shu koeffitsientni o'zgartirasiz.
// MUHIM: bu qiymat /api/admin/coins/spend/route.js dagi SOM_PER_COIN bilan
// bir xil bo'lishi shart, aks holda qo'shish va sarflash nomuvofiq bo'ladi.
const SOM_PER_COIN = 100;

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

    let coinsToAdd = 0;
    let spentToAdd = 0;

    // ===== Summa (so'm) orqali qo'shish — kassa skaneridan keladi =====
    if (body.spent !== undefined && body.spent !== null && body.spent !== "") {
      const spent = Number(body.spent);

      if (!userId || isNaN(spent) || spent <= 0) {
        return NextResponse.json(
          { error: "Summani to'g'ri kiriting" },
          { status: 400 }
        );
      }

      spentToAdd = spent;
      coinsToAdd = Math.floor(spent / SOM_PER_COIN);
    }
    // ===== Tayyor coin miqdorini qo'shish (+10, +50...) — foydalanuvchilar ro'yxatidan =====
    else {
      const amount = Number(body.amount);

      if (!userId || isNaN(amount) || amount === 0) {
        return NextResponse.json(
          { error: "Ma'lumot yetarli emas" },
          { status: 400 }
        );
      }

      coinsToAdd = amount;
    }

    // Admin o'ziga o'zi coin qo'sha olmaydi
    if (String(userId) === String(session.id)) {
      return NextResponse.json(
        { error: "O'zingizga coin qo'sha olmaysiz" },
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

    const newCoins = Math.max(0, (target.coins || 0) + coinsToAdd);
    const newTotalSpent = Math.max(0, (target.totalSpent || 0) + spentToAdd);

    const updated = await updateUser(userId, {
      coins: newCoins,
      totalSpent: newTotalSpent,
    });

    return NextResponse.json({
      success: true,
      coins: updated.coins,
      totalSpent: updated.totalSpent,
      coinsAdded: coinsToAdd,
    });
  } catch (err) {
    console.error("ADMIN COINS ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
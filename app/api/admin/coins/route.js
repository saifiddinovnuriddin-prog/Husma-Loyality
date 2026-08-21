import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

const EARN_RATE = 0.01;

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

    if (body.spent !== undefined && body.spent !== null && body.spent !== "") {
      const spent = Number(body.spent);

      if (!userId || isNaN(spent) || spent <= 0) {
        return NextResponse.json(
          { error: "Summani to'g'ri kiriting" },
          { status: 400 }
        );
      }

      spentToAdd = spent;
      coinsToAdd = Math.floor(spent * EARN_RATE);
    } else {
      const amount = Number(body.amount);

      if (!userId || isNaN(amount) || amount === 0) {
        return NextResponse.json(
          { error: "Ma'lumot yetarli emas" },
          { status: 400 }
        );
      }

      coinsToAdd = amount;
    }

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

    const currentCoins = target.coins || 0;
    const currentTotalSpent = target.total_spent || target.totalSpent || 0;

    const newCoins = Math.max(0, currentCoins + coinsToAdd);
    const newTotalSpent = Math.max(0, currentTotalSpent + spentToAdd);

    const updated = await updateUser(userId, {
      coins: newCoins,
      total_spent: newTotalSpent,   // snake_case (DB)
      totalSpent: newTotalSpent,    // agar mapping bo‘lsa
    });

    return NextResponse.json({
      success: true,
      coins: updated?.coins ?? newCoins,
      totalSpent: updated?.total_spent ?? updated?.totalSpent ?? newTotalSpent,
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
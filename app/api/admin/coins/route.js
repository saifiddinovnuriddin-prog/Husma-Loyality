import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

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

    const admin = getUserById(session.id);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const userId = body.userId;
    const amount = Number(body.amount);

    if (!userId || isNaN(amount) || amount === 0) {
      return NextResponse.json(
        { error: "Ma'lumot yetarli emas" },
        { status: 400 }
      );
    }

    // ★ Muhim: Admin o'ziga o'zi coin qo'sha olmaydi
    if (userId === session.id) {
      return NextResponse.json(
        { error: "O'zingizga coin qo'sha olmaysiz" },
        { status: 400 }
      );
    }

    const target = getUserById(userId);
    if (!target) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    // Coin manfiy bo'lib ketmasligi uchun
    const newCoins = Math.max(0, (target.coins || 0) + amount);
    const updated = updateUser(userId, { coins: newCoins });

    return NextResponse.json({
      success: true,
      coins: updated.coins,
    });
  } catch (err) {
    console.error("ADMIN COINS ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
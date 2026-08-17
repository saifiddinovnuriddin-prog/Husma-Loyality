import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, getUserByCardNumber } from "@/lib/db";

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const card = searchParams.get("card");

    if (!card) {
      return NextResponse.json(
        { error: "Karta raqami kerak" },
        { status: 400 }
      );
    }

    const target = getUserByCardNumber(card);
    if (!target) {
      return NextResponse.json(
        { error: "Bu karta raqami bo'yicha foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const { password, ...safeUser } = target;
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error("ADMIN LOOKUP ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
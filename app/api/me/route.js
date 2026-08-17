import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { formatCardNumber } from "@/lib/cardNumber";

export async function GET() {
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

    const user = getUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email || null,           // frontendda email ishlatiladi
      role: user.role,
      coins: user.coins || 0,
      tier: user.tier || "Bronza",
      totalSpent: user.totalSpent || 0,
      cardNumber: user.cardNumber
        ? formatCardNumber(user.cardNumber)
        : null,
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getRedemptionsByUserId } from "@/lib/db";

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

    const rows = await getRedemptionsByUserId(session.id);

    const redemptions = (rows || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      giftId: r.gift_id,
      giftName: r.gift_name,
      coinsSpent: r.coins_spent,
      status: r.status,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("REDEMPTIONS GET ERROR:", error);
    return NextResponse.json(
      { error: "Server xatosi: " + (error?.message || "Noma'lum") },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

const ALLOWED_TIERS = ["Bronza", "Kumush", "Oltin"];

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
    const { userId, tier } = body;

    if (!userId || !ALLOWED_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: "Noto'g'ri ma'lumot" },
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

    const updated = updateUser(userId, { tier });

    return NextResponse.json({
      success: true,
      tier: updated.tier,
    });
  } catch (err) {
    console.error("ADMIN TIER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
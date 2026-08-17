import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, updateUser, getTodaySpin, createSpinRecord } from "@/lib/db";

// Yutuq ehtimoli: 0 - 45%, 5 - 30%, 10 - 18%, 15 - 7%
// (15 ga tushish eng qiyin bo'lishi kerak edi)
function pickPrize() {
  const r = Math.random() * 100;
  if (r < 45) return 0;
  if (r < 75) return 5;
  if (r < 93) return 10;
  return 15;
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = parseSessionToken(token);
  if (!session?.id) return null;

  return getUserById(session.id);
}

// Bugun aylantirish mumkinmi, tekshirish uchun
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spin = getTodaySpin(user.id);
    return NextResponse.json({
      canSpin: !spin,
      todaySpin: spin || null,
    });
  } catch (err) {
    console.error("SPIN GET ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = getTodaySpin(user.id);
    if (existing) {
      return NextResponse.json(
        {
          error:
            "Bugun allaqachon aylantirgansiz. Ertaga qayta urinib ko'ring.",
        },
        { status: 400 }
      );
    }

    const prize = pickPrize();
    createSpinRecord(user.id, prize);

    let coins = user.coins || 0;
    if (prize > 0) {
      coins = coins + prize;
      updateUser(user.id, { coins });
    }

    return NextResponse.json({ success: true, prize, coins });
  } catch (err) {
    console.error("SPIN POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
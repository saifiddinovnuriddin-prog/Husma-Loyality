import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, createFeedback } from "@/lib/db";

// Foydalanuvchi fikr / savol / shikoyat yuboradi
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

    const user = getUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Xabar bo'sh bo'lishi mumkin emas" },
        { status: 400 }
      );
    }
    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Xabar juda uzun (max 1000 belgi)" },
        { status: 400 }
      );
    }

    const item = createFeedback({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      message,
    });

    return NextResponse.json({ success: true, feedback: item });
  } catch (err) {
    console.error("FEEDBACK POST ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
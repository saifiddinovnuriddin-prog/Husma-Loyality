import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  parseSessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";

export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Kirish talab qilinadi" }, { status: 401 });
    }

    const user = await getUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });
    }

    const body = await req.json();
    const { login, currentPassword, newPassword } = body || {};

    const wantsLoginChange = typeof login === "string" && login.trim().length > 0;
    const wantsPasswordChange = typeof newPassword === "string" && newPassword.length > 0;

    if (!wantsLoginChange && !wantsPasswordChange) {
      return NextResponse.json(
        { error: "O'zgartiriladigan maydon yo'q" },
        { status: 400 }
      );
    }

    const updates = {};

    if (wantsLoginChange) {
      updates.phone = login.trim();
    }

    if (wantsPasswordChange) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak" },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Parolni o'zgartirish uchun joriy parolni kiriting" },
          { status: 400 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "Server xatosi: parol ma'lumoti topilmadi" },
          { status: 500 }
        );
      }

      const isValid = verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Joriy parol noto'g'ri" },
          { status: 400 }
        );
      }

      updates.password = hashPassword(newPassword);
    }

    const updated = await updateUser(user.id, updates);

    return NextResponse.json({
      success: true,
      phone: updated?.phone ?? updates.phone ?? user.phone,
    });
  } catch (err) {
    console.error("SETTINGS PATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
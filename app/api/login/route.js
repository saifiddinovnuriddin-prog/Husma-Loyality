// FAYL: app/api/login/route.js

import { NextResponse } from "next/server";
import { getUserByPhone } from "@/lib/db";
import { validateFullPhone } from "@/lib/phone";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const phoneInput = body.phone;
    const password = body.password;

    if (!phoneInput || !password) {
      return NextResponse.json(
        { error: "Telefon va parol kerak" },
        { status: 400 }
      );
    }

    const phoneCheck = validateFullPhone(phoneInput);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: "Telefon raqam formati noto'g'ri" },
        { status: 400 }
      );
    }

    const user = getUserByPhone(phoneCheck.e164);

    // Xavfsizlik: "raqam topilmadi" va "parol noto'g'ri" holatlarini
    // bir xil xabar bilan qaytaramiz.
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "Telefon raqam yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);

    const res = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });

    res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
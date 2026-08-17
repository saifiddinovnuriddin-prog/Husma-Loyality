// FAYL: app/api/register/route.js

import { NextResponse } from "next/server";
import { getUserByPhone, createUser } from "@/lib/db";
import { validatePhone, getCountry } from "@/lib/phone";
import {
  hashPassword,
  createSessionToken,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, country, phone, password } = body;

    // 1) Bo'sh maydonlar
    if (!name || !country || !phone || !password) {
      return NextResponse.json(
        { error: "Barcha maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    // 2) Ism — bo'sh joylardan tashqari kamida 2 belgi bo'lishi kerak
    if (String(name).trim().length < 2) {
      return NextResponse.json(
        { error: "Ism familiyani to'liq kiriting" },
        { status: 400 }
      );
    }

    // 3) Mamlakat ro'yxatda bormi
    const countryInfo = getCountry(country);
    if (!countryInfo) {
      return NextResponse.json(
        { error: "Mamlakat noto'g'ri tanlangan" },
        { status: 400 }
      );
    }

    // 4) Telefon raqamni tekshirish (uzunlik + O'zbekiston uchun haqiqiy
    //    operator kodi: 90, 91, 93, 94, 95, 97, 98, 99, 33, 88, 20, 77, 78...)
    const dialDigits = countryInfo.dial.replace(/\D/g, "");
    const rawDigits = String(phone).replace(/\D/g, "");
    const localDigits = rawDigits.startsWith(dialDigits)
      ? rawDigits.slice(dialDigits.length)
      : rawDigits;

    const phoneCheck = validatePhone(country, localDigits);
    if (!phoneCheck.valid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    // 5) Parol
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parol kamida 6 belgi bo'lishi kerak" },
        { status: 400 }
      );
    }

    // 6) Shu raqam bilan avval ro'yxatdan o'tilganmi
    if (getUserByPhone(phoneCheck.e164)) {
      return NextResponse.json(
        { error: "Bu raqam allaqachon ro'yxatdan o'tgan" },
        { status: 400 }
      );
    }

    const hashed = hashPassword(password);
    const user = createUser({
      name: String(name).trim(),
      country,
      phone: phoneCheck.e164,
      password: hashed,
    });

    const token = createSessionToken(user);

    const res = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });

    res.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
    return res;
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
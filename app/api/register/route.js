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

    if (!name || !country || !phone || !password) {
      return NextResponse.json(
        { error: "Barcha maydonlarni to'ldiring" },
        { status: 400 }
      );
    }

    if (String(name).trim().length < 2) {
      return NextResponse.json(
        { error: "Ism familiyani to'liq kiriting" },
        { status: 400 }
      );
    }

    const countryInfo = getCountry(country);
    if (!countryInfo) {
      return NextResponse.json(
        { error: "Mamlakat noto'g'ri tanlangan" },
        { status: 400 }
      );
    }

    const dialDigits = countryInfo.dial.replace(/\D/g, "");
    const rawDigits = String(phone).replace(/\D/g, "");
    const localDigits = rawDigits.startsWith(dialDigits)
      ? rawDigits.slice(dialDigits.length)
      : rawDigits;

    const phoneCheck = validatePhone(country, localDigits);
    if (!phoneCheck.valid) {
      return NextResponse.json({ error: phoneCheck.error }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Parol kamida 6 belgi bo'lishi kerak" },
        { status: 400 }
      );
    }

    const existing = await getUserByPhone(phoneCheck.e164);
    if (existing) {
      return NextResponse.json(
        { error: "Bu raqam allaqachon ro'yxatdan o'tgan" },
        { status: 400 }
      );
    }

    const hashed = hashPassword(password);
    const user = await createUser({
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
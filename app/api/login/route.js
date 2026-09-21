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

    console.log("--> LOGIN BOSHLANDI:", { phoneInput, passwordLength: password?.length });

    if (!phoneInput || !password) {
      return NextResponse.json(
        { error: "Telefon va parol kerak" },
        { status: 400 }
      );
    }

    const phoneCheck = validateFullPhone(phoneInput);
    console.log("--> PHONE CHECK RESULT:", phoneCheck);

    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: "Telefon raqam formati noto'g'ri" },
        { status: 400 }
      );
    }

    // Supabase'dan foydalanuvchini olish
    const user = await getUserByPhone(phoneCheck.e164);
    console.log("--> BAZADAN TOPILGAN USER:", user);

    if (!user) {
      console.log("--> XATO: Ushbu raqam bazada topilmadi!");
      return NextResponse.json(
        { error: "Telefon raqam yoki parol noto'g'ri" },
        { status: 401 }
      );
    }

    // Parolni tekshirish
    const isValidPassword = verifyPassword(password, user.password);
    console.log("--> PAROL MOSLIGI:", isValidPassword);

    if (!isValidPassword) {
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
    // Har qanday kutilmagan server xatoligi shu yerga tushadi
    console.error("--> DETAILED LOGIN ERROR:", err);
    return NextResponse.json(
      { error: `Server xatosi: ${err.message}` }, 
      { status: 500 }
    );
  }
}
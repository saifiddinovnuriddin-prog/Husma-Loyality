// app/api/level-reward/route.js
//
// Foydalanuvchi yangi darajaga (Bronze, Silver, Gold, Platinum, Diamond,
// VIP) chiqqanda avtomatik ravishda "Almashtirilgan sovg'alar" ro'yxatiga
// (redemptions jadvaliga) "Kutilmoqda" holatida yozuv qo'shadi.
//
// Boshqa route'lar (masalan /api/redemptions) bilan bir xil auth
// va DB qatlamidan foydalanadi: @/lib/auth va @/lib/db.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import {
  getRedemptionsByUserId,
  createRedemption,
} from "@/lib/db";

// Har bir darajaga o'ziga xos, haqiqiy sovg'alar (101-306) bilan
// TO'QNASHMAYDIGAN giftId. Shu orqali "bu daraja uchun sovg'a
// allaqachon berilganmi" tekshiramiz.
const LEVEL_GIFT_IDS = {
  Bronze: 9001,
  Silver: 9002,
  Gold: 9003,
  Platinum: 9004,
  Diamond: 9005,
  VIP: 9006,
};

export async function POST(req) {
  try {
    // 1) Sessiyadan foydalanuvchini olish
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = parseSessionToken(token);
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // 2) So'rov tanasini o'qish
    const body = await req.json();
    const { level, giftName } = body || {};

    if (!level || !giftName) {
      return NextResponse.json(
        { error: "level va giftName kerak" },
        { status: 400 }
      );
    }

    const giftId = LEVEL_GIFT_IDS[level];
    if (!giftId) {
      return NextResponse.json(
        { error: "Noma'lum daraja: " + level },
        { status: 400 }
      );
    }

    // 3) Server tomonda takrorlanishni tekshirish — bu daraja uchun
    //    foydalanuvchiga sovg'a allaqachon berilganmi?
    const existing = await getRedemptionsByUserId(userId);
    const alreadyRewarded = (existing || []).some(
      (r) => r.gift_id === giftId
    );

    if (alreadyRewarded) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }

    // 4) Yangi yozuvni qo'shish — coinsSpent 0, chunki bu daraja
    //    uchun BEPUL beriladigan sovg'a (coin sarflanmaydi).
    const redemption = await createRedemption({
      userId,
      giftId,
      giftName,
      coinsSpent: 0,
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      redemption: {
        id: redemption.id,
        giftName: redemption.gift_name,
        coinsSpent: redemption.coins_spent,
        status: redemption.status,
        createdAt: redemption.created_at,
      },
    });
  } catch (error) {
    console.error("LEVEL-REWARD POST ERROR:", error);
    return NextResponse.json(
      { error: "Server xatosi: " + (error?.message || "Noma'lum") },
      { status: 500 }
    );
  }
}
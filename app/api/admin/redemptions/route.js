import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, getAllUsers } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

/* =========================
   ADMIN TEKSHIRUVI
========================= */

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = parseSessionToken(token);
  if (!session?.id) return null;

  const admin = await getUserById(session.id);
  if (!admin || admin.role !== "admin") return null;

  return admin;
}

/* =========================
   GET — BARCHA BUYURTMALAR
========================= */

export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin ruxsati kerak" }, { status: 403 });
    }

    const { data: rows, error } = await supabaseAdmin
      .from("redemptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN REDEMPTIONS GET (supabase) ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Har bir buyurtmaga foydalanuvchi ism/telefonini biriktiramiz
    const users = await getAllUsers();
    const userMap = new Map(users.map((u) => [String(u.id), u]));

    const redemptions = (rows || []).map((r) => {
      const u = userMap.get(String(r.user_id));
      return {
        id: r.id,
        userId: r.user_id,
        giftId: r.gift_id,
        giftTitle: r.gift_name,
        cost: r.coins_spent,
        status: r.status,
        createdAt: r.created_at,
        userName: u?.name || "",
        userPhone: u?.phone || "",
      };
    });

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS GET ERROR:", error);
    return NextResponse.json(
      { error: "Server xatosi: " + (error?.message || "Noma'lum") },
      { status: 500 }
    );
  }
}

/* =========================
   PATCH — STATUS O'ZGARTIRISH
========================= */

export async function PATCH(req) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin ruxsati kerak" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    const allowedStatuses = ["pending", "completed", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Buyurtma ID kerak" }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("redemptions")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("ADMIN REDEMPTIONS PATCH (supabase) ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      redemption: {
        id: updated.id,
        userId: updated.user_id,
        giftId: updated.gift_id,
        giftTitle: updated.gift_name,
        cost: updated.coins_spent,
        status: updated.status,
        createdAt: updated.created_at,
      },
    });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Server xatosi: " + (error?.message || "Noma'lum") },
      { status: 500 }
    );
  }
}
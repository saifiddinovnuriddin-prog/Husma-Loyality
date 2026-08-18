import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   ADMIN TEKSHIRUVI
========================= */
async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = parseSessionToken(token);
  if (!session?.id || session.role !== "admin") return null;

  return session;
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

    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("REDEMPTIONS GET ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Frontendga mos format
    const redemptions = (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name || r.user_id || "",
      userPhone: r.user_phone || "",
      giftTitle: r.gift_name || r.gift_title || "",
      giftName: r.gift_name || "",
      cost: r.coins_spent || r.cost || r.coins || 0,
      coins: r.coins_spent || r.coins || 0,
      status: r.status || "pending",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

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

    const allowedStatuses = ["pending", "completed", "rejected", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("redemptions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("REDEMPTIONS PATCH ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      redemption: data,
    });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS PATCH ERROR:", error);
    return NextResponse.json(
      { error: "Server xatosi: " + (error?.message || "Noma'lum") },
      { status: 500 }
    );
  }
}
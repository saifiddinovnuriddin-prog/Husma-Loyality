import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, getAllUsers, deleteUser as deleteUserFromDb } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const session = parseSessionToken(token);
  if (!session?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = getUserById(session.id);
  if (!admin || admin.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin };
}

export async function GET() {
  try {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const users = getAllUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email || u.phone || "", 
      phone: u.phone,
      card: u.card || u.cardNumber || "",
      role: u.role,
      tier: u.tier || "Bronza",
      coins: u.coins || 0,
      totalSpent: u.totalSpent || 0,
      isProtected: !!u.isProtected,
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Foydalanuvchi ID kerak" }, { status: 400 });
    }

    if (String(userId) === String(admin.id)) {
      return NextResponse.json(
        { error: "O'zingizni o'chira olmaysiz" },
        { status: 400 }
      );
    }

    const target = getUserById(userId);
    if (!target) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    if (target.isProtected) {
      return NextResponse.json(
        { error: "Bu foydalanuvchi Save qilingan, o'chirib bo'lmaydi" },
        { status: 400 }
      );
    }

    deleteUserFromDb(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN DELETE USER ERROR:", err);
    return NextResponse.json({ error: err.message || "Server xatosi" }, { status: 500 });
  }
}
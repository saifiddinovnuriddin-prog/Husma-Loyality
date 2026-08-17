import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById, getAllFeedback, markFeedbackRead } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = parseSessionToken(token);
  if (!session?.id) return null;

  const admin = getUserById(session.id);
  if (!admin || admin.role !== "admin") return null;

  return admin;
}

// Barcha fikr-mulohazalarni ro'yxatini olish
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedback = getAllFeedback();
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("ADMIN FEEDBACK GET ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}

// O'qilgan / o'qilmagan holatini belgilash
export async function PATCH(req) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "id kerak" }, { status: 400 });
    }

    const updated = markFeedbackRead(id, read !== false);
    if (!updated) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, feedback: updated });
  } catch (err) {
    console.error("ADMIN FEEDBACK PATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server xatosi" },
      { status: 500 }
    );
  }
}
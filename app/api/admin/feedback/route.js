import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import {
  getUserById,
  getAllFeedback,
  markFeedbackRead,
} from "@/lib/db";

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

  const admin = await getUserById(session.id);
  if (!admin || admin.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin };
}

// Admin uchun barcha feedbacklarni olish
export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const feedback = await getAllFeedback();

    // Frontend kutayotgan formatga o‘tkazamiz
    const formatted = (feedback || []).map((f) => ({
      id: f.id,
      userName: f.user_name || f.userName,
      email: f.user_phone || f.userPhone,
      message: f.message,
      read: !!f.read,
      createdAt: f.created_at || f.createdAt,
    }));

    return NextResponse.json({ feedback: formatted });
  } catch (err) {
    console.error("ADMIN FEEDBACK GET ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

// O‘qildi / o‘qilmagan holatini o‘zgartirish
export async function PATCH(req) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "ID kerak" }, { status: 400 });
    }

    const updated = await markFeedbackRead(id, !!read);
    if (!updated) {
      return NextResponse.json({ error: "Yangilashda xatolik" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ADMIN FEEDBACK PATCH ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
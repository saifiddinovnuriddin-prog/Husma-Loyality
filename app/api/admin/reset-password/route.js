// ... yuqoridagi kodingiz o'zgarishsiz qoladi ...

export async function PATCH(req) {
  try {
    const { admin, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "Foydalanuvchi ID va yangi parol kiritilishi kerak" },
        { status: 400 }
      );
    }

    if (String(newPassword).trim().length < 4) {
      return NextResponse.json(
        { error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const target = await getUserById(userId);
    if (!target) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    // Hash tayyorlash va Supabase bazasiga saqlash
    const { hashPassword } = await import("@/lib/auth");
    const { supabaseAdmin } = await import("@/lib/supabase");

    const hashedPassword = hashPassword(newPassword);

    const { error: dbError } = await supabaseAdmin
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (dbError) {
      console.error("PAROL MIGRATION ERROR:", dbError);
      return NextResponse.json({ error: "Bazada parolni yangilab bo'lmadi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (err) {
    console.error("ADMIN UPDATE PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
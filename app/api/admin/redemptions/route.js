import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import fs from "fs";
import path from "path";

const REDEMPTIONS_FILE = path.join(
  process.cwd(),
  "data",
  "redemptions.json"
);

function loadRedemptions() {
  try {
    if (!fs.existsSync(REDEMPTIONS_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(REDEMPTIONS_FILE, "utf-8");

    if (!raw.trim()) {
      return [];
    }

    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("loadRedemptions error:", error);
    return [];
  }
}

function saveRedemptions(list) {
  const dir = path.dirname(REDEMPTIONS_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(
    REDEMPTIONS_FILE,
    JSON.stringify(list, null, 2),
    "utf-8"
  );
}

/* =========================
   ADMIN TEKSHIRUVI
========================= */

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = parseSessionToken(token);

  if (!session?.id) {
    return null;
  }

  if (session.role !== "admin") {
    return null;
  }

  return session;
}

/* =========================
   GET — BARCHA BUYURTMALAR
========================= */

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 }
      );
    }

    const redemptions = loadRedemptions();

    // Har bir buyurtmaga foydalanuvchi ism/telefonini biriktiramiz
    const enriched = redemptions.map((r) => {
      const u = getUserById(r.userId);
      return {
        ...r,
        userName: u?.name || r.userName || "",
        userPhone: u?.phone || r.userPhone || "",
        giftTitle: r.giftTitle || r.giftName || "",
        cost: r.cost ?? r.coinsSpent ?? r.coins ?? 0,
      };
    });

    const sorted = [...enriched].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    });

    return NextResponse.json({
      redemptions: sorted,
    });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS GET ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Server xatosi: " +
          (error?.message || "Noma'lum"),
      },
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
      return NextResponse.json(
        { error: "Admin ruxsati kerak" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { id, status } = body;

    // Frontend "completed" / "rejected" / "pending" yuboradi
    const allowedStatuses = ["pending", "completed", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Noto'g'ri status" },
        { status: 400 }
      );
    }

    const list = loadRedemptions();

    const index = list.findIndex(
      (item) =>
        String(item.id) === String(id)
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Buyurtma topilmadi" },
        { status: 404 }
      );
    }

    list[index].status = status;
    list[index].updatedAt = new Date().toISOString();

    saveRedemptions(list);

    return NextResponse.json({
      success: true,
      redemption: list[index],
    });
  } catch (error) {
    console.error("ADMIN REDEMPTIONS PATCH ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Server xatosi: " +
          (error?.message || "Noma'lum"),
      },
      { status: 500 }
    );
  }
}
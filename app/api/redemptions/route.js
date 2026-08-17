import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, parseSessionToken } from "@/lib/auth";
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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = parseSessionToken(token);

    if (!session?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const redemptions = loadRedemptions();

    const userRedemptions = redemptions
      .filter(
        (item) =>
          String(item.userId) === String(session.id)
      )
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      });

    return NextResponse.json({
      redemptions: userRedemptions,
    });
  } catch (error) {
    console.error("REDEMPTIONS GET ERROR:", error);

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
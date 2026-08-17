import crypto from "crypto";

export const SESSION_COOKIE = "husma_session";

// MUHIM: bu qiymatni .env.local faylida SESSION_SECRET sifatida o'rnating.
// Terminalda generatsiya qilish uchun: openssl rand -hex 32
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  console.warn(
    "[auth] OGOHLANTIRISH: SESSION_SECRET .env.local faylida topilmadi. " +
      "Hozircha faqat lokal ishlash uchun zaxira kalit ishlatilmoqda — " +
      "production'ga chiqarishdan oldin buni albatta o'rnating, aks holda sessiyalar xavfsiz bo'lmaydi."
  );
}

// Faqat SESSION_SECRET o'rnatilmagan holatlar uchun (masalan birinchi marta ishga
// tushirishda) zaxira qiymat — production'da HECH QACHON ishlatilmasligi kerak.
const SECRET = SESSION_SECRET || "dev_only_insecure_secret_husma_2024";

function base64url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function sign(payloadB64) {
  return crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "husma_salt_2024")
    .digest("hex");
}

export function verifyPassword(password, hashed) {
  return hashPassword(password) === hashed;
}

export function createSessionToken(user) {
  const payload = {
    id: user.id,
    phone: user.phone,
    role: user.role || "user",
    name: user.name,
    iat: Date.now(),
  };

  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function parseSessionToken(token) {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSignature = sign(payloadB64);

    // timingSafeEqual bir xil uzunlikdagi bufferlarni talab qiladi
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null; // imzo mos kelmadi — token soxta yoki o'zgartirilgan
    }

    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (!payload || !payload.id) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
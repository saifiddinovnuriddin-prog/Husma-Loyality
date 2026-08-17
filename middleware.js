import { NextResponse } from "next/server";

const SESSION_COOKIE = "husma_session";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "dev_only_insecure_secret_husma_2024";

const GUEST_ONLY_PATHS = ["/login", "/register"];
const AUTH_ONLY_PREFIXES = ["/karta", "/xonalar"];
const ADMIN_ONLY_PREFIXES = ["/admin"];

function base64urlToBytes(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64urlToString(base64url) {
  return new TextDecoder().decode(base64urlToBytes(base64url));
}

let cachedKey = null;
async function getHmacKey() {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return cachedKey;
}

async function verifySessionToken(token) {
  try {
    const [payloadB64, signatureB64] = token.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const key = await getHmacKey();
    const signatureBytes = base64urlToBytes(signatureB64);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null; 

    const payload = JSON.parse(base64urlToString(payloadB64));
    if (!payload || !payload.id) return null;
    return payload;
  } catch {
    return null;
  }
}

function isPathMatch(pathname, prefixes) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isLoggedIn = !!session;
  const isAdmin = session?.role === "admin";

  // 1) Bosh sahifa: kirgan bo'lsa -> admin/karta, roliga qarab
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/karta", request.url)
    );
  }

  // 2) Login/Register: allaqachon kirgan bo'lsa kerak emas
  if (isPathMatch(pathname, GUEST_ONLY_PATHS) && isLoggedIn) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/karta", request.url)
    );
  }

  // 3) /karta, /xonalar: faqat oddiy (admin bo'lmagan) kirgan userlar uchun
  if (isPathMatch(pathname, AUTH_ONLY_PREFIXES)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdmin) {
      // Admin bu sahifalarga kirmasligi kerak -> o'z admin paneliga qaytariladi
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 4) /admin: faqat admin uchun
  if (isPathMatch(pathname, ADMIN_ONLY_PREFIXES)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/karta", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
// lib/phone.js
//
// Barcha mamlakatlar uchun telefon raqamini tekshirish va E.164 formatga
// (masalan "998901234567") keltirish shu yerda amalga oshiriladi.
// Frontend HAM, backend HAM shu faylni ishlatishi kerak — faqat frontendda
// tekshirish yetarli emas, chunki API'ga to'g'ridan-to'g'ri (masalan Postman
// orqali) so'rov yuborilishi mumkin.

// O'zbekiston mobil operatorlarining rasmiy kod (prefiks)lari.
// Raqam +998 dan keyin shu kodlardan biri bilan boshlanishi va
// jami 9 ta raqamdan iborat bo'lishi kerak (masalan 90 1234567).
const UZ_MOBILE_PREFIXES = [
  "20", "33", "50", "55", "61", "62", "63", "64", "65", "66", "67", "69",
  "70", "71", "72", "73", "74", "75", "76", "77", "78", "79",
  "88", "90", "91", "93", "94", "95", "97", "98", "99",
];

export const COUNTRIES = [
  { code: "UZ", label: "O'zbekiston", dial: "+998", localLength: 9 },
  { code: "KZ", label: "Qozog'iston", dial: "+7", localLength: 10 },
  { code: "KG", label: "Qirg'iziston", dial: "+996", localLength: 9 },
  { code: "TJ", label: "Tojikiston", dial: "+992", localLength: 9 },
  { code: "TM", label: "Turkmaniston", dial: "+993", localLength: 8 },
  { code: "RU", label: "Rossiya", dial: "+7", localLength: 10 },
];

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || null;
}

function onlyDigits(v) {
  return String(v || "").replace(/\D/g, "");
}

/**
 * Telefon raqamini tekshiradi.
 *
 * @param {string} countryCode - "UZ", "KZ", ... (COUNTRIES dagi code)
 * @param {string} localDigits - mamlakat kodisiz qism, masalan "901234567"
 * @returns {{ valid: true, e164: string, dial: string } | { valid: false, error: string }}
 */
export function validatePhone(countryCode, localDigits) {
  const country = getCountry(countryCode);
  if (!country) {
    return { valid: false, error: "Mamlakat noto'g'ri tanlangan" };
  }

  const digits = onlyDigits(localDigits);

  if (digits.length !== country.localLength) {
    return {
      valid: false,
      error: `Telefon raqam ${country.localLength} ta raqamdan iborat bo'lishi kerak`,
    };
  }

  if (country.code === "UZ") {
    const prefix = digits.slice(0, 2);
    if (!UZ_MOBILE_PREFIXES.includes(prefix)) {
      return {
        valid: false,
        error: "Bunday operator kodi mavjud emas (masalan 90, 91, 93, 97, 99...)",
      };
    }
  }

  const dialDigits = onlyDigits(country.dial);
  const e164 = dialDigits + digits;

  return { valid: true, e164, dial: country.dial };
}

/**
 * To'liq raqamni (masalan "+998901234567" yoki "998901234567") qabul qilib,
 * qaysi mamlakatga tegishli ekanini aniqlaydi va tekshiradi.
 * Login kabi joylarda, mamlakat alohida tanlanmagan holatda ishlatiladi.
 *
 * @param {string} fullPhone
 * @returns {{ valid: true, e164: string, country: object } | { valid: false, error: string }}
 */
export function validateFullPhone(fullPhone) {
  const digits = onlyDigits(fullPhone);

  // Mamlakat kodi bo'yicha eng uzunidan eng qisqasiga qarab moslashtiramiz
  // (masalan "992" bilan "99" chalkashib ketmasligi uchun).
  const sorted = [...COUNTRIES].sort(
    (a, b) => onlyDigits(b.dial).length - onlyDigits(a.dial).length
  );

  for (const country of sorted) {
    const dialDigits = onlyDigits(country.dial);
    if (digits.startsWith(dialDigits)) {
      const local = digits.slice(dialDigits.length);
      const result = validatePhone(country.code, local);
      if (result.valid) {
        return { valid: true, e164: result.e164, country };
      }
    }
  }

  // Mamlakat kodisiz, 9 ta raqam kiritilgan bo'lsa — UZ deb qabul qilamiz
  // (eski frontend/foydalanuvchilar bilan moslik uchun)
  if (digits.length === 9) {
    const result = validatePhone("UZ", digits);
    if (result.valid) {
      return { valid: true, e164: result.e164, country: getCountry("UZ") };
    }
  }

  return { valid: false, error: "Telefon raqam formati noto'g'ri" };
}
// lib/cardNumber.js
//
// Har bir foydalanuvchi uchun unikal, haqiqiy bank kartasiga o'xshash
// 16 xonali karta raqami generatsiya qiladi (Luhn algoritmi bilan
// tekshiruv raqami hisoblanadi, xuddi Visa/Mastercard'dagidek).
//
// Ro'yxatdan o'tish (register) paytida chaqiriladi va bazaga saqlanadi.

const PREFIX = "8600"; // Husma loyalty kartalari uchun prefiks (birinchi 4 xona doim shu)

function luhnChecksum(digits) {
  let sum = 0;
  let shouldDouble = true; // checksum xonasidan oldingi (o'ngdan chap) raqamdan boshlanadi
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return (10 - (sum % 10)) % 10;
}

// Xom (probelsiz) 16 xonali karta raqami: prefiks(4) + tasodifiy(11) + checksum(1)
export function generateRawCardNumber() {
  const randomPart = Array.from({ length: 11 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");
  const bodyDigits = (PREFIX + randomPart).split("").map(Number);
  const checksum = luhnChecksum([...bodyDigits, 0]); // checksum joyiga 0 qo'yib hisoblaymiz
  return PREFIX + randomPart + checksum;
}

// Bazada shu raqam band emasligini tekshirib, band bo'lsa qayta generatsiya qiladi.
// `existsFn(cardNumber)` - true/false qaytaruvchi sinxron funksiya.
export function generateUniqueCardNumber(existsFn) {
  let cardNumber;
  let attempts = 0;
  do {
    cardNumber = generateRawCardNumber();
    attempts++;
    if (attempts > 20) {
      throw new Error("Unikal karta raqami generatsiya qilib bo'lmadi");
    }
  } while (existsFn(cardNumber));
  return cardNumber;
}

// Ko'rsatish uchun: "8600123456789012" -> "8600 1234 5678 9012"
export function formatCardNumber(cardNumber) {
  if (!cardNumber) return "";
  return cardNumber.replace(/(.{4})/g, "$1 ").trim();
}
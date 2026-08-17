import fs from "fs";
import path from "path";
import { generateUniqueCardNumber, generateRawCardNumber, formatCardNumber } from "./cardNumber";

const DATA_FILE = path.join(process.cwd(), "data", "users.json");
const REDEMPTIONS_FILE = path.join(process.cwd(), "data", "redemptions.json");
// YANGI: baraban (spin) va bildirishnoma/fikr-mulohaza fayllari
const SPINS_FILE = path.join(process.cwd(), "data", "spins.json");
const FEEDBACK_FILE = path.join(process.cwd(), "data", "feedback.json");

const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("DB load error:", e);
  }
  return [
    {
      id: "1",
      name: "Admin",
      phone: "998901234567",
      password: "28925e58695271f2e643f8be03acf53436656f2d548f8735418b14af86e0350d",
      role: "admin",
      coins: 0,
      tier: "Oltin",
      totalSpent: 0,
      cardNumber: generateRawCardNumber(),
    },
  ];
}

function saveUsers(usersList) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (e) {
    console.error("DB save error:", e);
  }
}

function loadRedemptions() {
  try {
    if (fs.existsSync(REDEMPTIONS_FILE)) {
      const raw = fs.readFileSync(REDEMPTIONS_FILE, "utf-8");
      const data = JSON.parse(raw);
      console.log("Redemptions yuklandi:", data.length, "ta");
      return data;
    }
  } catch (e) {
    console.error("Redemptions load error:", e);
  }
  return [];
}

function saveRedemptions(list) {
  try {
    fs.writeFileSync(REDEMPTIONS_FILE, JSON.stringify(list, null, 2), "utf-8");
    console.log("Redemptions saqlandi:", list.length, "ta →", REDEMPTIONS_FILE);
  } catch (e) {
    console.error("Redemptions save error:", e);
  }
}

let users = loadUsers();
let nextId = users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 1) + 1;

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeCardNumber(card) {
  return String(card || "").replace(/\D/g, "");
}

function cardNumberExists(raw) {
  return users.some((u) => u.cardNumber === raw);
}

export function getUserByPhone(phone) {
  const p = normalizePhone(phone);
  return users.find((u) => normalizePhone(u.phone) === p) || null;
}

export function getUserById(id) {
  users = loadUsers(); // har safar yangilab olamiz
  return users.find((u) => u.id === String(id)) || null;
}

// QR-kod skanerlanganda karta raqami orqali foydalanuvchini topish uchun
export function getUserByCardNumber(cardNumber) {
  users = loadUsers();
  const raw = normalizeCardNumber(cardNumber);
  if (!raw) return null;
  return (
    users.find((u) => normalizeCardNumber(u.cardNumber) === raw) || null
  );
}

// YANGILANDI: endi `country` maydonini ham qabul qiladi va saqlaydi
export function createUser({ name, country, phone, password }) {
  const cardNumber = generateUniqueCardNumber(cardNumberExists);

  const user = {
    id: String(nextId++),
    name,
    country: country || null,
    phone: normalizePhone(phone),
    password,
    role: "user",
    coins: 50,
    tier: "Bronza",
    totalSpent: 0,
    cardNumber,
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(id, data) {
  users = loadUsers();
  const index = users.findIndex((u) => u.id === String(id));
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  saveUsers(users);
  return users[index];
}

// Foydalanuvchini butunlay o'chirish (Information sahifadagi Delete tugmasi uchun)
export function deleteUser(id) {
  users = loadUsers();
  const index = users.findIndex((u) => u.id === String(id));
  if (index === -1) return false;
  users.splice(index, 1);
  saveUsers(users);
  return true;
}

export function getAllUsers() {
  users = loadUsers();
  return users.map(({ password, ...u }) => u);
}

// ========== COIN VA BUYURTMALAR ==========

export function updateUserCoins(userId, newCoins) {
  users = loadUsers();

  const index = users.findIndex((u) => u.id === String(userId));
  if (index === -1) throw new Error("User topilmadi");

  users[index].coins = newCoins;
  saveUsers(users);
  console.log(`Coin yangilandi: user ${userId} → ${newCoins}`);
  return users[index];
}

export function createRedemption({ userId, giftId, giftName, coinsSpent, status }) {
  const list = loadRedemptions();

  const newItem = {
    id: Date.now(),
    userId: String(userId),
    giftId,
    giftName,
    coinsSpent,
    status: status || "pending",
    createdAt: new Date().toISOString(),
  };

  list.unshift(newItem);
  saveRedemptions(list);
  console.log("Yangi redemption yaratildi:", newItem);
  return newItem;
}

export function getRedemptionsByUserId(userId) {
  const list = loadRedemptions();
  const filtered = list.filter((r) => String(r.userId) === String(userId));
  console.log(`User ${userId} uchun redemptionlar:`, filtered.length, "ta");
  return filtered;
}

export { formatCardNumber };

// ========================================================================
// BARABAN (kunlik spin / lottery)
// ========================================================================

function loadSpins() {
  try {
    if (fs.existsSync(SPINS_FILE)) {
      const raw = fs.readFileSync(SPINS_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Spins load error:", e);
  }
  return [];
}

function saveSpins(list) {
  try {
    fs.writeFileSync(SPINS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Spins save error:", e);
  }
}

function todayStr() {
  // Mahalliy sana (YYYY-MM-DD) — kun almashishi shu bo'yicha hisoblanadi
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Foydalanuvchining bugungi spin yozuvi (bo'lsa) — bo'lmasa null
export function getTodaySpin(userId) {
  const list = loadSpins();
  const today = todayStr();
  return (
    list.find(
      (s) => String(s.userId) === String(userId) && s.date === today
    ) || null
  );
}

export function createSpinRecord(userId, prize) {
  const list = loadSpins();
  const record = {
    id: Date.now(),
    userId: String(userId),
    date: todayStr(),
    prize,
    createdAt: new Date().toISOString(),
  };
  list.unshift(record);
  saveSpins(list);
  return record;
}

// ========================================================================
// BILDIRISHNOMALAR (foydalanuvchi fikr-mulohaza / savol-shikoyat)
// ========================================================================

function loadFeedback() {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const raw = fs.readFileSync(FEEDBACK_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Feedback load error:", e);
  }
  return [];
}

function saveFeedback(list) {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Feedback save error:", e);
  }
}

export function createFeedback({ userId, userName, userPhone, message }) {
  const list = loadFeedback();
  const item = {
    id: Date.now(),
    userId: String(userId),
    userName,
    userPhone,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  saveFeedback(list);
  return item;
}

export function getAllFeedback() {
  return loadFeedback();
}

export function markFeedbackRead(id, read = true) {
  const list = loadFeedback();
  const index = list.findIndex((f) => String(f.id) === String(id));
  if (index === -1) return null;
  list[index].read = read;
  saveFeedback(list);
  return list[index];
}
import { supabaseAdmin } from "./supabase";
import { generateUniqueCardNumber, formatCardNumber } from "./cardNumber";

// ========== HELPERS ==========

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeCardNumber(card) {
  return String(card || "").replace(/\D/g, "");
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ========== USERS ==========

export async function getUserByPhone(phone) {
  const p = normalizePhone(phone);
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("phone", p)
    .maybeSingle();

  if (error) {
    console.error("getUserByPhone error:", error);
    return null;
  }
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getUserById error:", error);
    return null;
  }
  return data;
}

export async function getUserByCardNumber(cardNumber) {
  const raw = normalizeCardNumber(cardNumber);
  if (!raw) return null;

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("card_number", raw)
    .maybeSingle();

  if (error) {
    console.error("getUserByCardNumber error:", error);
    return null;
  }
  return data;
}

export async function createUser({ name, country, phone, password }) {
  // Karta raqami unique bo‘lishi uchun tekshiramiz
  let cardNumber;
  let attempts = 0;
  while (attempts < 10) {
    cardNumber = generateUniqueCardNumber(() => false); // vaqtincha
    const existing = await getUserByCardNumber(cardNumber);
    if (!existing) break;
    attempts++;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      name: String(name).trim(),
      country: country || null,
      phone: normalizePhone(phone),
      password,
      role: "user",
      coins: 50,
      tier: "Bronza",
      total_spent: 0,
      card_number: cardNumber,
    })
    .select()
    .single();

  if (error) {
    console.error("createUser error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function updateUser(id, data) {
  // totalSpent → total_spent, cardNumber → card_number kabi mapping
  const payload = { ...data };
  if (payload.totalSpent !== undefined) {
    payload.total_spent = payload.totalSpent;
    delete payload.totalSpent;
  }
  if (payload.cardNumber !== undefined) {
    payload.card_number = payload.cardNumber;
    delete payload.cardNumber;
  }

  const { data: updated, error } = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateUser error:", error);
    return null;
  }
  return updated;
}

export async function deleteUser(id) {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) {
    console.error("deleteUser error:", error);
    return false;
  }
  return true;
}

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, country, phone, role, coins, tier, total_spent, card_number, created_at")
    .order("id", { ascending: true });

  if (error) {
    console.error("getAllUsers error:", error);
    return [];
  }
  return data || [];
}

export async function updateUserCoins(userId, newCoins) {
  return updateUser(userId, { coins: newCoins });
}

// ========== REDEMPTIONS ==========

export async function createRedemption({ userId, giftId, giftName, coinsSpent, status }) {
  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .insert({
      user_id: userId,
      gift_id: giftId,
      gift_name: giftName,
      coins_spent: coinsSpent,
      status: status || "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("createRedemption error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function getRedemptionsByUserId(userId) {
  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getRedemptionsByUserId error:", error);
    return [];
  }
  return data || [];
}

// ========== SPINS ==========

export async function getTodaySpin(userId) {
  const today = todayStr();
  const { data, error } = await supabaseAdmin
    .from("spins")
    .select("*")
    .eq("user_id", userId)
    .eq("spin_date", today)
    .maybeSingle();

  if (error) {
    console.error("getTodaySpin error:", error);
    return null;
  }
  return data;
}

export async function createSpinRecord(userId, prize) {
  const { data, error } = await supabaseAdmin
    .from("spins")
    .insert({
      user_id: userId,
      spin_date: todayStr(),
      prize: String(prize),
    })
    .select()
    .single();

  if (error) {
    console.error("createSpinRecord error:", error);
    throw new Error(error.message);
  }
  return data;
}

// ========== FEEDBACK ==========

export async function createFeedback({ userId, userName, userPhone, message }) {
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .insert({
      user_id: userId,
      user_name: userName,
      user_phone: userPhone,
      message,
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("createFeedback error:", error);
    throw new Error(error.message);
  }
  return data;
}

export async function getAllFeedback() {
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllFeedback error:", error);
    return [];
  }
  return data || [];
}

export async function markFeedbackRead(id, read = true) {
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .update({ read })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("markFeedbackRead error:", error);
    return null;
  }
  return data;
}

export { formatCardNumber };
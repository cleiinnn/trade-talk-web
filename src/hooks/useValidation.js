// ─── useValidation.js ────────────────────────────────────────────────────────
// Shared validation logic for phone (PH) and delivery address.
// Used by both profile.jsx and OrderSummary.jsx.

import { useState, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
export const PH_PHONE_REGEX  = /^(\+63|0)9\d{9}$/;
export const ADDRESS_MIN_LEN = 15;
export const ADDRESS_MIN_WORDS = 3;

// Requires at least this many letter characters (not digits/symbols)
export const ADDRESS_MIN_LETTERS = 8;

// ── Pure validators (status strings) ──────────────────────────────────────
// Returns: "empty" | "invalid" | "valid"
export const validatePhone = (value) => {
  const v = (value ?? "").trim();
  if (!v) return "empty";
  if (PH_PHONE_REGEX.test(v)) return "valid";
  return "invalid";
};

/**
 * Address validation — returns one of:
 *   "empty"       — nothing typed
 *   "too_short"   — under 15 characters
 *   "no_letters"  — doesn't contain enough actual letters
 *                   (catches "123456789012345", "12345 67890 12345", etc.)
 *   "too_few_words" — fewer than 3 space-separated words
 *                   (catches single-token garbage)
 *   "valid"
 */
export const validateAddress = (value) => {
  const v = (value ?? "").trim();
  if (!v) return "empty";

  // 1. Minimum raw length
  if (v.length < ADDRESS_MIN_LEN) return "too_short";

  // 2. Must contain enough actual letter characters
  //    Strips everything that isn't a-z/A-Z and counts what's left
  const letterCount = (v.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < ADDRESS_MIN_LETTERS) return "no_letters";

  // 3. Must have at least ADDRESS_MIN_WORDS whitespace-separated tokens
  const wordCount = v.split(/\s+/).filter(Boolean).length;
  if (wordCount < ADDRESS_MIN_WORDS) return "too_few_words";

  return "valid";
};

// ── Status helpers ─────────────────────────────────────────────────────────
export const phoneMessage = (status) => {
  if (status === "invalid") return "INVALID FORMAT — USE 09XXXXXXXXX OR +639XXXXXXXXX";
  return null;
};

export const addressMessage = (status) => {
  if (status === "too_short")    return `TOO SHORT — MINIMUM ${ADDRESS_MIN_LEN} CHARACTERS`;
  if (status === "no_letters")   return "MUST CONTAIN A REAL STREET/BARANGAY NAME";
  if (status === "too_few_words") return `NEEDS AT LEAST ${ADDRESS_MIN_WORDS} WORDS (e.g. Street, Barangay, City)`;
  return null;
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useValidation = (initialPhone = "", initialAddress = "") => {
  const [phone,   setPhone]   = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);

  const phoneStatus   = validatePhone(phone);
  const addressStatus = validateAddress(address);
  const isFormValid   = phoneStatus === "valid" && addressStatus === "valid";

  // Call this when you want to reset fields to fresh values (e.g., cancel edit)
  const resetFields = useCallback((p = "", a = "") => {
    setPhone(p);
    setAddress(a);
  }, []);

  return {
    phone,   setPhone,
    address, setAddress,
    phoneStatus,
    addressStatus,
    isFormValid,
    resetFields,
  };
};
// src/lib/utils/password.js
import crypto from "crypto";

export function generateRandomPassword(length = 8) {
  // Generates a random alphanumeric password
  return crypto.randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}

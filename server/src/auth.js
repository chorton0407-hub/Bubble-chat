import jwt from "jsonwebtoken";
import argon2 from "argon2";

const ONE_DAY = 24 * 60 * 60; // seconds

export async function hashPassword(password) {
  return argon2.hash(password);
}

export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

export function signSessionJWT(userId) {
  const jwtId = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti: jwtId }, process.env.JWT_SECRET, {
    expiresIn: ONE_DAY,
  });
  const expiresAt = new Date(Date.now() + ONE_DAY * 1000);
  return { token, jwtId, expiresAt };
}

export function setAuthCookie(res, token) {
  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(process.env.COOKIE_NAME, { path: "/" });
}

export function verifyJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-at-least-32-chars-long"
);

/**
 * Hashes a plaintext password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compares a plaintext password with a hashed password.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a payload to generate a JWT token.
 */
export async function signJWT(payload: { id: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns the payload or null if invalid.
 */
export async function verifyJWT(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string };
  } catch {
    return null;
  }
}

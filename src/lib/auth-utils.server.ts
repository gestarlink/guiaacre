import { setCookie, getCookie } from "@tanstack/react-start/server";
import { jwtVerify } from "jose";
import { queryOne } from "./db.server";
import type { AuthUser } from "./auth.server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production",
);

export function setTokenCookie(token: string) {
  setCookie("guiaacre_token", token, {
    path: "/",
    maxAge: 604800,
    sameSite: "lax",
    httpOnly: false,
  });
}

export function clearTokenCookie() {
  setCookie("guiaacre_token", "", { path: "/", maxAge: 0 });
}

export function getTokenFromCookie(): string | null {
  try {
    return getCookie("guiaacre_token") || null;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return queryOne<AuthUser>(
      "SELECT id, email, name, role, avatar_url FROM users WHERE id = ?",
      payload.sub as string,
    );
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthUser> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Não autenticado");
  const user = await getUserFromToken(token);
  if (!user) throw new Error("Token inválido");
  if (user.role !== "admin") throw new Error("Acesso negado");
  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Não autenticado");
  const user = await getUserFromToken(token);
  if (!user) throw new Error("Token inválido");
  return user;
}

export async function getOptionalUser(): Promise<AuthUser | null> {
  const token = getTokenFromCookie();
  if (!token) return null;
  return getUserFromToken(token);
}

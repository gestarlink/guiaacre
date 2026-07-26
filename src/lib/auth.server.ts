import { createServerFn } from "@tanstack/react-start";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { queryOne, execute } from "./db.server";
import { setTokenCookie, clearTokenCookie, getTokenFromCookie, getUserFromToken } from "./auth-utils.server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-in-production");

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url: string | null;
};

export const signUp = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string; name: string }) => d)
  .handler(async ({ data }) => {
    const existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = ?", data.email);
    if (existing) throw new Error("Email já cadastrado");

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);
    const now = new Date().toISOString();

    await execute(
      "INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', ?, ?)",
      id, data.email, data.name, passwordHash, now, now,
    );

    const token = await new SignJWT({ sub: id, email: data.email, role: "user" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    setTokenCookie(token);
    return { token, user: { id, email: data.email, name: data.name, role: "user", avatar_url: null } };
  });

export const signIn = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const user = await queryOne<{
      id: string; email: string; name: string; password_hash: string; role: string; avatar_url: string | null;
    }>("SELECT id, email, name, password_hash, role, avatar_url FROM users WHERE email = ?", data.email);
    if (!user) throw new Error("Email ou senha inválidos");

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) throw new Error("Email ou senha inválidos");

    const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    setTokenCookie(token);
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url } };
  });

export const signOut = createServerFn({ method: "POST" })
  .handler(async () => {
    clearTokenCookie();
    return { ok: true };
  });

export const getSessionUser = createServerFn({ method: "GET" })
  .handler(async (): Promise<AuthUser | null> => {
    const token = getTokenFromCookie();
    if (!token) return null;
    return getUserFromToken(token);
  });

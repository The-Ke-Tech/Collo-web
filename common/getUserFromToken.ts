// lib/getUserFromToken.ts
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY!);

export async function getUserFromToken() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as string, role: payload.role as string };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

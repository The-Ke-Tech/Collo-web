import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/common/lib/db";
import { generateEmailTemplate } from "@/common/email-template";
import { sendEmail } from "@/common/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  await db.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;
  const htmlBody = `
  <p>Hello ${user.name || "User"},</p>
  <p>We received a request to reset your password for your COLLTECH account.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" 
       style="background:#0d6efd;color:white;padding:15px 25px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">
      Reset Password
    </a>
  </div>
  <p>If you did not request this, you can safely ignore this email.</p>
`;


  const html = generateEmailTemplate({
    title: "Password Reset Request",
    body: htmlBody,
  });

  await sendEmail(email, "Reset Your Password - COLLTECH", html);

  return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
}

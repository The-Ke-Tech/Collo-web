import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/common/lib/db";
import { generateEmailTemplate } from "@/common/email-template";
import { sendEmail } from "@/common/lib/email";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({ where: { token } });

  // Send confirmation email
  const user = await db.user.findUnique({ where: { id: resetToken.userId } });
  const confirmationHtml = generateEmailTemplate({
    title: "Password Successfully Reset",
    body: `
      <p>Hello ${user?.name || "User"},</p>
      <p>Your COLLTECH account password has been successfully updated. If you did not perform this action, please contact our support team immediately.</p>
    `,
  });

  if (user?.email) {
    await sendEmail(user.email, "Your COLLTECH Password Was Reset", confirmationHtml);
  }

  return NextResponse.json({ message: "Password successfully reset." });
}

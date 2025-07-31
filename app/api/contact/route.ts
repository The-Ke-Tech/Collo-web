import { generateEmailTemplate } from "@/common/email-template";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Admin notification email
    const adminBody = `
      <p>You have received a new message from the contact form on your e-commerce website:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; background: #f7f7f7; font-weight: bold; width: 150px;">Name</td>
          <td style="padding: 10px; border: 1px solid #eee;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; background: #f7f7f7; font-weight: bold;">Email</td>
          <td style="padding: 10px; border: 1px solid #eee;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; background: #f7f7f7; font-weight: bold;">Message</td>
          <td style="padding: 10px; border: 1px solid #eee;">${message}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        Please reply to this email to respond to the sender.
      </p>
    `;

    await transporter.sendMail({
      from: `"COLTECH Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: "New Contact Message",
      html: generateEmailTemplate({ title: "New Contact Form Submission", body: adminBody }),
    });

    // Auto-reply to customer
    const autoReplyBody = `
      <p>Hi ${name},</p>
      <p>Thanks for contacting us! We&apos;ve received your message and our support team will get back to you shortly.</p>
      <p>Here&apos;s a copy of your message:</p>
      <blockquote style="border-left: 4px solid #0d6efd; padding-left: 10px; color: #555; margin: 10px 0;">
        ${message}
      </blockquote>
      <p>Best regards,<br/>COLTECH</p>
    `;

    await transporter.sendMail({
      from: `"COLTECH" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We&apos;ve received your message",
      html: generateEmailTemplate({ title: "Thanks for contacting us!", body: autoReplyBody }),
    });

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
  }
}

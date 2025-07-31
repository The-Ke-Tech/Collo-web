// utils/emailTemplate.ts
export function generateEmailTemplate({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: #0d6efd; color: #ffffff; padding: 15px; text-align: center;">
        <img src="https://coltech.vercel.app/logo.png" alt="Store Logo" style="height: 50px; margin-bottom: 10px;" />
        <h1 style="margin: 0; font-size: 20px;">${title}</h1>
      </div>
      <div style="padding: 20px; font-size: 16px; color: #333;">
        ${body}
      </div>
      <div style="background: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        &copy; ${new Date().getFullYear()} COLTECH. All rights reserved.
      </div>
    </div>
  </div>
  `;
}

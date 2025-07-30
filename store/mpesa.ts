import axios from "axios";

interface MpesaPayload {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  description: string;
  userId: string;
  orderId: string;
}

// Helper: Normalize Safaricom phone numbers to 2547XXXXXXXX
const normalizePhoneNumber = (phone: string) => {
  let cleaned = phone.trim();
  if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
  return cleaned;
};

export const initiateMpesaStkPush = async ({
  amount,
  phoneNumber,
  orderId,
  description = "Coltech Order Payment",
}: MpesaPayload) => {
  console.log("🔄 Initiating M-PESA STK Push...");
  console.log("📦 OrderID:", orderId);
  console.log("📱 Raw PhoneNumber:", phoneNumber);
  console.log("💰 Amount:", amount);

  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;
  const env = process.env.MPESA_ENV || "sandbox"; // "sandbox" or "production"

  if (!shortcode || !passkey || !consumerKey || !consumerSecret) {
    throw new Error("Missing M-PESA credentials. Check environment variables.");
  }

  // Select base URL based on environment
  const baseUrl =
    env === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  console.log(`🌍 Environment: ${env} | Base URL: ${baseUrl}`);
  console.log("🔑 Using Shortcode:", shortcode);
  console.log("🔑 Callback URL:", callbackUrl);

  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log("📞 Normalized Phone:", normalizedPhone);

  // Safaricom timestamp format (YYYYMMDDHHMMSS)
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, "")
    .substring(0, 14);

  const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");
  const authBuffer = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  try {
    // Step 1: Get Access Token
    console.log("🔑 Requesting M-PESA Access Token...");
    const { data: tokenRes } = await axios.get(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${authBuffer}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken = tokenRes?.access_token;
    if (!accessToken || typeof accessToken !== "string" || accessToken.length < 10) {
      throw new Error("Invalid M-PESA access token response");
    }
    console.log("✅ Access Token Received");

    // Step 2: Build STK Push payload
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: description.slice(0, 20), // Safaricom limit: 20 chars
      TransactionDesc: description,
    };

    console.log("📤 Sending STK Push Payload:", JSON.stringify(stkPayload, null, 2));

    // Step 3: Send STK Push
    const stkPushRes = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ STK Push Response:", stkPushRes.data);
    return stkPushRes.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("[MPESA_STK_PUSH_ERROR]:", error.response?.data || error.message);
    } else {
      console.error("[MPESA_STK_PUSH_ERROR]:", error);
    }
    throw error;
  }
};

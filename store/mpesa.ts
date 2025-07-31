import axios from 'axios';

interface StkPushPayload {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  description: string;
  userId: string;
  orderId: string;
}

// Normalize phone number to 2547XXXXXXXX
function normalizePhoneNumber(phone: string): string {
  // Remove spaces, dashes, or plus signs
  phone = phone.replace(/[\s\-\+]/g, '');

  if (phone.startsWith('0')) {
    return '254' + phone.substring(1);
  }

  if (phone.startsWith('254')) {
    return phone;
  }

  // Just in case someone passes '7...' only
  if (phone.startsWith('7')) {
    return '254' + phone;
  }

  throw new Error('Invalid phone number format');
}

// Utility: Pad timestamp
const pad = (n: number): string => n.toString().padStart(2, '0');

const getTimestamp = (): string => {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
};

export async function initiateMpesaStkPush(payload: StkPushPayload) {
  const {
    amount,
    phoneNumber,
    accountReference,
    description,
    orderId,
  } = payload;

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log('Normalized phone:', normalizedPhone);

  const shortCode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const callbackUrl = `${process.env.BASE_URL}/api/webhook`;

  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  try {
    // 1. Get access token
    const authRes = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        auth: {
          username: consumerKey,
          password: consumerSecret,
        },
      }
    );

    const token = authRes.data.access_token;

    // 2. Initiate STK Push
    const stkRes = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: shortCode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return stkRes.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('[MPESA_STK_ERROR]', error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error('[MPESA_STK_ERROR]', error.message);
    } else {
      console.error('[MPESA_STK_ERROR]', error);
    }

    throw new Error('M-Pesa STK push failed');
  }
}

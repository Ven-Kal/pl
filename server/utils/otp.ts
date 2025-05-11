export const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function saveOtpToStore(email: string, otp: string) {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}

export async function verifyOtpFromStore(email: string, otp: string): Promise<boolean> {
  const record = otpStore.get(email);
  if (!record) return false;
  const isValid = record.otp === otp && Date.now() < record.expiresAt;
  if (isValid) otpStore.delete(email); // Consume OTP
  return isValid;
}

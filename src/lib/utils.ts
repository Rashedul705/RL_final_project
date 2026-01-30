import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const ALLOWED_ADMIN_EMAILS = [
    'admin@rodela.com',
    'rashedul.afl@gmail.com',
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  ].filter(Boolean) as string[];

  return ALLOWED_ADMIN_EMAILS.includes(email) || email.endsWith('@rodela.com');
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

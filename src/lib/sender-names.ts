/**
 * Resolves a sender email address to a display name using the SENDER_NAMES env var.
 *
 * Format: SENDER_NAMES=email1@example.com=Display Name,email2@example.com=Other Name
 */
export function resolveSenderName(email: string | null): string | null {
  if (!email) return null;
  for (const entry of (process.env.SENDER_NAMES || '').split(',')) {
    const eq = entry.indexOf('=');
    if (eq < 1) continue;
    if (entry.slice(0, eq).trim().toLowerCase() === email.toLowerCase()) {
      return entry.slice(eq + 1).trim() || null;
    }
  }
  return null;
}

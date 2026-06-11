const fallbackUrl = "http://localhost:3000";

export function getSiteUrl() {
  try {
    return new URL(process.env.NEXTAUTH_URL ?? fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

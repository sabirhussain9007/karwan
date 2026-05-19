/** Origin for the current request (Netlify/Vercel) or NEXTAUTH_URL. */
export function detectRequestOrigin(
  host?: string,
  protocol?: string
): string {
  if (process.env.AUTH_TRUST_HOST && host) {
    const scheme = protocol === "http" ? "http" : "https";
    return `${scheme}://${host}`;
  }
  return resolveNextAuthUrl();
}

/**
 * NextAuth requires NEXTAUTH_URL to match the site origin (including on Netlify).
 * Netlify sets URL / DEPLOY_PRIME_URL at runtime; prefer those over localhost.
 */
export function resolveNextAuthUrl(): string {
  const explicit = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
  const netlifyUrl =
    process.env.URL?.trim().replace(/\/$/, "") ||
    process.env.DEPLOY_PRIME_URL?.trim().replace(/\/$/, "");

  if (explicit && !/localhost|127\.0\.0\.1/i.test(explicit)) {
    return explicit;
  }

  if (netlifyUrl && /^https?:\/\//i.test(netlifyUrl)) {
    return netlifyUrl;
  }

  return explicit || "http://localhost:3000";
}

/** Call once before NextAuth initializes so callbacks use the live site URL. */
export function applyNextAuthUrl(): string {
  const url = resolveNextAuthUrl();
  process.env.NEXTAUTH_URL = url;

  // NextAuth uses request Host when AUTH_TRUST_HOST is set (required on Netlify).
  if (
    process.env.NETLIFY === "true" ||
    process.env.URL?.includes("netlify.app")
  ) {
    process.env.AUTH_TRUST_HOST ??= "true";
  }

  return url;
}

/**
 * Absolute base URL of this deployment, used to build Stripe redirect URLs.
 *
 * Read as `APP_URL`, not `NEXT_PUBLIC_APP_URL`: Next inlines `NEXT_PUBLIC_*`
 * at build time, so in a prebuilt container the runtime value would be ignored.
 * The public name is still accepted as a fallback for existing deployments.
 *
 * A wrong value silently breaks the return trip from Stripe, so in production
 * we fail loudly rather than guess.
 */
export function getAppUrl(): string {
  const url = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('APP_URL is not set')
    }
    return 'http://localhost:3000'
  }

  return url.replace(/\/+$/, '')
}

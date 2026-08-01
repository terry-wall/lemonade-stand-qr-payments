import Stripe from 'stripe'

let client: Stripe | undefined

/**
 * Lazily construct the shared Stripe client.
 *
 * Constructing at module scope would throw during `next build`, which imports
 * every route module to read its config — long before any secret is available.
 * Pinning the API version keeps response shapes stable across Stripe releases.
 */
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Copy .env.example to .env and fill it in.'
      )
    }
    client = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  return client
}

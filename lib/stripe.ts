import Stripe from 'stripe';

export const stripe = (process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia', // Best practice to declare api version
  appInfo: {
    name: 'Pak Karwan E Bilal',
    version: '1.0.0'
  }
}) : null) as unknown as Stripe;

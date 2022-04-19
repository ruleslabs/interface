import { useCallback, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import RulesAPI from '@/utils/rulesAPI'

export function useStripePromise(): Promise<any> {
  return useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_ID ?? ''), [])
}

export function useCreatePaymentIntent(): (packId: string, quantity: number) => void {
  return useCallback(async (packId, quantity) => await RulesAPI.post('create-payment-intent', { packId, quantity }), [])
}

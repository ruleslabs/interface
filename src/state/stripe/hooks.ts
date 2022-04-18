import { useCallback, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import RulesAPI from '@/utils/rulesAPI'

export function useStripePromise(): Promise<any> {
  return useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_ID ?? ''), [])
}

export function useCreatePaymentIntent(): (packId: string) => void {
  return useCallback(async (packId) => await RulesAPI.post('create-payment-intent', { packId }), [])
}

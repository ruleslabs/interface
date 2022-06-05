import { useCallback, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'

import RulesAPI from '@/utils/rulesAPI'

export function useStripePromise(): Promise<any> {
  return useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_ID ?? ''), [])
}

interface PaymentIntent {
  clientSecret: string
}

export function useCreatePaymentIntent(): (packId: string, quantity: number) => Promise<PaymentIntent> {
  return useCallback(
    async (packId, quantity) => await RulesAPI.post<PaymentIntent>('create-payment-intent', { packId, quantity }),
    []
  )
}

export function useValidatePaymentMethod(): (paymentMethodId: string) => Promise<PaymentIntent> {
  return useCallback(
    async (paymentMethodId) => await RulesAPI.post<PaymentIntent>('validate-payment-method', { paymentMethodId }),
    []
  )
}

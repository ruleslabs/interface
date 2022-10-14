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
    async (packId, quantity) => RulesAPI.post<PaymentIntent>('payment/create', { packId, quantity }),
    []
  )
}

export function useValidatePaymentMethod(): (paymentMethod: string) => Promise<PaymentIntent> {
  return useCallback(async (paymentMethod) => RulesAPI.post<PaymentIntent>('payment/validate', { paymentMethod }), [])
}

export function useConfirmPaymentIntent(): (paymentIntent: any, paymentMethod: any) => Promise<PaymentIntent> {
  return useCallback(
    async (paymentIntent, paymentMethod) =>
      RulesAPI.post<PaymentIntent>('payment/confirm', { paymentIntent, paymentMethod }),
    []
  )
}

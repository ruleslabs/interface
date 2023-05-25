import { useCallback, useMemo } from 'react'
import { loadStripe, PaymentIntent, PaymentMethod } from '@stripe/stripe-js'

import RulesAPI from 'src/utils/rulesAPI'

export function useStripePromise(): Promise<any> {
  return useMemo(() => loadStripe(process.env.REACT_APP_STRIPE_ID ?? ''), [])
}

export function useCreatePaymentIntent(): (
  packId: string,
  quantity: number
) => Promise<{ paymentIntent: PaymentIntent }> {
  return useCallback(
    (packId, quantity) => RulesAPI.post<{ paymentIntent: PaymentIntent }>('payment/create', { packId, quantity }),
    []
  )
}

export function useValidatePaymentMethod(): (paymentMethod: string) => Promise<{ paymentMethod: PaymentMethod }> {
  return useCallback(
    (paymentMethod) => RulesAPI.post<{ paymentMethod: PaymentMethod }>('payment/validate', { paymentMethod }),
    []
  )
}

export function useConfirmPaymentIntent(): (
  paymentIntent: any,
  paymentMethod: any
) => Promise<{ paymentIntent: PaymentIntent }> {
  return useCallback(
    (paymentIntent, paymentMethod) =>
      RulesAPI.post<{ paymentIntent: PaymentIntent }>('payment/confirm', { paymentIntent, paymentMethod }),
    []
  )
}

import { useCallback } from 'react'

import RulesAPI from '@/utils/rulesAPI'

export function useCreatePaymentIntent(): (packId: string) => void {
  return useCallback(async (packId) => await RulesAPI.post('create-payment-intent', { packId }), [])
}

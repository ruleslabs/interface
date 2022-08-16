import { useState, useCallback, useEffect } from 'react'
import { RampInstantSDK, RampInstantEventTypes } from '@ramp-network/ramp-instant-sdk'

const apiKey = process.env.NEXT_PUBLIC_RAMP_API_KEY

interface RampSdkProps {
  email?: string
  address?: string
}

export default function useRampSdk({ email, address }: RampSdkProps): RampInstantSDK | null {
  const [rampSdk, setRampSdk] = useState<RampInstantSDK | null>(null)

  const newRampSdk = useCallback(() => {
    if (!email || !address || !apiKey || email !== 'clanier.dev@gmail.com') return null

    return new RampInstantSDK({
      fiatValue: '100',
      swapAsset: 'STARKNET_ETH',
      fiatCurrency: 'EUR',
      hostLogoUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/assets/ramp-logo.svg` : '',
      userEmailAddress: email,
      hostApiKey: '3ra8mwuvbgkcreuwhe6q3zth8uwhytfudxcm9b4k',
      userAddress: address,
      url: 'https://ri-widget-staging.firebaseapp.com/',
      hostAppName: 'Rules'
    }).on('WIDGET_CLOSE' as RampInstantEventTypes, () => {
      setRampSdk(newRampSdk())
    })
  }, [setRampSdk, email, address])

  useEffect(() => {
    setRampSdk(newRampSdk())
  }, [setRampSdk, email, address])

  return rampSdk
}

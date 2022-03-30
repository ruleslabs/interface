import { useState, useCallback, useEffect } from 'react'
import { RampInstantSDK, RampInstantEventTypes } from '@ramp-network/ramp-instant-sdk'

interface RampSdkProps {
  email?: string
  key?: string
}

export default function useRampSdk({ email, key }: RampSdkProps): RampInstantSDK | null {
  const [rampSdk, setRampSdk] = useState<RampInstantSDK | null>(null)

  const newRampSdk = useCallback(() => {
    if (!email || !key) return null

    return new RampInstantSDK({
      fiatValue: '100',
      swapAsset: 'ETH',
      fiatCurrency: 'EUR',
      hostAppName: 'RULES',
      hostLogoUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/assets/logo.svg` : '',
      userEmailAddress: email,
      url: process.env.NODE_ENV === 'development' ? 'https://ri-widget-staging-goerli2.firebaseapp.com/' : undefined,
      // userAddress: key,
    }).on('WIDGET_CLOSE' as RampInstantEventTypes, () => {
      setRampSdk(newRampSdk())
    })
  }, [setRampSdk, email, key])

  useEffect(() => {
    setRampSdk(newRampSdk())
  }, [setRampSdk, email, key])

  return rampSdk
}

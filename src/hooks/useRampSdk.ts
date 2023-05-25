import { useState, useCallback, useEffect } from 'react'
import { getChecksumAddress } from 'starknet'
import { RampInstantSDK, RampInstantEventTypes } from '@ramp-network/ramp-instant-sdk'

const apiKey = process.env.REACT_APP_RAMP_API_KEY

interface RampSdkProps {
  email?: string
  address?: string
}

export default function useRampSdk({ email, address }: RampSdkProps): RampInstantSDK | null {
  const [rampSdk, setRampSdk] = useState<RampInstantSDK | null>(null)

  const newRampSdk = useCallback(() => {
    if (!email || !address || !apiKey) return null

    return new RampInstantSDK({
      variant: 'auto',
      fiatValue: '100',
      swapAsset: 'STARKNET_ETH',
      fiatCurrency: 'EUR',
      hostLogoUrl: process.env.REACT_APP_APP_URL ? `${process.env.REACT_APP_APP_URL}/assets/ramp-logo.svg` : '',
      userEmailAddress: email,
      hostApiKey: apiKey,
      userAddress: getChecksumAddress(address),
      hostAppName: 'Rules',
    }).on('*' as RampInstantEventTypes, (event) => {
      switch (event.type) {
        case RampInstantEventTypes.WIDGET_CLOSE:
          setRampSdk(newRampSdk())
      }
    })
  }, [setRampSdk, email, address])

  useEffect(() => {
    setRampSdk(newRampSdk())
  }, [setRampSdk, email, address])

  return rampSdk
}

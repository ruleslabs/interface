import { useState, useCallback, useEffect, useMemo } from 'react'
import { getChecksumAddress } from 'starknet'
import { RampInstantSDK, RampInstantEventTypes } from '@ramp-network/ramp-instant-sdk'

const apiKey = process.env.REACT_APP_RAMP_API_KEY

interface RampSdkProps {
  email?: string
  address?: string
  flow: 'on' | 'off'
}

export default function useRampSdk({ email, address, flow }: RampSdkProps): RampInstantSDK | null {
  const [rampSdk, setRampSdk] = useState<RampInstantSDK | null>(null)

  // convert Rules flow to Ramp config
  const rampConfig = useMemo<Partial<ConstructorParameters<typeof RampInstantSDK>[0]>>(() => {
    switch (flow) {
      case 'on':
        return {
          swapAsset: 'STARKNET_ETH',
          enabledFlows: ['ONRAMP'],
          defaultFlow: 'ONRAMP',
        }

      case 'off':
        return {
          offrampAsset: 'STARKNET_ETH',
          enabledFlows: ['OFFRAMP'],
          defaultFlow: 'OFFRAMP',
          useSendCryptoCallback: true,
        }
    }
  }, [flow])

  // create Ramp sdk instance
  const newRampSdk = useCallback(() => {
    if (!email || !address || !apiKey) return null

    return new RampInstantSDK({
      variant: 'auto',
      fiatValue: '100',
      defaultAsset: 'STARKNET_ETH',

      fiatCurrency: 'EUR',
      hostLogoUrl: process.env.PUBLIC_URL
        ? `${process.env.PUBLIC_URL}/assets/ramp-logo.svg`
        : 'https://rules.art/assets/ramp-logo.svg',
      userEmailAddress: email,
      hostApiKey: apiKey,
      userAddress: getChecksumAddress(address),
      hostAppName: 'Rules',
      ...rampConfig,
    })
      .on('*', (event) => {
        switch (event.type) {
          case RampInstantEventTypes.WIDGET_CLOSE:
            setRampSdk(newRampSdk())
            break
        }
      })
      .onSendCrypto(async (_, amount, address) => {
        console.log(amount, address)
        return { txHash: '0xdead' }
      })
  }, [email, address, flow])

  useEffect(() => {
    setRampSdk(newRampSdk())
  }, [newRampSdk])

  return rampSdk
}

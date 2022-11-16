import React, { useEffect, useState, useCallback } from 'react'
import { t, Trans } from '@lingui/macro'

import { metaMask, metaMaskHooks, desiredChainId } from '@/constants/connectors'
import { ThirdPartyButton } from '@/components/Button'
import { InfoCard, ErrorCard } from '@/components/Card'
import Column from '@/components/Column'
import Link from '@/components/Link'

import MetamaskIcon from '@/images/metamask.svg'

const { useAccount, useChainId } = metaMaskHooks

interface MetamaskProps {
  children: React.ReactNode
}

export default function Metamask({ children }: MetamaskProps) {
  // metamask
  const account = useAccount()
  const chainId = useChainId()
  const activateMetamask = useCallback(() => metaMask.activate(desiredChainId), [metaMask, desiredChainId])
  const [metamaskFound, setMetamaskFound] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly()
    if (typeof window.ethereum !== 'undefined') {
      setMetamaskFound(true)
    }
  }, [])

  if (account && chainId === desiredChainId) return <>{children}</>
  else if (account)
    return (
      <ErrorCard textAlign="center">
        <Trans>
          Metamask connected to the wrong network,
          <br />
          please&nbsp;
          <span onClick={activateMetamask}>switch network</span>
        </Trans>
      </ErrorCard>
    )
  else if (metamaskFound)
    return (
      <Column>
        <ThirdPartyButton title={t`Connect Metamask`} onClick={activateMetamask}>
          <MetamaskIcon />
        </ThirdPartyButton>
      </Column>
    )
  else
    return (
      <InfoCard textAlign="center">
        <Trans>
          Haven’t got an Ethereum wallet yet?
          <br />
          Learn how to create one with&nbsp;
          <Link href="https://metamask.io/" target="_blank" color="text1" underline>
            Metamask
          </Link>
        </Trans>
      </InfoCard>
    )
}

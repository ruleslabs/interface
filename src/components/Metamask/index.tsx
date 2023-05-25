import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Trans } from '@lingui/macro'

import { metaMask, metaMaskHooks } from 'src/constants/connectors'
import { InfoCard, ErrorCard } from 'src/components/Card'
import Column from 'src/components/Column'
import Link from 'src/components/Link'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { PrimaryButton } from '../Button'

const { useAccount, useChainId } = metaMaskHooks

interface MetamaskProps {
  children: React.ReactNode
}

export default function Metamask({ children }: MetamaskProps) {
  // metamask
  const account = useAccount()
  const chainId = useChainId()
  const activateMetamask = useCallback(() => metaMask.activate(rulesSdk.networkInfos.ethereumChainId), [metaMask])
  const [metamaskFound, setMetamaskFound] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly()
    if (typeof window.ethereum !== 'undefined') {
      setMetamaskFound(true)
    }
  }, [])

  return useMemo(() => {
    if (account && chainId === rulesSdk.networkInfos.ethereumChainId) {
      return <>{children}</>
    }

    if (account) {
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
    }

    if (metamaskFound) {
      return (
        <Column>
          <PrimaryButton onClick={activateMetamask}>
            <Trans>Connect Metamask</Trans>
          </PrimaryButton>
        </Column>
      )
    }

    return (
      <InfoCard textAlign="center">
        <Trans>
          Haven&apos;t got an Ethereum wallet yet?
          <br />
          Learn how to create one with&nbsp;
          <Link href="https://metamask.io/" target="_blank" color="text1" underline>
            Metamask
          </Link>
        </Trans>
      </InfoCard>
    )
  }, [account, chainId, children, activateMetamask, metamaskFound])
}

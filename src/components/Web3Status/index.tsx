import { Trans } from '@lingui/macro'
import { useAccount } from '@starknet-react/core'
import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'
import { ErrorCard } from 'src/components/Card'
import { useSwitchL1Chain } from 'src/hooks/useSwitchNetwork'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useEthereumWalletConnectModalToggle, useStarknetWalletConnectModalToggle } from 'src/state/application/hooks'

import { PrimaryButton } from '../Button'
import { EthereumWalletConnectModal, StarknetWalletConnectModal } from '../ExternalWalletModal/Connect'

// ETHEREUM

function EthereumStatusContent({ children }: React.HTMLAttributes<HTMLDivElement>) {
  const { account, chainId } = useWeb3React()

  // modal
  const toggleEthereumWalletConnectModal = useEthereumWalletConnectModalToggle()

  // chain id
  const switchL1Chain = useSwitchL1Chain()

  return useMemo(() => {
    if (account && chainId === rulesSdk.networkInfos.ethereumChainId) {
      return <>{children}</>
    }

    if (account) {
      return (
        <ErrorCard textAlign="center">
          <Trans>
            Wallet connected to the wrong network,
            <br />
            please&nbsp;
            <span onClick={switchL1Chain}>switch network</span>
          </Trans>
        </ErrorCard>
      )
    }

    return (
      <PrimaryButton onClick={toggleEthereumWalletConnectModal} large>
        Connect wallet
      </PrimaryButton>
    )
  }, [account, chainId, children, toggleEthereumWalletConnectModal])
}

export function EthereumStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <EthereumStatusContent {...props} />

      <EthereumWalletConnectModal />
    </>
  )
}

// STARKNET

function StarknetStatusContent({ children }: React.HTMLAttributes<HTMLDivElement>) {
  const { account } = useAccount()

  // modal
  const toggleStarknetWalletConnectModal = useStarknetWalletConnectModalToggle()

  // chain id
  // const switchL1Chain = useSwitchL1Chain()

  return useMemo(() => {
    if (account && (account as any).provider.chainId === rulesSdk.networkInfos.starknetChainId) {
      return <>{children}</>
    }

    if (account) {
      return (
        <ErrorCard textAlign="center">
          <Trans>
            Wallet connected to the wrong network,
            <br />
            please switch network
          </Trans>
        </ErrorCard>
      )
    }

    return (
      <PrimaryButton onClick={toggleStarknetWalletConnectModal} large>
        Connect wallet
      </PrimaryButton>
    )
  }, [account, children, toggleStarknetWalletConnectModal])
}

export function StarknetStatus(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <StarknetStatusContent {...props} />

      <StarknetWalletConnectModal />
    </>
  )
}

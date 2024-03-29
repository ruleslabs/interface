import { Trans } from '@lingui/macro'
import { useAccount } from '@starknet-react/core'
import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'src/constants/chainInfo'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

import { PrimaryButton } from '../Button'
import Link from '../Link'
import LongString from '../Text/LongString'
import { EthereumStatus, StarknetStatus } from '../Web3Status'

// ETHEREUM

export function ExternalEthereumWalletStatus() {
  const { account } = useWeb3React()

  return (
    <EthereumStatus>
      <LongString value={account ?? ''} copiable />
    </EthereumStatus>
  )
}

// STARKNET

export function ExternalStarknetAccountStatus() {
  const { address } = useAccount()

  return (
    <StarknetStatus>
      <LongString value={address ?? ''} copiable />

      <Link
        target="_blank"
        href={`${getChainInfo(rulesSdk.networkInfos.starknetChainId)?.explorer}/contract/${address}#portfolio-sub-nfts`}
      >
        <PrimaryButton>
          <Trans>See on Starkscan</Trans>
        </PrimaryButton>
      </Link>
    </StarknetStatus>
  )
}

import { useAccount } from '@starknet-react/core'

import { EthereumStatus, StarknetStatus } from '../Web3Status'
import LongString from '../Text/LongString'
import { useWeb3React } from '@web3-react/core'

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

  console.log(address)

  return (
    <StarknetStatus>
      <LongString value={address ?? ''} copiable />
    </StarknetStatus>
  )
}

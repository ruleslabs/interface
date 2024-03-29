import { constants, Unit } from '@rulesorg/sdk-core'
import { useCallback, useEffect } from 'react'
import StarknetSigner from 'src/components/StarknetSigner/Transaction'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useETHBalance } from 'src/state/wallet/hooks'
import { Call } from 'starknet'

import { ModalBody } from '../Modal/Sidebar'
import { PaginationSpinner } from '../Spinner'

export default function MigrateFunds() {
  // account
  const { address, oldAddress } = useRulesAccount()

  // balance
  const oldBalance = useETHBalance(oldAddress)

  // starknet tx
  const { setSigning, setCalls, resetStarknetTx, setMigration, setBeforeExecutionCallback } = useStarknetTx()

  const setTransferCall = useCallback(() => {
    const ethAddress = constants.ETH_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    if (!ethAddress || !address) return

    setCalls([
      {
        contractAddress: ethAddress,
        entrypoint: 'transfer',
        calldata: [address, 1, 0],
      },
    ])
  }, [address])

  const beforeExecution = useCallback(
    async (calls: Call[], maxFee: string) => {
      // should not happen
      if (!address || !oldBalance || !calls[0]) return []

      const amount = oldBalance.subtract(maxFee).toUnitFixed(Unit.WEI)

      // edit calls
      calls[0].calldata = [address, amount, 0]
      return calls
    },
    [address, oldBalance]
  )

  useEffect(() => {
    resetStarknetTx()
    setMigration(true)
  }, [])

  useEffect(() => {
    setBeforeExecutionCallback(beforeExecution)
  }, [beforeExecution])

  useEffect(() => {
    setTransferCall()
  }, [setTransferCall])

  useEffect(() => {
    setSigning(true)
  }, [oldBalance])

  return (
    <ModalBody>
      <StarknetSigner action="ethTransfer" allowUndeployed>
        <PaginationSpinner loading={true} />
      </StarknetSigner>
    </ModalBody>
  )
}

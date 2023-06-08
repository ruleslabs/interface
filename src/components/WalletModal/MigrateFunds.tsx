import { useCallback, useEffect } from 'react'
import { t } from '@lingui/macro'
import { Unit, constants } from '@rulesorg/sdk-core'
import { Call } from 'starknet'

import StarknetSigner, { StarknetSignerDisplayProps } from 'src/components/StarknetSigner'
import { useETHBalance } from 'src/state/wallet/hooks'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { ModalBody } from '../Modal/Sidebar'
import { PaginationSpinner } from '../Spinner'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import useRulesAccount from 'src/hooks/useRulesAccount'

const display: StarknetSignerDisplayProps = {
  confirmationText: t`Your migration is on its way`,
  confirmationActionText: t`Confirm migration`,
  transactionText: t`ETH migration to your upgraded wallet`,
}

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

      calls[0].calldata = [address, oldBalance.subtract(maxFee).toUnitFixed(Unit.WEI), 0]
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
      <StarknetSigner display={display}>
        <PaginationSpinner loading={true} />
      </StarknetSigner>
    </ModalBody>
  )
}

import { gql, useMutation } from '@apollo/client'
import { Trans } from '@lingui/macro'
import { useAccount } from '@starknet-react/core'
import { useCallback, useEffect } from 'react'
import { PrimaryButton } from 'src/components/Button'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened } from 'src/state/application/hooks'
import { TYPE } from 'src/styles/theme'
import { Column } from 'src/theme/components/Flex'
import { Call } from 'starknet'

import { ModalBody } from '../Modal/Classic'
import { PaginationSpinner } from '../Spinner'
import StarknetSigner from '../StarknetSigner/Transaction'
import { StarknetStatus } from '../Web3Status'

const PREPARE_PACKS_MUTATION = gql`
  mutation {
    preparePacksMinting {
      amount
      tokenId
      voucherSigningData {
        signature {
          r
          s
        }
        salt
      }
    }
  }
`

export default function CardsTransfers() {
  // modal
  const isOpen = useModalOpened(ApplicationModal.MIGRATE_COLLECTION)

  // starknet accounts
  const { address: rulesAddress } = useRulesAccount()
  const { address: externalAddress } = useAccount()

  // starknet tx
  const { setCalls, resetStarknetTx, setSigning } = useStarknetTx()

  // packs migration
  const migratePacks = useCallback(
    (data: any) => {
      const packsVouchers: any[] = data?.preparePacksMinting

      if (!rulesAddress || !externalAddress || !packsVouchers) return

      // save calls
      setCalls(
        packsVouchers
          .map((packVoucher) =>
            rulesSdk.getVoucherRedeemToCall(
              rulesAddress,
              externalAddress,
              packVoucher.tokenId,
              packVoucher.amount,
              packVoucher.voucherSigningData.salt,
              packVoucher.voucherSigningData.signature
            )
          )
          .filter((call): call is Call => !!call)
      )

      setSigning(true)
    },
    [rulesAddress, externalAddress, setCalls, setSigning]
  )

  // packs query
  const [preparePackMinting, { loading }] = useMutation(PREPARE_PACKS_MUTATION, { onCompleted: migratePacks })

  // packs transfer call
  const handleMigration = useCallback(() => preparePackMinting(), [preparePackMinting])

  // on modal update
  useEffect(() => {
    resetStarknetTx()
  }, [isOpen])

  return (
    <ModalBody>
      <StarknetSigner action="packTransfer">
        {loading ? (
          <PaginationSpinner loading />
        ) : (
          <Column gap="32">
            <TYPE.body textAlign="justify">
              <Trans>
                Please note that the transfer of packs is final and will irrevocably seal the transferred packs,
                preventing them from being opened in the future.
              </Trans>
            </TYPE.body>

            <StarknetStatus>
              <PrimaryButton onClick={handleMigration} large>
                <Trans>Confirm</Trans>
              </PrimaryButton>
            </StarknetStatus>
          </Column>
        )}
      </StarknetSigner>
    </ModalBody>
  )
}

import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { t } from '@lingui/macro'
import { constants } from '@rulesorg/sdk-core'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'

import Spinner from 'src/components/Spinner'
import { ReactComponent as Close } from 'src/images/close.svg'

const RejectedStatus = styled(Close)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.error};
  width: 32px;
  height: 32px;
  padding: 8px;
  stroke: ${({ theme }) => theme.text1};
`

const StyledSpinner = styled(Spinner)`
  width: 32px;
  height: 32px;
  margin: 0;
`

const StyledOffchainAction = styled(RowCenter)`
  padding: 12px 20px;
  gap: 16px;
`

// EVENT MGMT

interface OffchainActionProps {
  action: string
  status: string
}

export default function OffchainAction({ action, status }: OffchainActionProps) {
  const actionText = useMemo(() => {
    switch (action) {
      case constants.StarknetTransactionAction.ACCOUNT_DEPLOYMENT:
        return t`Wallet deployment`

      case constants.StarknetTransactionAction.PACKS_DELIVERY:
        return t`Pack delivery`

      case constants.StarknetTransactionAction.PACKS_OPENING_PREPARATION:
        return t`Pack opening`

      case constants.StarknetTransactionAction.PACKS_OPENING:
        return t`Pack cards delivery`

      case constants.StarknetTransactionAction.WALLET_UPGRADE:
        return t`Wallet upgrade`

      case constants.StarknetTransactionAction.SIGNER_ESCAPE_TRIGGERED:
        return t`Wallet password update triggering`

      case constants.StarknetTransactionAction.SIGNER_ESCAPED:
        return t`Wallet password update`

      case constants.StarknetTransactionAction.WITHDRAW:
        return t`ETH Withdraw`

      case constants.StarknetTransactionAction.CARD_TRANSFER:
        return t`Card transfer`

      case constants.StarknetTransactionAction.OFFER_CREATION:
        return t`Offer creation`

      case constants.StarknetTransactionAction.OFFER_CANCELLATION:
        return t`Offer cancellation`

      case constants.StarknetTransactionAction.OFFER_ACCEPTANCE:
        return t`Offer acceptance`

      default:
        return 'Unkown transation' // should not happen
    }
  }, [action])

  return (
    <StyledOffchainAction>
      {status === 'REJECTED' && <RejectedStatus />}
      {status === 'RECEIVED' && <StyledSpinner />}

      <TYPE.medium>{actionText}</TYPE.medium>
    </StyledOffchainAction>
  )
}

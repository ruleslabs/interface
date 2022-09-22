import { useMemo } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { BackButton, PrimaryButton } from '@/components/Button'
import { useWithdrawModalToggle } from '@/state/application/hooks'
import Metamask from '@/components/Metamask'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'

const RetrievableWrapper = styled(Column)`
  width: 100%;
  gap: 8px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
`

const StyledL1Claim = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
  gap: 26px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface L1ClaimProps {
  onDismiss(): void
}

export default function L1Claim({ onDismiss }: L1ClaimProps) {
  // modal
  const toggleWithdrawModal = useWithdrawModalToggle()

  // amount
  const amount = '7280000000000000'
  const parsedAmount = useMemo(() => WeiAmount.fromRawAmount(amount), [amount])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledL1Claim>
      <ModalHeader onDismiss={toggleWithdrawModal}>
        <BackButton onClick={onDismiss} />
      </ModalHeader>

      <Column gap={26}>
        <TYPE.large>
          <Trans>Retrieve your available ETH</Trans>
        </TYPE.large>

        <RetrievableWrapper>
          <TYPE.body>
            <Trans>Total balance</Trans>
          </TYPE.body>

          <Row gap={16}>
            <TYPE.medium>{parsedAmount?.toSignificant(6) ?? 0} ETH</TYPE.medium>
            <TYPE.medium color="text2">{weiAmountToEURValue(parsedAmount) ?? 0}€</TYPE.medium>
          </Row>
        </RetrievableWrapper>

        <Metamask>
          <PrimaryButton large>
            <Trans>Claim</Trans>
          </PrimaryButton>
        </Metamask>
      </Column>
    </StyledL1Claim>
  )
}

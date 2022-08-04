import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'
import { PrimaryButton } from '@/components/Button'
import Link from '@/components/Link'

import Checkmark from '@/images/checkmark.svg'

const StyledCheckmark = styled(Checkmark)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.primary1};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const Title = styled(TYPE.large)`
  text-align: center;
  width: 100%;
`

const Subtitle = styled(TYPE.body)`
  text-align: center;
  width: 100%;
  max-width: 420px;

  span {
    font-weight: 700;
  }
`

const SeeMyPacksButtonWrapper = styled(ColumnCenter)`
  width: 100%;
  gap: 16px;

  a {
    max-width: 380px;
    width: 100%;
  }

  button {
    height: 50px;
    width: 100%;
  }
`

interface ConfirmationProps {
  packName: string
  amountPaid: number
}

export default function Confirmation({ packName, amountPaid }: ConfirmationProps) {
  const currentUser = useCurrentUser()

  return (
    <ColumnCenter gap={32}>
      <Column gap={24}>
        <StyledCheckmark />

        <Column gap={8}>
          <Title>
            <Trans>Your {packName} is on its way</Trans>
          </Title>

          <Subtitle>
            <Trans>
              Thank you, your payment has been successful.
              <br />A confirmation email has been sent to&nbsp;
              <span style={{ fontWeight: 700 }}>{currentUser.email}</span>
            </Trans>
          </Subtitle>
        </Column>
      </Column>

      <SeeMyPacksButtonWrapper>
        <Link href={`/user/${currentUser.slug}/packs`}>
          <PrimaryButton large>
            <Trans>See my packs</Trans>
          </PrimaryButton>
        </Link>

        <TYPE.subtitle>
          <Trans>
            Estimated delivery on&nbsp;
            <strong>June 29</strong>
          </Trans>
        </TYPE.subtitle>
      </SeeMyPacksButtonWrapper>
    </ColumnCenter>
  )
}

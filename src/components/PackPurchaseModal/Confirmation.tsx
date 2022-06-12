import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column from '@/components/Column'
import { RowBetween } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import { useCurrentUser } from '@/state/user/hooks'

import Checkmark from '@/images/checkmark.svg'

const StyledCheckmark = styled(Checkmark)`
  width: 64px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.primary1};
`

const Title = styled(TYPE.large)`
  font-weight: 400;
  text-align: center;
  width: 100%;

  span {
    font-weight: 700;
  }
`

interface ConfirmationProps {
  packName: string
  amountPaid: number
}

export default function Confirmation({ packName, amountPaid }: ConfirmationProps) {
  const currentUser = useCurrentUser()

  return (
    <Column gap={32}>
      <StyledCheckmark />

      <Title>
        <Trans>
          Your&nbsp;
          <span>{packName}&nbsp;</span>
          is on its way
        </Trans>
      </Title>

      <TYPE.body textAlign="center" color="text2" spanColor="text1">
        <Trans>
          Thank you, your payment has been successful. A confirmation email has been sent to&nbsp;
          <span style={{ fontWeight: 700 }}>{currentUser.email}</span>
        </Trans>
      </TYPE.body>

      <RowBetween gap={8}>
        <TYPE.subtitle>
          <Trans>
            Estimated delivery on&nbsp;
            <strong>June 29</strong>
          </Trans>
        </TYPE.subtitle>
        <Link href={`/user/${currentUser.slug}/packs`}>
          <TYPE.subtitle underline clickable>
            <Trans>See my packs</Trans>
          </TYPE.subtitle>
        </Link>
      </RowBetween>
    </Column>
  )
}

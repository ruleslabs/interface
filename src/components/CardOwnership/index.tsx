import styled from 'styled-components'
import { Trans, Plural } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import Present from '@/images/present.svg'
import Link from '@/components/Link'
import Placeholder from '@/components/Placeholder'

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
`

const ButtonsWrapper = styled(Column)`
  button {
    width: 100%;
  }
`

const StyledPresent = styled(Present)`
  width: 16px;
`

interface RuleOwnershipProps {
  ownerSlug: string
  ownerUsername: string
  ownerProfilePictureUrl: string
  askEur?: number
}

export default function RuleOwnership({
  ownerSlug,
  ownerUsername,
  ownerProfilePictureUrl,
  askEur,
}: RuleOwnershipProps) {
  const currentUser = useCurrentUser()

  return (
    <Column gap={16}>
      <RowCenter gap={12}>
        <Link href={`/${ownerSlug}`}>
          <Avatar src={ownerProfilePictureUrl} />
        </Link>
        <TYPE.body>
          <Trans>
            Belongs to&nbsp;
            <Link href={`/user/${ownerSlug}`} color="text1" underline>
              {ownerUsername}
            </Link>
          </Trans>
        </TYPE.body>
      </RowCenter>
      <ButtonsWrapper gap={12}>
        {!!askEur || currentUser?.slug === ownerSlug ? (
          <>
            {currentUser?.slug === ownerSlug && !!askEur ? (
              <PrimaryButton large>
                <Trans>Close offer - {askEur}€</Trans>
              </PrimaryButton>
            ) : (
              <PrimaryButton large>
                <Plural value={askEur ?? 0} _0="Place for Sale" other="Buy - {0}€" />
              </PrimaryButton>
            )}
            {!askEur && (
              <SecondaryButton large>
                <RowCenter justify="center" gap={4}>
                  <StyledPresent />
                  <Trans>Offer</Trans>
                </RowCenter>
              </SecondaryButton>
            )}
          </>
        ) : (
          <Placeholder>
            <Trans>This card is not on sale.</Trans>
          </Placeholder>
        )}
      </ButtonsWrapper>
    </Column>
  )
}

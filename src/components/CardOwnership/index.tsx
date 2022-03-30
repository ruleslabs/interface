import styled from 'styled-components'

import { useCurrentUser } from '@/state/user/hooks'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import Present from '@/images/present.svg'
import Link from '@/components/Link'
import Card from '@/components/Card'
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
    <Card width="350px">
      <Column gap={16}>
        <RowCenter gap={12}>
          <Link href={`/${ownerSlug}`}>
            <Avatar src={ownerProfilePictureUrl} />
          </Link>
          <TYPE.body>
            {'appartient à '}
            <Link href={`/${ownerSlug}`}>
              <TYPE.body clickable>{ownerUsername}</TYPE.body>
            </Link>
          </TYPE.body>
        </RowCenter>
        <ButtonsWrapper gap={12}>
          {!!askEur || currentUser?.slug === ownerSlug ? (
            <>
              <PrimaryButton large>{askEur ? `Acheter - ${askEur}€` : 'Mettre en vente'}</PrimaryButton>
              {!askEur && (
                <SecondaryButton large>
                  <RowCenter justify="center" gap={4}>
                    <StyledPresent />
                    Offrir
                  </RowCenter>
                </SecondaryButton>
              )}
            </>
          ) : (
            <Placeholder>Cet exemplaire n’est pas à vendre.</Placeholder>
          )}
        </ButtonsWrapper>
      </Column>
    </Card>
  )
}

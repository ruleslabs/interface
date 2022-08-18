import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton, SecondaryButton } from '@/components/Button'
import Link from '@/components/Link'
import Placeholder from '@/components/Placeholder'
import { useOfferModalToggle } from '@/state/application/hooks'

import Present from '@/images/present.svg'

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
  fill: ${({ theme }) => theme.text1};
`

interface CardOwnershipProps {
  ownerSlug: string
  ownerUsername: string
  ownerProfilePictureUrl: string
  askEUR?: string
  askETH?: string
}

export default function CardOwnership({
  ownerSlug,
  ownerUsername,
  ownerProfilePictureUrl,
  askEUR,
  askETH,
}: CardOwnershipProps) {
  const currentUser = useCurrentUser()

  const toggleOfferModal = useOfferModalToggle()

  return (
    <Column gap={16}>
      <RowCenter gap={12}>
        <Link href={`/user/${ownerSlug}`}>
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
        {askETH || currentUser?.slug === ownerSlug ? (
          <>
            {currentUser?.slug === ownerSlug && askEUR ? (
              <PrimaryButton large>
                <Trans>
                  Close offer - {askETH} ETH {askEUR ? `(${askEUR}€)` : null}
                </Trans>
              </PrimaryButton>
            ) : (
              <PrimaryButton disabled large>
                {askETH ? (
                  <Trans>
                    Buy - {askETH} ETH {askEUR ? `(${askEUR}€)` : null}
                  </Trans>
                ) : (
                  <Trans>Place for Sale</Trans>
                )}
              </PrimaryButton>
            )}
            {!askEUR && (
              <SecondaryButton onClick={toggleOfferModal} large>
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

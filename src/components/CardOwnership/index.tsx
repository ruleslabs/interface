import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import Link from 'src/components/Link'
import Placeholder from 'src/components/Placeholder'
import {
  useOfferModalToggle,
  useCreateOfferModalToggle,
  useCancelOfferModalToggle,
  useAcceptOfferModalToggle,
} from 'src/state/application/hooks'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import Avatar from 'src/components/Avatar'
import { OwnerUser } from 'src/types'
import { usePendingOperations } from 'src/hooks/usePendingOperations'
import useTrans from 'src/hooks/useTrans'

import { ReactComponent as Present } from 'src/images/present.svg'

const StyledAvatar = styled(Avatar)`
  width: 50px;
  height: 50px;
`

const StyledPresent = styled(Present)`
  width: 16px;
  fill: ${({ theme }) => theme.text1};
`

interface CardOwnershipProps {
  owner: OwnerUser
  tokenId: string
  price?: string
}

export default function CardOwnership({ owner, tokenId, price }: CardOwnershipProps) {
  // current user
  const { currentUser } = useCurrentUser()

  // i18n
  const trans = useTrans()

  // modal
  const toggleOfferModal = useOfferModalToggle()
  const toggleCreateOfferModal = useCreateOfferModalToggle()
  const toggleCancelOfferModal = useCancelOfferModalToggle()
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()

  // price parsing
  const parsedPrice = useMemo(() => (price ? WeiAmount.fromRawAmount(price) : null), [price])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // pending operations
  const pendingOperations = usePendingOperations(tokenId)
  const pendingOperation = pendingOperations[0]

  const isOwner = currentUser?.slug === owner.slug
  const availableActions = useMemo(() => {
    if (pendingOperation) {
      return <Placeholder>{trans('operation', pendingOperation.type)}</Placeholder>
    }

    if (isOwner) {
      // OWNER

      if (parsedPrice) {
        return (
          <>
            <PrimaryButton onClick={toggleCancelOfferModal} width={'full'} large>
              <Trans>Close offer</Trans>
            </PrimaryButton>

            <SecondaryButton onClick={toggleCreateOfferModal} width={'full'} large>
              <Trans>Update price</Trans>
            </SecondaryButton>
          </>
        )
      } else {
        return (
          <>
            <PrimaryButton onClick={toggleCreateOfferModal} width={'full'} large>
              <Trans>Place for Sale</Trans>
            </PrimaryButton>

            <SecondaryButton onClick={toggleOfferModal} width={'full'} large>
              <RowCenter justify="center" gap={4}>
                <StyledPresent />
                <Trans>Gift</Trans>
              </RowCenter>
            </SecondaryButton>
          </>
        )
      }
    } else {
      // NOT OWNER

      if (parsedPrice) {
        return (
          <PrimaryButton onClick={toggleAcceptOfferModal} width={'full'} large>
            <Trans>
              Buy - {parsedPrice.toSignificant(6)} ETH ({weiAmountToEURValue(parsedPrice)}€)
            </Trans>
          </PrimaryButton>
        )
      } else {
        return (
          <Placeholder>
            <Trans>This card is not on sale.</Trans>
          </Placeholder>
        )
      }
    }
  }, [
    isOwner,
    parsedPrice,
    toggleAcceptOfferModal,
    toggleCreateOfferModal,
    toggleCancelOfferModal,
    toggleOfferModal,
    weiAmountToEURValue,
    !!pendingOperation,
    trans,
  ])

  return (
    <Column gap={16}>
      <RowCenter gap={12}>
        <Link href={`/user/${owner.slug}`}>
          <StyledAvatar src={owner.profile.pictureUrl} fallbackSrc={owner.profile.fallbackUrl} />
        </Link>
        <TYPE.body>
          <Trans>
            Belongs to&nbsp;
            <Link href={`/user/${owner.slug}`} color="text1" underline>
              {owner.username}
            </Link>
          </Trans>
        </TYPE.body>
      </RowCenter>
      <Column gap={12}>{availableActions}</Column>
    </Column>
  )
}

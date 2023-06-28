import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'
import { useCallback, useMemo, useState } from 'react'
import { gql, useMutation } from '@apollo/client'

import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from 'src/components/Modal/Classic'
import { useClaimLiveRewardModalToggle, useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { TYPE } from 'src/styles/theme'
import { ColumnCenter } from 'src/components/Column'
import { PaginationSpinner } from 'src/components/Spinner'
import useLocationQuery from 'src/hooks/useLocationQuery'

import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import { ReactComponent as Close } from 'src/images/close.svg'
import { PrimaryButton } from '../Button'
import { Column, Row } from 'src/theme/components/Flex'
import CardBreakdown from '../MarketplaceModal/CardBreakdown'

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

const StyledFail = styled(Close)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.error};
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
`

const ErrorMessage = styled(Subtitle)`
  text-align: center;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.error};
`

const CLAIM_LIVE_REWARD = gql`
  mutation ($liveRewardId: ID!, $userId: ID!) {
    claimLiveReward(input: { liveRewardId: $liveRewardId, userId: $userId }) {
      user {
        username
      }
      card {
        serialNumber
        cardModel {
          pictureUrl(derivative: "width=256")
          season
          scarcity {
            name
          }
          artistName
        }
      }
    }
  }
`

export default function ClaimLiveRewardModal() {
  const [user, setUser] = useState<any | null>(null)
  const [card, setCard] = useState<any | null>(null)

  // router
  const query = useLocationQuery()
  const userId = query.get('userId')
  const liveRewardId = query.get('liveRewardId')

  // modal
  const toggleClaimLiveRewardModal = useClaimLiveRewardModalToggle()
  const isOpen = useModalOpened(ApplicationModal.CLAIM_LIVE_REWARD)

  // graphql mutations
  const [claimLiveRewardMutation, { loading, error }] = useMutation(CLAIM_LIVE_REWARD)

  // claim live reward
  const claim = useCallback(async () => {
    const { data } = await claimLiveRewardMutation({ variables: { liveRewardId, userId } })

    setUser(data?.claimLiveReward?.user ?? null)
    setCard(data?.claimLiveReward?.card ?? null)
  }, [claimLiveRewardMutation, userId, liveRewardId])

  const modalContent = useMemo(() => {
    if (error) {
      return (
        <ColumnCenter gap={32}>
          <StyledFail />

          <ErrorMessage>{JSON.stringify(error)}</ErrorMessage>
        </ColumnCenter>
      )
    }

    if (loading) {
      return <PaginationSpinner loading />
    }

    if (user && card) {
      return (
        <ColumnCenter gap={32}>
          <Column gap={'24'} width={'full'}>
            <StyledCheckmark />

            <ColumnCenter gap={8}>
              <Title>
                <Trans>Live reward sent to {user.username}</Trans>
              </Title>
            </ColumnCenter>

            <CardBreakdown
              pictureUrl={card.cardModel.pictureUrl}
              season={card.cardModel.season}
              artistName={card.cardModel.artistName}
              scarcityName={card.cardModel.scarcity.name}
              serialNumbers={[card.serialNumber]}
            />
          </Column>
        </ColumnCenter>
      )
    }

    return (
      <Row justifyContent={'center'}>
        <PrimaryButton onClick={claim} width={'256'} large>
          <Trans>Confirm</Trans>
        </PrimaryButton>
      </Row>
    )
  }, [error, loading, user, card, claim])

  return (
    <ClassicModal onDismiss={toggleClaimLiveRewardModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleClaimLiveRewardModal} title={t`Live reward | Claim`} />

        <ModalBody>{modalContent}</ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

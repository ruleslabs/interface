import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { ApolloError } from 'apollo-client'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { useClaimLiveRewardModalToggle, useModalOpened } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import Spinner from '@/components/Spinner'

import Checkmark from '@/images/checkmark.svg'
import Close from '@/images/close.svg'

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

const StyledSpinner = styled(Spinner)`
  margin: 0 auto;
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
    }
  }
`

export default function ClaimLiveRewardModal() {
  // router
  const router = useRouter()
  const { userId, liveRewardId } = router.query

  // modal
  const toggleClaimLiveRewardModal = useClaimLiveRewardModalToggle()
  const isOpen = useModalOpened(ApplicationModal.CLAIM_LIVE_REWARD)

  // user
  const [user, setUser] = useState<any | null>(null)

  // graphql mutations
  const [claimLiveRewardMutation] = useMutation(CLAIM_LIVE_REWARD)

  // errors
  const [error, setError] = useState<string | null>(null)

  // claim live reward
  const [claimed, setClaimed] = useState(false)
  useEffect(() => {
    if (claimed || !isOpen) return
    setClaimed(true)

    claimLiveRewardMutation({ variables: { liveRewardId, userId } })
      .then((res: any) => {
        setUser(res?.data?.claimLiveReward?.user ?? null)
      })
      .catch((claimLiveRewardError: ApolloError) => {
        const error = claimLiveRewardError?.graphQLErrors?.[0]
        if (error) setError(error.message)
        else setError('Unknown error')
      })
  }, [claimLiveRewardMutation, userId, liveRewardId, claimed, isOpen])

  return (
    <ClassicModal onDismiss={toggleClaimLiveRewardModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleClaimLiveRewardModal} title={t`Live reward | Claim`} />

        <ModalBody>
          <ColumnCenter gap={32}>
            <Column gap={24}>
              {user ? <StyledCheckmark /> : error ? <StyledFail /> : <StyledSpinner fill="primary1" />}

              {user ? (
                <ColumnCenter gap={8}>
                  <Title>Live reward sent to {user.username}</Title>
                </ColumnCenter>
              ) : (
                error && (
                  <ColumnCenter gap={8}>
                    <Title>Your live reward claim</Title>

                    <ErrorMessage>{error}</ErrorMessage>
                  </ColumnCenter>
                )
              )}
            </Column>
          </ColumnCenter>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import { ModalHeader } from '@/components/Modal'
import ClassicModal, { ModalContent, ModalBody } from '@/components/Modal/Classic'
import { useAvatarEditModalToggle, useModalOpened } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import useDefaultAvatarUrls from '@/hooks/useDefaultAvatarUrls'
import { useEditAvatarMutation } from '@/state/user/hooks'
import useCurrentUser from '@/hooks/useCurrentUser'

const AvatarsGrid = styled.div`
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  gap: 32px;

  ${({ theme }) => theme.media.medium`
    grid-template-columns: repeat(2, minmax(auto, 256px));
  `}
`

const AvatarWrapper = styled.div<{ selected: boolean }>`
  ${({ selected, theme }) => selected && `border: 3px solid ${theme.primary1}`};
  border-radius: 50%;
  cursor: pointer;

  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  &:hover img {
    filter: brightness(0.4);
  }
`

interface AvatarEditModalProps {
  currentAvatarId: number
  customAvatarUrl?: string
}

export default function AvatarEditModal({ currentAvatarId, customAvatarUrl }: AvatarEditModalProps) {
  const toggleAvatarEditModal = useAvatarEditModalToggle()
  const isOpen = useModalOpened(ApplicationModal.AVATAR_EDIT)

  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId)

  const avatarUrls = useDefaultAvatarUrls(256)

  // edit avatar
  const { refreshCurrentUser } = useCurrentUser()
  const [editAvatarMutation] = useEditAvatarMutation()
  const handleAvatarEdit = useCallback(
    (avatarId: number) => {
      setSelectedAvatarId(avatarId)
      editAvatarMutation({ variables: { avatarId } })
        .then(() => {
          refreshCurrentUser()
        })
        .catch((editAvatarError: ApolloError) => {
          console.error(editAvatarError) // TODO handle error
        })
    },
    [setSelectedAvatarId, editAvatarMutation, refreshCurrentUser]
  )

  return (
    <ClassicModal onDismiss={toggleAvatarEditModal} isOpen={isOpen}>
      <ModalContent>
        <ModalHeader onDismiss={toggleAvatarEditModal} title={t`Choose an avatar`} />

        <ModalBody>
          <AvatarsGrid>
            {avatarUrls.map((avatarUrl, index) => (
              <AvatarWrapper
                key={`avatar-${index}`}
                selected={selectedAvatarId === index + 1}
                onClick={() => handleAvatarEdit(index + 1)}
              >
                <img src={avatarUrl} />
              </AvatarWrapper>
            ))}

            {customAvatarUrl && (
              <AvatarWrapper selected={selectedAvatarId === 0} onClick={() => handleAvatarEdit(0)}>
                <img src={customAvatarUrl} />
              </AvatarWrapper>
            )}
          </AvatarsGrid>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

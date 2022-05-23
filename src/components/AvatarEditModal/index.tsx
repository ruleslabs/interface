import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import Modal, { ModalHeader } from '@/components/Modal'
import { useAvatarEditModalToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import useDefaultAvatarUrls from '@/hooks/useDefaultAvatarUrls'
import { useEditAvatarMutation, useQueryCurrentUser } from '@/state/user/hooks'

const StyledAvatarEditModal = styled.div`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;
`

const AvatarsWrapper = styled.div`
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  & > div {
    position: relative;
  }
`

const Avatar = styled.div<{ selected: boolean }>`
  img {
    ${({ selected, theme }) => selected && `border: 5px solid ${theme.primary1}`};
    border-radius: 50%;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  img:hover {
    filter: brightness(0.4);
  }
`

interface AvatarEditModalProps {
  currentAvatarId: number
}

export default function AvatarEditModal({ currentAvatarId }: AvatarEditModalProps) {
  const toggleAvatarEditModal = useAvatarEditModalToggle()
  const isOpen = useModalOpen(ApplicationModal.AVATAR_EDIT)

  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId)

  const avatarUrls = useDefaultAvatarUrls(256)

  // edit avatar
  const queryCurrentUser = useQueryCurrentUser()
  const [editAvatarMutation] = useEditAvatarMutation()
  const handleAvatarEdit = useCallback(
    (avatarId: number) => {
      setSelectedAvatarId(avatarId)
      editAvatarMutation({ variables: { avatarId } })
        .then((res: any) => {
          queryCurrentUser()
        })
        .catch((editAvatarError: ApolloError) => {
          console.error(editAvatarError) // TODO handle error
        })
    },
    [setSelectedAvatarId, editAvatarMutation]
  )

  return (
    <Modal onDismiss={toggleAvatarEditModal} isOpen={isOpen}>
      <StyledAvatarEditModal>
        <ModalHeader onDismiss={toggleAvatarEditModal}>{t`Choose an avatar`}</ModalHeader>
        <AvatarsWrapper>
          {avatarUrls.map((avatarUrl, index) => (
            <Avatar
              key={`avatar-${index}`}
              selected={selectedAvatarId === index + 1}
              onClick={() => handleAvatarEdit(index + 1)}
            >
              <img src={avatarUrl} />
              <div />
            </Avatar>
          ))}
        </AvatarsWrapper>
      </StyledAvatarEditModal>
    </Modal>
  )
}

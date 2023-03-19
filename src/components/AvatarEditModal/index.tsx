import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { ApolloError } from '@apollo/client'

import ClassicModal, { ModalHeader } from '@/components/Modal/Classic'
import { useAvatarEditModalToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import useDefaultAvatarUrls from '@/hooks/useDefaultAvatarUrls'
import { useEditAvatarMutation, useQueryCurrentUser } from '@/state/user/hooks'

const StyledAvatarEditModal = styled.div`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
    border-radius: 0;
  `}
`

const AvatarsWrapper = styled.div`
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: space-around;
  gap: 32px;

  & > div {
    position: relative;
  }

  ${({ theme }) => theme.media.medium`
    grid-template-columns: repeat(2, minmax(auto, 256px));
  `}
`

const Avatar = styled.div<{ selected: boolean }>`
  ${({ selected, theme }) => selected && `border: 4px solid ${theme.primary1}`};
  border-radius: 50%;

  img {
    border-radius: 50%;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  img:hover {
    filter: brightness(0.4);
  }

  span {
    ${({ selected }) => !selected && 'display: none;'}
  }
`

const Checkmark = styled.span`
  position: absolute;
  top: 4px;
  right: -2px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary1};

  &:after {
    content: '';
    position: absolute;
    left: 12px;
    top: 5px;
    width: 10px;
    height: 18px;
    border: solid white;
    border-width: 0 5px 5px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`

interface AvatarEditModalProps {
  currentAvatarId: number
  customAvatarUrl?: string
}

export default function AvatarEditModal({ currentAvatarId, customAvatarUrl }: AvatarEditModalProps) {
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
    <ClassicModal onDismiss={toggleAvatarEditModal} isOpen={isOpen}>
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
              <Checkmark />
            </Avatar>
          ))}
          {customAvatarUrl && (
            <Avatar selected={selectedAvatarId === 0} onClick={() => handleAvatarEdit(0)}>
              <img src={customAvatarUrl} />
              <Checkmark />
            </Avatar>
          )}
        </AvatarsWrapper>
      </StyledAvatarEditModal>
    </ClassicModal>
  )
}

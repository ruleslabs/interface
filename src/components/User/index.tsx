import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import Certified from '@/components/Certified'
import { useAvatarEditModalToggle } from '@/state/application/hooks'
import AvatarEditModal from '@/components/AvatarEditModal'
import { useDefaultAvatarIdFromUrl } from '@/hooks/useDefaultAvatarUrls'

type Size = 'sm' | 'md' | 'lg'

const UserAvatarWrapper = styled.div<{ size: Size }>`
  position: relative;
  margin-bottom: ${({ size }) => (size === 'sm' && '8px') || (size === 'md' && '10px') || (size === 'lg' && '12px')};
  width: ${({ size }) => (size === 'sm' && '64px') || (size === 'md' && '150px') || (size === 'lg' && '208px')};
  height: ${({ size }) => (size === 'sm' && '64px') || (size === 'md' && '150px') || (size === 'lg' && '208px')};
  border-radius: 50%;
  overflow: hidden;

  * {
    position: absolute;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
  }

  & > div {
    visibility: hidden;
    background: rgba(0, 0, 0, 60%);
  }

  :hover > div {
    visibility: visible;
  }
`

const UserAvatarEdit = styled(TYPE.body)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

interface UserProps {
  username: string
  pictureUrl: string
  certifiedPictureUrl?: string
  certified: boolean
  size?: Size
  canEdit?: boolean
}

export default function User({
  username,
  pictureUrl,
  certifiedPictureUrl,
  certified,
  size = 'md',
  canEdit = false,
}: UserProps) {
  const toggleAvatarEditModal = useAvatarEditModalToggle()
  const defaultAvatarId = useDefaultAvatarIdFromUrl(pictureUrl)

  return (
    <>
      <ColumnCenter>
        <UserAvatarWrapper size={size}>
          <img src={pictureUrl} />
          {canEdit && (
            <UserAvatarEdit onClick={toggleAvatarEditModal}>
              <Trans>edit</Trans>
            </UserAvatarEdit>
          )}
        </UserAvatarWrapper>
        <Row gap={4}>
          <TYPE.body>{username}</TYPE.body>
          {certified && <Certified />}
        </Row>
      </ColumnCenter>
      {canEdit && <AvatarEditModal currentAvatarId={defaultAvatarId} certifiedAvatarUrl={certifiedPictureUrl} />}
    </>
  )
}

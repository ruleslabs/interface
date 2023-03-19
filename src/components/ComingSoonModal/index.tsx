import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import ClassicModal, { ModalHeader } from '@/components/Modal/Classic'

export const WHITELIST = [
  'chqrles',
  'rulesdemo',
  'dwitch',
  'tic',
  'rutabagarre',
  'matthis',
  'parfaitement',
  'ligh',
  'bambinohdd',
  'moriarty',
  'loucho640',
  't1',
  't5',
  'disket',
  'heloise',
]

const StyledComingSoonModal = styled(TYPE.large)`
  font-size: 32px;
  text-align: center;
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

interface ComingSoonModalProps {
  onDismiss(): void
  isOpen: boolean
}

export default function ComingSoonModal({ onDismiss, isOpen }: ComingSoonModalProps) {
  return (
    <ClassicModal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledComingSoonModal>
        <ModalHeader onDismiss={onDismiss} />

        <Trans>Coming Soon</Trans>
      </StyledComingSoonModal>
    </ClassicModal>
  )
}

import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Modal, { ModalHeader } from '@/components/Modal'

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
  // 't1',
  // 't5',
  'heloise',
]

const StyledComingSoon = styled(TYPE.large)`
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

interface ComingSoonProps {
  onDismiss(): void
  isOpen: boolean
}

export default function ComingSoon({ onDismiss, isOpen }: ComingSoonProps) {
  return (
    <Modal onDismiss={onDismiss} isOpen={isOpen}>
      <StyledComingSoon>
        <ModalHeader onDismiss={onDismiss}>
          <div />
        </ModalHeader>

        <Trans>Coming Soon</Trans>
      </StyledComingSoon>
    </Modal>
  )
}

import styled from 'styled-components'

import Modal from '@/components/Modal'
import { useSettingsModalToggle, useModalOpen } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { IconButton } from '@/components/Button'
import Caret from '@/components/Caret'
import Settings from './Settings'
import LanguageSelector from './LanguageSelector'

const StyledSettingsModal = styled.div`
  width: 340px;
  padding: 12px 32px;
  background: ${({ theme }) => theme.bg2};
  height: 100%;
`

const StyledLanguageSelector = styled(LanguageSelector)`
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
`

export default function SettingsModal({ currentUser }: { currentUser: any }) {
  const toggleSettingsModal = useSettingsModalToggle()
  const isOpen = useModalOpen(ApplicationModal.SETTINGS)

  return (
    <Modal onDismiss={toggleSettingsModal} isOpen={isOpen} sidebar>
      <StyledSettingsModal>
        <IconButton onClick={toggleSettingsModal}>
          <Caret direction="right" />
        </IconButton>
        <Settings dispatch={toggleSettingsModal} style={{ marginTop: '32px' }} />
        <StyledLanguageSelector />
      </StyledSettingsModal>
    </Modal>
  )
}

import { Trans, t } from '@lingui/macro'
import styled from 'styled-components'

import { useSidebarModalOpened, useNotificationsModalToggle } from '@/state/application/hooks'
import SidebarModal, { ModalContent, ModalHeader, ModalBody } from '@/components/Modal/Sidebar'
import { ApplicationSidebarModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'

import GhostIcon from '@/images/ghost.svg'

const EmptyBox = styled(ColumnCenter)`
  gap: 16px;
  margin-top: 64px;

  & svg {
    fill: ${({ theme }) => theme.text2};
  }
`

export default function NotificationsModal() {
  // modal
  const toggleNotificationsModal = useNotificationsModalToggle()
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NOTIFICATIONS)

  return (
    <SidebarModal onDismiss={toggleNotificationsModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>
        <ModalHeader onDismiss={toggleNotificationsModal} title={t`Notifications`} />

        <ModalBody>
          <EmptyBox>
            <GhostIcon />

            <TYPE.body>
              <Trans>No notifications yet</Trans>
            </TYPE.body>
          </EmptyBox>
        </ModalBody>
      </ModalContent>
    </SidebarModal>
  )
}

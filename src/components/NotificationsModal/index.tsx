import { Trans, t } from '@lingui/macro'
import styled from 'styled-components'

import { useSidebarModalOpened, useNotificationsModalToggle } from '@/state/application/hooks'
import SidebarModal, { ModalContent, ModalHeader, ModalBody } from '@/components/Modal/Sidebar'
import { ApplicationSidebarModal } from '@/state/application/actions'
import { TYPE } from '@/styles/theme'
import Column, { ColumnCenter } from '@/components/Column'
import { useCurrentUserNotifications } from '@/state/search/hooks'

import GhostIcon from '@/images/ghost.svg'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import NotificationRow from './NotificationRow'

const StyledModalBody = styled(ModalBody)`
  padding: 0;
`

const EmptyBox = styled(ColumnCenter)`
  gap: 16px;
  margin-top: 64px;

  & svg {
    fill: ${({ theme }) => theme.text2};
  }
`

const NotificationsWrapper = styled(Column)`
  & > * {
    border-style: solid;
    border-color: ${({ theme }) => theme.bg3}80;
    border-width: 0 0 1px;
  }
`

export default function NotificationsModal() {
  // modal
  const toggleNotificationsModal = useNotificationsModalToggle()
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NOTIFICATIONS)

  // get notifications
  const notificationsQuery = useCurrentUserNotifications()
  const notifications = notificationsQuery.data

  // loading / error
  const isLoading = notificationsQuery.loading

  // infinite scroll
  const lastNotificationRef = useInfiniteScroll({ nextPage: notificationsQuery.nextPage, loading: isLoading })

  return (
    <SidebarModal onDismiss={toggleNotificationsModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>
        <ModalHeader onDismiss={toggleNotificationsModal} title={t`Notifications`} />

        <StyledModalBody>
          {!notifications.length && !isLoading && (
            <EmptyBox>
              <GhostIcon />

              <TYPE.body>
                <Trans>No notifications yet</Trans>
              </TYPE.body>
            </EmptyBox>
          )}

          <NotificationsWrapper>
            {notifications.map((notification, index) => (
              <NotificationRow
                key={index}
                innerRef={index + 1 === notification.length ? lastNotificationRef : undefined}
                notification={notification}
              />
            ))}
          </NotificationsWrapper>
        </StyledModalBody>
      </ModalContent>
    </SidebarModal>
  )
}

import { t, Trans } from '@lingui/macro'
import { ApolloError } from 'apollo-client'
import { useEffect } from 'react'
import Column, { ColumnCenter } from 'src/components/Column'
import SidebarModal, { ModalBody, ModalContent } from 'src/components/Modal/Sidebar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import useInfiniteScroll from 'src/hooks/useInfiniteScroll'
import { ApplicationSidebarModal } from 'src/state/application/actions'
import { useNotificationsModalToggle, useSidebarModalOpened } from 'src/state/application/hooks'
import { useCurrentUserNotifications } from 'src/state/search/hooks'
import { useMarkNotificationsAsReadMutation } from 'src/state/user/hooks'
import { TYPE } from 'src/styles/theme'
import * as Icons from 'src/theme/components/Icons'
import styled from 'styled-components/macro'

import { ModalHeader } from '../Modal'
import NotificationRow from './NotificationRow'

const StyledModalBody = styled(ModalBody)`
  padding: 0;
`

const EmptyBox = styled(ColumnCenter)`
  gap: 16px;
  margin-top: 64px;
  color: ${({ theme }) => theme.bg3};
`

const NotificationsWrapper = styled(Column)`
  & > * {
    border-style: solid;
    border-color: ${({ theme }) => theme.bg3}80;
    border-width: 0 0 1px;
  }
`

export default function NotificationsModal() {
  // current user
  const { currentUser, setCurrentUser } = useCurrentUser()

  // modal
  const toggleNotificationsModal = useNotificationsModalToggle()
  const isOpen = useSidebarModalOpened(ApplicationSidebarModal.NOTIFICATIONS)

  // read notifications
  const [markNotificationsAsReadMutation] = useMarkNotificationsAsReadMutation()

  // get notifications
  const notificationsQuery = useCurrentUserNotifications()
  const notifications = notificationsQuery.data

  // loading / error
  const isLoading = notificationsQuery.loading

  // infinite scroll
  const lastNotificationRef = useInfiniteScroll({ nextPage: notificationsQuery.nextPage, loading: isLoading })

  useEffect(() => {
    if (isOpen && currentUser && currentUser.unreadNotificationsCount > 0) {
      markNotificationsAsReadMutation()
        .then(() => {
          setCurrentUser({ ...currentUser, unreadNotificationsCount: 0 })
        })
        .catch((markNotificationsAsReadError: ApolloError) => {
          console.error(markNotificationsAsReadError) // TODO: handle error
        })
    }
  }, [isOpen, markNotificationsAsReadMutation, currentUser?.unreadNotificationsCount])

  return (
    <SidebarModal onDismiss={toggleNotificationsModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>
        <ModalHeader onDismiss={toggleNotificationsModal} title={t`Notifications`} />

        <StyledModalBody>
          {!notifications.length && !isLoading && (
            <EmptyBox>
              <Icons.Ghost width="64" />

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

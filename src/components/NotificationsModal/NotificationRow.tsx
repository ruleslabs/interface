import React, { useMemo } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'

import EthereumIcon from '@/images/ethereum.svg'
import { WeiAmount } from '@rulesorg/sdk-core'
import useAge from '@/hooks/useAge'
import Actionable from '@/components/Actionable'

const StyledNotificationRow = styled(Column)`
  gap: 12px;
  padding: 16px 24px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.bg3}40;
  }
`

const IconWrapper = styled(RowCenter)`
  background: ${({ theme }) => theme.bg2};
  border-radius: 3px;
  width: 36px;
  height: 36px;
  padding: 4px;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.bg3}40;

  & > * {
    width: 100%;
    height: 100%;
  }
`

interface NotificationBase {
  createdAt: Date
}

interface EtherRetrieveNotification extends NotificationBase {
  __typename: 'EtherRetrieveNotification'
  amount: string
}

type Notification = EtherRetrieveNotification

interface NotificationRowProps {
  innerRef?: (node: any) => void
  notification: Notification
}

const MemoizedNotificationRowPropsEqualityCheck = (prevProps: NotificationRowProps, nextProps: NotificationRowProps) =>
  prevProps.innerRef === nextProps.innerRef

const MemoizedNotificationRow = React.memo(function NotificationRow({ notification }: NotificationRowProps) {
  const { title, subtitle, icon, link } = useMemo(() => {
    switch (notification.__typename) {
      case 'EtherRetrieveNotification':
        const parsedAmount = WeiAmount.fromRawAmount(notification.amount)

        return {
          icon: EthereumIcon(),
          title: t`ETH Retrive`,
          subtitle: t`Your ${parsedAmount.toSignificant(
            6
          )} ETH withdraw has been accepted. You can retrieve your funds now.`,
          link: '/settings/ethereum',
        }
    }
  }, [notification])

  const age = useAge(notification.createdAt)

  return (
    <Actionable link={link}>
      <StyledNotificationRow gap={12}>
        <RowCenter gap={8}>
          <IconWrapper>{icon}</IconWrapper>

          <TYPE.medium>{title}</TYPE.medium>

          <div style={{ marginLeft: 'auto' }} />

          <TYPE.subtitle fontSize={14} fontStyle="italic">
            {age}
          </TYPE.subtitle>
        </RowCenter>

        <TYPE.subtitle fontSize={14}>{subtitle}</TYPE.subtitle>
      </StyledNotificationRow>
    </Actionable>
  )
}, MemoizedNotificationRowPropsEqualityCheck)

export default MemoizedNotificationRow

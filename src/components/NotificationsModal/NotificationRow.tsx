import { t } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import React, { useMemo } from 'react'
import Actionable from 'src/components/Actionable'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import useAge from 'src/hooks/useAge'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum.svg'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

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
  border-radius: 6px;
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
        // eslint-disable-next-line no-case-declarations
        const parsedAmount = WeiAmount.fromRawAmount(notification.amount)

        return {
          icon: <EthereumIcon />,
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

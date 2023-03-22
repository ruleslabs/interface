import styled from 'styled-components'

import { RowCenter } from '@/components/Row'

import UserBadgeShape from '@/images/user-badge.svg'
import Checkmark from '@/images/checkmark.svg'
import Crown from '@/images/crown.svg'

const StyledUserBadge = styled(RowCenter)`
  position: relative;
  width: 18px;
  height: 18px;
  justify-content: center;

  * {
    z-index: 1;
  }
`

const StyledUserBadgeShape = styled(UserBadgeShape)<{ color: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  fill: ${({ theme, color }) => (theme as any)[color]};
  z-index: 0;
`

const StyledCheckmark = styled(Checkmark)`
  stroke: #fff;
  width: 9px;
`

const StyledCrown = styled(Crown)`
  fill: #fff;
  width: 8px;
`

interface UserBadgeProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  color: string
}

function UserBadge({ color, children }: UserBadgeProps) {
  return (
    <StyledUserBadge>
      <StyledUserBadgeShape color={color} />
      {children}
    </StyledUserBadge>
  )
}

export function CertifiedBadge() {
  return (
    <UserBadge color="primary1">
      <StyledCheckmark />
    </UserBadge>
  )
}

export function TopCollectorBadge() {
  return (
    <UserBadge color="orange">
      <StyledCrown />
    </UserBadge>
  )
}

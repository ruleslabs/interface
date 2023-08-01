import { styled } from 'styled-components'

import Column from '../Column'
import { Badge, BadgeType } from 'src/graphql/data/__generated__/types-and-hooks'

import { BoxProps } from 'src/theme/components/Box'
import Image from 'src/theme/components/Image'

const BadgesWrapper = styled(Column)`
  gap: 16px;
  position: absolute;
  top: -10px;
  right: -10px;

  & > img {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0px 4px 4px #00000040;
  }
`

interface BadgesProps {
  badges?: Omit<Badge, 'quantity'>[]
}

export default function Badges({ badges = [] }: BadgesProps) {
  return (
    <BadgesWrapper>
      {badges.map((badge, index) => (
        <BadgeIcon key={`badge-${index}`} badge={badge} />
      ))}
    </BadgesWrapper>
  )
}

interface BadgeProps extends BoxProps {
  badge: Omit<Badge, 'quantity'>
}

export function BadgeIcon({ badge, ...props }: BadgeProps) {
  switch (badge.type) {
    case BadgeType.LowSerial:
      return <Image src={'/assets/ruledex-badge-low-serial.png'} {...props} />

    case BadgeType.CardsCount:
      return <Image src={`/assets/ruledex-badge-cards-count-level-${badge.level}.png`} {...props} />
  }
}

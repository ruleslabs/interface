import { styled } from 'styled-components'

import Column from '../Column'
import { Badge, BadgeType } from 'src/graphql/data/__generated__/types-and-hooks'

import { ReactComponent as RuledexBadgeLowSerial } from 'src/images/ruledex-badge-low-serial.svg'
import { ReactComponent as RuledexBadgeCardsCountLevel1 } from 'src/images/ruledex-badge-cards-count-level-1.svg'
import { ReactComponent as RuledexBadgeCardsCountLevel2 } from 'src/images/ruledex-badge-cards-count-level-2.svg'
import { ReactComponent as RuledexBadgeCardsCountLevel3 } from 'src/images/ruledex-badge-cards-count-level-3.svg'
import { ReactComponent as RuledexBadgeCardsCountLevel4 } from 'src/images/ruledex-badge-cards-count-level-4.svg'

const BadgesWrapper = styled(Column)`
  gap: 16px;
  position: absolute;
  top: -10px;
  right: -10px;

  & > svg {
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
      {badges.map((badge) => {
        switch (badge.type) {
          case BadgeType.LowSerial:
            return <RuledexBadgeLowSerial />

          case BadgeType.CardsCount: {
            switch (badge.level) {
              case 1:
                return <RuledexBadgeCardsCountLevel1 />

              case 2:
                return <RuledexBadgeCardsCountLevel2 />

              case 3:
                return <RuledexBadgeCardsCountLevel3 />

              case 4:
                return <RuledexBadgeCardsCountLevel4 />
            }

            return null
          }
        }
      })}
    </BadgesWrapper>
  )
}

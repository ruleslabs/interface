import { styled } from 'styled-components'

import Column from '../Column'
import { Badge } from 'src/types'

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
  badges?: Badge[]
}

export default function Badges({ badges = [] }: BadgesProps) {
  return (
    <BadgesWrapper>
      {badges.map((badge) => {
        switch (badge) {
          case Badge.LOW_SERIAL:
            return <RuledexBadgeLowSerial />

          case Badge.CARDS_COUNT_LEVEL_1:
            return <RuledexBadgeCardsCountLevel1 />

          case Badge.CARDS_COUNT_LEVEL_2:
            return <RuledexBadgeCardsCountLevel2 />

          case Badge.CARDS_COUNT_LEVEL_3:
            return <RuledexBadgeCardsCountLevel3 />

          case Badge.CARDS_COUNT_LEVEL_4:
            return <RuledexBadgeCardsCountLevel4 />
        }
      })}
    </BadgesWrapper>
  )
}
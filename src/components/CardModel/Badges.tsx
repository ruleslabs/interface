import RuledexBadgeLowSerial from '@/images/ruledex-badge-low-serial.svg'
import RuledexBadgeCardsCountLevel1 from '@/images/ruledex-badge-cards-count-level-1.svg'
import RuledexBadgeCardsCountLevel2 from '@/images/ruledex-badge-cards-count-level-2.svg'
import RuledexBadgeCardsCountLevel3 from '@/images/ruledex-badge-cards-count-level-3.svg'
import RuledexBadgeCardsCountLevel4 from '@/images/ruledex-badge-cards-count-level-4.svg'

export enum Badge {
  LOW_SERIAL,
  CARDS_COUNT_LEVEL_1,
  CARDS_COUNT_LEVEL_2,
  CARDS_COUNT_LEVEL_3,
  CARDS_COUNT_LEVEL_4,
}

interface BadgesProps {
  badges: Badge[]
}

export default function Badges({ badges }: BadgesProps) {
  return (
    <>
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
    </>
  )
}

import { constants } from '@rulesorg/sdk-core'

import * as Text from 'src/theme/components/Text'
import * as styles from './index.css'
import { Row } from 'src/theme/components/Flex'

interface SeasonSelectorProps {
  selectedSeason: number
  selectSeason: (season: number) => void
}

export default function SeasonSelector({ selectedSeason, selectSeason }: SeasonSelectorProps) {
  return (
    <Row className={styles.seasonsContainer}>
      {Object.keys(constants.Seasons).map((season) => (
        <Text.HeadlineMedium
          key={season}
          className={styles.seasonButton({ active: selectedSeason === +season })}
          onClick={() => selectSeason(+season)}
        >
          S{season}
        </Text.HeadlineMedium>
      ))}
    </Row>
  )
}

import React from 'react'
import styled from 'styled-components'

import useCountdown from '@/hooks/useCountdown'
import { RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import { TYPE } from '@/styles/theme'

export const PackPosterWrapper = styled(RowCenter)`
  width: 100%;
  justify-content: center;
  background-image: url(/assets/nebula.png);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  img {
    box-shadow: 0 4px 5px 10px ${({ theme }) => theme.black}40;
  }
`

const StyledPackCountdownWrapper = styled(ColumnCenter)<{ released: boolean }>`
  ${({ released, theme }) => (released ? '' : `background-color: ${theme.bg2};`)}
  padding: ${({ released }) => (released ? '0 0 22px' : '22px 44px')};
  gap: 8px;
`

interface PackCountdownWrapper {
  releaseDate: Date
  children: React.ReactNode
}

export function PackCountdownWrapper({ releaseDate, children }: PackCountdownWrapper) {
  const countdown = useCountdown(releaseDate)

  return (
    <StyledPackCountdownWrapper released={!countdown}>
      {countdown && (
        <div>
          <TYPE.body textAlign="center">Sortie dans</TYPE.body>
          <TYPE.body fontWeight={700} fontSize={48} textAlign="center">
            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </TYPE.body>
        </div>
      )}
      {children}
    </StyledPackCountdownWrapper>
  )
}

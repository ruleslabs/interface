import React from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import useCountdown from 'src/hooks/useCountdown'
import { RowCenter } from 'src/components/Row'
import { ColumnCenter } from 'src/components/Column'
import { TYPE } from 'src/styles/theme'

import { ReactComponent as PackBg } from 'src/images/pack-bg.svg'
import { ReactComponent as LogoOutline } from 'src/images/logo-outline.svg'

const StyledPackCountdownWrapper = styled(ColumnCenter)<{ released: boolean }>`
  ${({ released, theme }) =>
    released
      ? 'padding: 64px 22px 22px;'
      : `
        background-color: ${theme.bg2};
        padding: 22px;
      `}
  gap: 8px;

  & > * {
    margin: 0 auto;
  }

  ${({ released, theme }) => theme.media.small`
    ${released && 'padding: 0 22px;'}
  `}
`

const CountdownWrapper = styled.div`
  div {
    width: 100%;
  }
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
        <CountdownWrapper>
          <TYPE.body textAlign="center">
            <Trans>Release in</Trans>
          </TYPE.body>
          <TYPE.body fontWeight={700} fontSize={48} textAlign="center">
            {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:
            {String(countdown.seconds).padStart(2, '0')}
          </TYPE.body>
        </CountdownWrapper>
      )}
      {children}
    </StyledPackCountdownWrapper>
  )
}

const StyledPackPosterWrapper = styled(RowCenter)`
  width: 100%;
  justify-content: center;
  position: relative;

  ${({ theme }) => theme.media.medium`
    padding: 32px 0;
    overflow: hidden;
    width: 100vw;
    margin: 0 -16px;
  `}
`

const StyledPackBg = styled(PackBg)`
  position: absolute;
  height: 100%;
  z-index: -1;
  right: 0;

  * {
    fill: ${({ theme }) => theme.text1}10;
  }

  ${({ theme }) => theme.media.medium`
    right: unset;
  `}
`

const StyledLogoOutline = styled(LogoOutline)`
  position: absolute;
  z-index: -1;
  width: 80%;

  * {
    fill: ${({ theme }) => theme.text1}40;
  }

  ${({ theme }) => theme.media.extraSmall`
    display: none;
  `}
`

interface PackPosterWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PackPosterWrapper({ children, ...props }: PackPosterWrapperProps) {
  return (
    <StyledPackPosterWrapper {...props}>
      {children}
      <StyledPackBg />
      <StyledLogoOutline />
    </StyledPackPosterWrapper>
  )
}

import React from 'react'
import styled from 'styled-components'

const StyledProgressBar = styled.div<{ duration: number }>`
  animation: progress ${({ duration }) => duration}ms ease-in-out;
  height: 5px;
  border-radius: 6px;
  background: ${({ theme }) => theme.primary1};
  box-shadow: 0px 0px 9px ${({ theme }) => theme.primary1};

  @keyframes progress {
    0% {
      width: 0%;
    }

    100% {
      width: 100%;
    }
  }
`

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  duration: number
  maxWidth: number
}

export default function ProgressBar({ duration, maxWidth, ...props }: ProgressBarProps) {
  return (
    <div style={{ width: `${maxWidth}px` }}>
      <StyledProgressBar duration={duration} {...props} />
    </div>
  )
}

import React from 'react'
import styled from 'styled-components'

// needed to avoid Type
// 'LegacyRef<SVGElement> | undefined' is not assignable to type
// '((instance: SVGSVGElement | null) => void) | RefObject<SVGSVGElement> | null | undefined'.
import emptySvg from '@/images/emptySvg.svg'

const StyledSpinner = styled(emptySvg)<{ fill: string }>`
  animation: rotate 2s linear infinite;
  margin: -25px 0 0 -25px;
  width: 50px;
  height: 50px;

  & .path {
    stroke: ${({ theme, fill }) => (fill ? (theme as any)[fill] : theme.text1)};
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

interface SpinnerProps extends React.SVGProps<SVGElement> {
  fill: string
}

const Spinner = ({ fill, ...props }: SpinnerProps) => (
  <StyledSpinner viewBox="0 0 50 50" fill={fill} {...props}>
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
  </StyledSpinner>
)

export default Spinner

const StyledLargeSpinner = styled.img`
  animation: rotate 2s linear infinite;
  width: 64px;
  height: 64px;

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`

export const LargeSpinner = (props: React.HTMLAttributes<HTMLImageElement>) => (
  <StyledLargeSpinner src="/assets/spinner.png" {...props} />
)

import styled from 'styled-components'

import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'

const StyledVideoButton = styled(RowCenter)`
  width: 300px;
  height: 75px;
  background-color: ${({ theme }) => theme.bg1};
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 5px;

  video {
    position: absolute;
    right: 0;
    left: 0;
    width: 100%;
    transform: scale(1.2);
    opacity: 0.5;
    transition: transform 100ms ease-in, opacity 100ms ease-in;
  }

  div {
    z-index: 1;
    font-size: 20px;
    letter-spacing: 0.8px;
    text-align: center;
    width: 100%;
    text-shadow: 2px 2px 0 black;
    transition: opacity 100ms ease-in;
  }

  &:hover {
    video {
      transform: scale(1);
      opacity: 1;
    }

    div {
      opacity: 0.3;
    }
  }
`

interface VideoButtonProps {
  value: string
  src: string
}

export default function VideoButton({ value, src }: VideoButtonProps) {
  return (
    <StyledVideoButton>
      <video loop autoPlay playsInline muted>
        <source src={src} type="video/mp4" />
      </video>

      <TYPE.large>{value}</TYPE.large>
    </StyledVideoButton>
  )
}

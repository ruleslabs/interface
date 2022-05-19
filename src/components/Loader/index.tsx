import React from 'react'
import styled from 'styled-components'

const StyledLoader = styled.div`
  position: relative;
  width: 16px;
  height: 16px;

  #blob3 {
    animation: animate-to-2 1.5s infinite;
  }

  #blob4 {
    animation: animate-to-3 1.5s infinite;
  }

  #blob2 {
    animation: animate-to-1 1.5s infinite;
  }

  #blob5 {
    animation: animate-to-4 1.5s infinite;
  }

  #blob1 {
    animation: animate-to-0 1.5s infinite;
  }

  #blob6 {
    animation: animate-to-5 1.5s infinite;
  }

  @keyframes animate-to-2 {
    25%,
    75% {
      transform: translateX(-12px) scale(0.75);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }

  @keyframes animate-to-3 {
    25%,
    75% {
      transform: translateX(12px) scale(0.75);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }

  @keyframes animate-to-1 {
    25% {
      transform: translateX(-12px) scale(0.75);
    }
    50%,
    75% {
      transform: translateX(-36px) scale(0.6);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }

  @keyframes animate-to-4 {
    25% {
      transform: translateX(12px) scale(0.75);
    }
    50%,
    75% {
      transform: translateX(36px) scale(0.6);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }

  @keyframes animate-to-0 {
    25% {
      transform: translateX(-12px) scale(0.75);
    }
    50% {
      transform: translateX(-36px) scale(0.6);
    }
    75% {
      transform: translateX(-60px) scale(0.5);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }

  @keyframes animate-to-5 {
    25% {
      transform: translateX(12px) scale(0.75);
    }
    50% {
      transform: translateX(36px) scale(0.6);
    }
    75% {
      transform: translateX(60px) scale(0.5);
    }
    95% {
      transform: translateX(0) scale(1);
    }
  }
`

const Blob = styled.div`
  top: 0;
  bottom: 0;
  width: 16px;
  background: ${({ theme }) => theme.text1};
  border-radius: 50%;
  position: absolute;
  box-shadow: 0 0 1rem ${({ theme }) => theme.text1}40;
`

type LoaderProps = React.HTMLAttributes<HTMLDivElement>

export default function Loader(props: LoaderProps) {
  return (
    <StyledLoader {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <Blob id="blob1" />
      <Blob id="blob2" />
      <Blob id="blob3" />
      <Blob id="blob4" />
      <Blob id="blob5" />
      <Blob id="blob6" />
    </StyledLoader>
  )
}

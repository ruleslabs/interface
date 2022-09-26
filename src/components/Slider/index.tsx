import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import useTheme from '@/hooks/useTheme'
import SliderInput from '@/components/Input/SliderInput'

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  outline: none;
  margin-bottom: 8px;

  &::before {
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.text1};
    border-radius: 1px;
    content: '';
    left: 2px;
    position: absolute;
    display: block;
    z-index: -1;
  }

  &:active,
  &focus {
    &::before {
      background: ${({ theme }) => theme.primary1};
    }

    &::-webkit-slider-thumb {
      border: 2px solid ${({ theme }) => theme.primary1};
    }
  }

  &::-webkit-slider-thumb {
    background: ${({ theme }) => theme.bg5};
    border: 2px solid ${({ theme }) => theme.text1};
    border-radius: 2px;
    width: 20px;
    -webkit-appearance: none;
    height: 20px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    background: ${({ theme }) => theme.text1};
  }
`

interface SliderProps {
  value: number
  unit?: string
  min?: number
  max: number
  onChange: (value: number) => void
}

export default function Slider({ value, unit = '', min = 0, max, onChange }: SliderProps) {
  const theme = useTheme()

  const sliderStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, transparent 0%, transparent ${((value - min) / (max - min)) * 100}%, ${
        theme.bg3
      } ${((value - min) / (max - min)) * 100}%, ${theme.bg3} 100%)`,
    }),
    [value, min, max, theme]
  )

  const handleInputUpdate = useCallback((value: string) => onChange(+value), [])

  const handleSlidingUpdate = useCallback(
    (event) => {
      const newValue = event.target.value
      if (newValue === '' || /^([0-9]+)$/.test(newValue)) onChange(newValue.length > 0 ? Math.min(+newValue, max) : 0)
    },
    [max, onChange]
  )

  return (
    <>
      <StyledSlider
        type="range"
        min={min}
        max={max}
        value={value}
        step="1"
        onChange={handleSlidingUpdate}
        style={sliderStyle}
      />
      <SliderInput type="text" value={value} onUserInput={handleInputUpdate} placeholder="0" unit="€" />
    </>
  )
}

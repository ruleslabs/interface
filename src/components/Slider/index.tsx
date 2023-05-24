import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import useTheme from '@/hooks/useTheme'
import SliderInput from '@/components/Input/SliderInput'
import Column from '@/components/Column'

const SliderWrapper = styled(Column)`
  z-index: 1;
  gap: 24px;
`

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  border-radius: 1px;
  outline: none;
  position: relative;

  &::before {
    height: 2px;
    background: ${({ theme }) => theme.text1};
    border-radius: 1px;
    content: '';
    left: 0;
    right: 0;
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
    background: ${({ theme }) => theme.bg2};
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
  onSlidingChange: (value: number) => void
  onInputChange: (value: number) => void
  onSliderRelease?: () => void
}

export default function Slider({ value, min = 0, max, onSlidingChange, onInputChange, onSliderRelease }: SliderProps) {
  const theme = useTheme()

  const sliderStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, transparent 0%, transparent ${((value - min) / (max - min)) * 100}%, ${
        theme.bg3
      } ${((value - min) / (max - min)) * 100}%, ${theme.bg3} 100%)`,
    }),
    [value, min, max, theme]
  )

  const handleInputUpdate = useCallback((value: string) => onInputChange(+value), [onInputChange])

  const handleSlidingUpdate = useCallback(
    (event) => {
      const newValue = event.target.value
      if (newValue === '' || /^([0-9]+)$/.test(newValue))
        onSlidingChange(newValue.length > 0 ? Math.min(+newValue, max) : 0)
    },
    [max, onSlidingChange]
  )

  return (
    <SliderWrapper>
      <StyledSlider
        type="range"
        min={min}
        max={max}
        value={value}
        step="1"
        onChange={handleSlidingUpdate}
        style={sliderStyle}
        onMouseUp={onSliderRelease}
        onTouchEnd={onSliderRelease}
      />
      <SliderInput type="text" value={value} onUserInput={handleInputUpdate} placeholder="0" unit="€" />
    </SliderWrapper>
  )
}

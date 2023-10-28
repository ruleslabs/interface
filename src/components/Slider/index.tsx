import React, { useCallback, useMemo } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components/macro'

import { RowCenter } from '../Row'
import NumericalInput from 'src/components/Input/NumericalInput'
import * as Text from 'src/theme/components/Text'

const SliderWrapper = styled(RowCenter)`
  z-index: 1;
  gap: 16px;
`

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 2px;
  outline: none;
  position: relative;

  &::before {
    height: 8px;
    background: linear-gradient(135deg, #8e2de2 0, #4a00e0 100%);
    border-radius: 2px;
    content: '';
    left: 0;
    right: 0;
    position: absolute;
    display: block;
    z-index: -1;
  }

  &::-webkit-slider-thumb {
    background: ${({ theme }) => theme.primary1};
    border-radius: 2px;
    width: 12px;
    -webkit-appearance: none;
    height: 20px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    background: ${({ theme }) => theme.primary2};
  }
`

const StyledNumericalInput = styled(NumericalInput)`
  height: 32px;
  width: auto;
`

const Unit = styled(Text.Body)`
  background: ${({ theme }) => theme.bg3}80;
  padding: 0 6px;
  border-radius: 6px;
  height: 32px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
`

interface SliderProps {
  value: number
  unit?: string
  unitWidth?: number
  min?: number
  max: number
  loading?: boolean
  onSlidingChange: (value: number) => void
  onInputChange: (value: number) => void
  onSliderRelease?: () => void
}

export default function Slider({
  value,
  min = 0,
  max,
  onSlidingChange,
  onInputChange,
  onSliderRelease,
  unit,
  unitWidth,
  loading = false,
}: SliderProps) {
  const theme = useTheme() as DefaultTheme

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
    <SliderWrapper style={{ opacity: loading ? 0.5 : 1 }}>
      <StyledSlider
        type="range"
        min={min}
        max={max}
        value={value}
        step="1"
        onChange={loading ? undefined : handleSlidingUpdate}
        style={sliderStyle}
        onMouseUp={onSliderRelease}
        onTouchEnd={onSliderRelease}
      />

      <RowCenter gap={8}>
        <StyledNumericalInput
          type="text"
          value={value}
          onUserInput={loading ? undefined : handleInputUpdate}
          placeholder="0"
          disabled={loading}
        />

        {!!unit && <Unit style={{ width: unitWidth ? `${unitWidth}px` : 'auto' }}>{unit}</Unit>}
      </RowCenter>
    </SliderWrapper>
  )
}

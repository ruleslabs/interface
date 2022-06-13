import React, { useCallback } from 'react'
import styled from 'styled-components'

import useTheme from '@/hooks/useTheme'
import { TYPE } from '@/styles/theme'

const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 3px;
  outline: none;
  margin-bottom: 8px;

  &::-webkit-slider-thumb {
    background: ${({ theme }) => theme.bg2};
    border: solid 2px ${({ theme }) => theme.white};
    width: 20px;
    -webkit-appearance: none;
    height: 20px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    background: ${({ theme }) => theme.white};
  }
`

const SliderInputWrapper = styled.div`
  border: solid 2px ${({ theme }) => theme.white};
  height: 32px;
  display: flex;
  align-items: center;
  padding-left: 8px;

  & > * {
    font-size: 14px;
  }
`

const SliderInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.white};

  &:focus {
    outline: none;
  }
`

const inputRegex = RegExp(`^[0-9]*$`)

interface SliderProps {
  value: number
  unit?: string
  min?: number
  max: number
  onChange: (value: number) => void
}

export default function Slider({ value, unit = '', min = 0, max, onChange }: SliderProps) {
  const theme = useTheme()

  const sliderStyle = {
    background: `linear-gradient(to right, ${theme.white} 0%, ${theme.white} ${((value - min) / (max - min)) * 100}%, ${
      theme.bg3
    } ${((value - min) / (max - min)) * 100}%, ${theme.bg3} 100%)`,
  }

  const handleChange = useCallback(
    (event) => {
      const newValue = event.target.value.replace(/^0*/, '')

      if (inputRegex.test(newValue)) {
        onChange(newValue.length > 0 ? Math.min(+newValue, max) : 0)
      }
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
        aria-label="Example slider, range 0 to 100"
        onChange={handleChange}
        style={sliderStyle}
      />
      <SliderInputWrapper>
        <TYPE.body>{unit}</TYPE.body>
        <SliderInput type="text" value={value} onChange={handleChange} pattern="^[0-9]+$" />
      </SliderInputWrapper>
    </>
  )
}

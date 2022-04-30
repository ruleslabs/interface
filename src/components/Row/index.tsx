import styled from 'styled-components'

const Row = styled.div<{
  gap?: number
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  alignItems?: 'center' | 'baseline' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'normal'
}>`
  display: flex;
  flex-direction: row;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ alignItems = 'normal' }) => alignItems};
`

export const RowCenter = styled(Row)`
  align-items: center;
`

export const RowBetween = styled(Row)`
  justify-content: space-between;
`

export const RowReverse = styled(Row)`
  flex-direction: row-reverse;
`

export default Row

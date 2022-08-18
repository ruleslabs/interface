import styled from 'styled-components'

const Column = styled.div<{
  gap?: number
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  alignItems?: 'center' | 'baseline' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'normal'
}>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ alignItems = 'normal' }) => alignItems};
`

export const ColumnCenter = styled(Column)`
  align-items: center;
`

export const ColumnBetween = styled(Column)`
  justify-content: space-between;
`

export default Column

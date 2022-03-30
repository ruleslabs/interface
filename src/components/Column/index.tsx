import styled from 'styled-components'

const Column = styled.div<{ gap?: number }>`
  display: flex;
  flex-direction: column;
  ${({ gap }) => gap && `gap: ${gap}px;`}
`

export const ColumnCenter = styled(Column)`
  align-items: center;
`

export const ColumnBetween = styled(Column)`
  justify-content: space-between;
`

export default Column

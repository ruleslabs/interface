import styled from 'styled-components'

const Row = styled.div<{
  gap?: number
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around'
  alignItems?: 'center' | 'baseline' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'normal'
  switchDirection?: string
}>`
  display: flex;
  flex-direction: row;
  ${({ gap }) => gap && `gap: ${gap}px;`}
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ alignItems = 'normal' }) => alignItems};

  ${({ theme, switchDirection }) => {
    const mediaQuery = switchDirection ? theme.media[switchDirection as keyof typeof theme.media] : null
    return mediaQuery
      ? mediaQuery`
        flex-direction: column;
      `
      : null
  }}
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

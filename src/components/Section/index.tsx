import styled from 'styled-components/macro'

type Size = 'sm' | 'md' | 'max'

const BaseSection = styled.div<{ marginBottom?: string; marginTop?: string }>`
  margin: ${({ marginTop, marginBottom }) => `${marginTop || '0'} auto ${marginBottom || '36px'}`};
`

const Section = styled(BaseSection)<{ size?: Size }>`
  ${({ size = 'md' }) =>
    size !== 'max'
      ? `
        padding: 0 16px;
        max-width: ${(size === 'sm' && '832px') || (size === 'md' && '1242px')};
      `
      : `
        width: 100%;
      `}
`

export default Section

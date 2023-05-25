import styled from 'styled-components/macro'

const Separator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.text2};

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.text2};
  }

  &:not(:empty)::before {
    margin-right: 24px;
  }

  &:not(:empty)::after {
    margin-left: 24px;
  }
`

export default Separator

import styled from 'styled-components/macro'

import { TYPE } from 'src/styles/theme'

const Card = styled.div`
  padding: 22px 32px;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  width: 100%;

  ${({ theme }) => theme.media.small`
    padding: 22px 26px;
  `}
`

export default Card

export const ErrorCard = styled(TYPE.body)`
  background: ${({ theme }) => theme.error}26;
  border: 1px solid ${({ theme }) => theme.error};
  color: ${({ theme }) => theme.error};
  border-radius: 6px;
  padding: 24px;
  width: 100%;

  span,
  a {
    text-decoration: underline;
    cursor: pointer;
  }
`

export const InfoCard = styled(TYPE.body)<{ $alert?: boolean }>`
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 6px;
  padding: 24px;
  width: 100%;

  span,
  a {
    text-decoration: underline;
    cursor: pointer;
  }

  ${({ theme, $alert = false }) => $alert && theme.before.alert``}
`

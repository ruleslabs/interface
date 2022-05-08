import styled from 'styled-components'

import { TYPE } from '@/styles/theme'
import Column from '@/components/Column'
import Row from '@/components/Row'
import { PrimaryButton } from '@/components/Button'

export const PageContent = styled(Column)`
  width: 440px;
  gap: 16px;
  margin-top: 32px;

  * {
    width: 100%;
  }

  ${({ theme }) => theme.media.medium`
    margin-top: 16px;
  `}

  ${({ theme }) => theme.media.small`
    width: 100%;
    margin-top: 0;
    gap: 20px;
  `}
`

export const PageWrapper = styled(Row)`
  justify-content: space-between;
  gap: 64px;
  position: absolute;
  top: 50px;
  bottom: 50px;
  left: 64px;
  right: 48px;

  ${({ theme }) => theme.media.medium`
    gap: 48px;
    left: 48px;
    top: 64px;

    & > div:last-child {
      display: none;
    }
  `}

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    align-items: center;
    gap: 12px;
    top: 48px;
  `}
`

export const MainActionButton = styled(PrimaryButton)`
  margin-top: 16px;

  ${({ theme }) => theme.media.medium`
    margin-top: 0;
  `}
`

export const PageBody = styled.div`
  padding-bottom: 58%;
  position: relative;
`

export const SkipButton = styled(TYPE.subtitle)`
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
`

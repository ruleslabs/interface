import React from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Section from '@/components/Section'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Card from '@/components/Card'
import HOMEPAGE from '@/components/Homepage'

const StyledHome = styled(Section)`
  width: 100%;
  display: flex;
  gap: 64px;
  margin-top: 64px;
`

const AsideColumn = styled(Column)`
  min-width: 275px;
  gap: 32px;
  flex: 0;
`

const MainColumn = styled(Column)`
  flex: 1;
`

interface ArticleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

function Article({ title, children, ...props }: ArticleProps) {
  return (
    <Column gap={24} {...props}>
      <TYPE.large>{title}</TYPE.large>
      {children}
    </Column>
  )
}

export default function Home() {
  return (
    <StyledHome>
      <AsideColumn>
        <Article title={t`Live`}>
          <Card>
            <HOMEPAGE.Live />
          </Card>
        </Article>

        <Article title={t`Hall of fame`}>
          <Card>
            <HOMEPAGE.Live />
          </Card>
        </Article>

        <Article title={t`Artists fund`}>
          <Card>
            <HOMEPAGE.Live />
          </Card>
        </Article>

        <Article title={t`Community creations`}>
          <Card>
            <HOMEPAGE.Live />
          </Card>
        </Article>
      </AsideColumn>

      <MainColumn>
        <Article title={t`Last offers`}>
          <HOMEPAGE.LastOffers />
        </Article>
      </MainColumn>
    </StyledHome>
  )
}

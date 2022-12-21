import React from 'react'
import styled, { css } from 'styled-components'
import { t, Trans } from '@lingui/macro'

import Section from '@/components/Section'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import Card from '@/components/Card'
import HOMEPAGE from '@/components/Homepage'
import DefaultLayout from '@/components/Layout'
import { useHomepageTab, useSetHomepageTab } from '@/state/application/hooks'
import { HomepageTabs, HomepageTabKey } from '@/state/application/actions'

const StyledHome = styled(Section)`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 64px;

  ${({ theme }) => theme.media.small`
    margin-top: 32px;
  `}
`

const ActivableContent = css<{ active: boolean }>`
  ${({ theme, active }) => theme.media.small`
    ${!active && 'display: none;'}
  `}
`

const Aside = styled(Column)<{ active: boolean }>`
  ${ActivableContent}

  gap: 32px;
  flex: 0;

  & > div {
    width: 290px;
    min-width: 290px;
  }

  ${({ theme }) => theme.media.small`
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    flex: 1;
  `}
`

const LastOffersColumn = styled(Column)<{ active: boolean }>`
  ${ActivableContent}

  flex: 1;
`

const StyledCard = styled(Card)`
  padding: 20px;
`

const TabSelectorWrapper = styled.div`
  display: none;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 0;
  justify-content: center;
  background: ${({ theme }) => theme.bg2};
  box-shadow: 0 0 8px #00000080;
  z-index: 999;

  ${({ theme }) => theme.media.small`
    display: flex;
  `}
`

const TabSelectorActiveIndicator = styled.div<{ activeIndex: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  background: ${({ theme }) => theme.primary1};
  border-radius: 3px;
  transition: 250ms transform ease-in-out;
`

const TabSelector = styled.div<{ length: number }>`
  display: grid;
  grid-template-columns: repeat(${({ length }) => length}, 1fr);
  background: ${({ theme }) => theme.bg1};
  border: solid 4px ${({ theme }) => theme.bg1};
  border-radius: 3px;
  position: relative;

  & ${TabSelectorActiveIndicator} {
    width: ${({ length }) => (length ? 100 / length : 0)}%;
  }
`

const TabSelectorButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  color: ${({ theme }) => theme.text1};
  font-weight: 500;
  border-radius: 3px;
  z-index: 1;
`

interface ArticleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
}

function Article({ title, children, ...props }: ArticleProps) {
  return (
    <Column gap={12} {...props}>
      <TYPE.large>{title}</TYPE.large>
      {children}
    </Column>
  )
}

function Home() {
  // homepage tab
  const activeHomepageTabKey = useHomepageTab()
  const setActiveHomepageTabKey = useSetHomepageTab()

  return (
    <StyledHome>
      <Aside active={activeHomepageTabKey === 'aside'}>
        <Article title={t`Live`}>
          <StyledCard>
            <HOMEPAGE.Live />
          </StyledCard>
        </Article>

        <Article title={t`Hall of fame`}>
          <StyledCard>
            <HOMEPAGE.HallOfFame />
          </StyledCard>
        </Article>

        <Article title={t`Artists fund`}>
          <StyledCard>
            <HOMEPAGE.ArtistsFund />
          </StyledCard>
        </Article>

        <Article title={t`Community creations`}>
          <StyledCard>
            <HOMEPAGE.CommunityCreations />
          </StyledCard>
        </Article>
      </Aside>

      <LastOffersColumn active={activeHomepageTabKey === 'last-offers'}>
        <Article title={t`Last offers`}>
          <HOMEPAGE.LastOffers />
        </Article>
      </LastOffersColumn>

      <TabSelectorWrapper>
        <TabSelector length={Object.keys(HomepageTabs).length}>
          <TabSelectorActiveIndicator activeIndex={Object.keys(HomepageTabs).indexOf(activeHomepageTabKey)} />

          {(Object.keys(HomepageTabs) as HomepageTabKey[]).map((tabKey) => (
            <TabSelectorButton key={tabKey} onClick={() => setActiveHomepageTabKey(tabKey)}>
              <Trans id={HomepageTabs[tabKey]} render={({ translation }) => <>{translation}</>} />
            </TabSelectorButton>
          ))}
        </TabSelector>
      </TabSelectorWrapper>
    </StyledHome>
  )
}

const FooterMargin = styled.div`
  display: none;
  height: 56px;

  ${({ theme }) => theme.media.small`
    display: block;
  `}
`

Home.getLayout = (page: JSX.Element) => {
  const FooterChildrenComponent = () => <FooterMargin />

  return <DefaultLayout FooterChildrenComponent={FooterChildrenComponent}>{page}</DefaultLayout>
}

export default Home

import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'

import Section from '@/components/Section'
import { TYPE } from '@/styles/theme'
import Row, { RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import User from '@/components/User'
import TabLink from '@/components/TabLink'

import Instagram from '@/images/instagram-color.svg'
import Twitch from '@/images/twitch-white.svg'
import Twitter from '@/images/twitter-color.svg'

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.bg2};
  height: 397px;
  position: relative;
  display: inline-block;
`

const UserSection = styled(Section)`
  z-index: 2;
`

const Gradient = styled.div`
  background: ${({ theme }) => theme.gradient1};
  height: 183px;
  width: 100%;
`

const SocialLink = styled.a`
  svg {
    width: 24px;
    height: 24px;
  }
`

const TabBar = styled(Row)`
  position: absolute;
  justify-content: center;
  bottom: 0;
  left: 0;
  right: 0;
  gap: 32px;
`

const QUERY_USER = gql`
  query ($slug: String!) {
    user(slug: $slug) {
      id
      username
      profile {
        pictureUrl(derivative: "width=320")
        certified
      }
    }
  }
`

export default function ProfileLayout({ children }: { children: React.ReactElement }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const { data: userData, loading, error } = useQuery(QUERY_USER, { variables: { slug: userSlug }, skip: !userSlug })

  const user = userData?.user

  if (!!error || !!loading) {
    return null
  }

  if (!error && !loading && !user) {
    return <TYPE.body>User not found</TYPE.body>
  }

  return (
    <>
      <StyledSection size="max">
        <Gradient />
        <UserSection marginTop="-104px">
          <ColumnCenter gap={8} style={{ width: 'fit-content' }}>
            <User
              username={`${user.username}`}
              pictureUrl={user.profile.pictureUrl}
              certified={user.profile.certified}
              size="lg"
            />
            <RowCenter gap={8}>
              <SocialLink href="https://instagram.com/">
                <Instagram />
              </SocialLink>
              <SocialLink href="https://instagram.com/">
                <Twitter />
              </SocialLink>
              <SocialLink href="https://instagram.com/">
                <Twitch />
              </SocialLink>
            </RowCenter>
          </ColumnCenter>
        </UserSection>
        <TabBar>
          <TabLink href={`/user/${userSlug}`}>Showcase</TabLink>
          <TabLink href={`/user/${userSlug}/cards`}>Cartes</TabLink>
          <TabLink href={`/user/${userSlug}/packs`}>Packs</TabLink>
        </TabBar>
      </StyledSection>
      {React.cloneElement(children, { userId: user.id })}
    </>
  )
}

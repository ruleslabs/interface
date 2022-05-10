import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ApolloError } from '@apollo/client'

import Section from '@/components/Section'
import { TYPE } from '@/styles/theme'
import Row, { RowCenter } from '@/components/Row'
import { ColumnCenter } from '@/components/Column'
import User from '@/components/User'
import TabLink from '@/components/TabLink'
import { useSearchUserMutation } from '@/state/user/hooks'

import Instagram from '@/images/instagram-color.svg'
import Twitch from '@/images/twitch-white.svg'
import Twitter from '@/images/twitter-color.svg'

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.bg2};
  height: 397px;
  position: relative;
  display: inline-block;

  ${({ theme }) => theme.media.medium`
    margin-bottom: 28px;
  `}

  ${({ theme }) => theme.media.small`
    height: 463px;
  `}
`

const UserSection = styled(Section)`
  z-index: 2;
  margin-top: -104px;

  ${({ theme }) => theme.media.small`
    width: fit-content;
  `}
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

export default function ProfileLayout({ children }: { children: React.ReactElement }) {
  const router = useRouter()
  const { username } = router.query
  const userSlug = typeof username === 'string' ? username.toLowerCase() : null

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)
  const [searchUserMutation] = useSearchUserMutation()

  useEffect(() => {
    if (userSlug)
      searchUserMutation({ variables: { slug: userSlug } })
        .then((res: any) => {
          setLoading(false)
          setUser(res?.data?.searchUser ?? null)
        })
        .catch((error: ApolloError) => {
          setError(true)
          setLoading(false)
          console.error(error)
        })
  }, [searchUserMutation])

  if (error || (!user && !loading)) return <TYPE.body>User not found</TYPE.body>
  else if (!user) return null

  return (
    <>
      <StyledSection size="max">
        <Gradient />
        <UserSection>
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

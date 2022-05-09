import { useState, useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'

import Link from '@/components/Link'
import Section from '@/components/Section'
import { SearchBar } from '@/components/Input'
import Column from '@/components/Column'
import Row, { RowCenter } from '@/components/Row'
import User from '@/components/User'
import { useSearchUsers, useSearchedUsers } from '@/state/search/hooks'
import useDebounce from '@/hooks/useDebounce'
import { TYPE } from '@/styles/theme'

import Certified from '@/images/certified.svg'

const StyledSearchBar = styled(SearchBar)`
  width: 100%;
`

const SearchResults = styled(Column)<{ visible: boolean }>`
  border: solid ${({ theme }) => theme.bg3};
  border-width: 0 1px 1px;
  position: absolute;
  background: ${({ theme }) => theme.bg5};
  left: 0;
  right: 0;
  border-radius: 0 0 3px 3px;

  & > div:first-child {
    height: 1px;
    width: 100%;
    background: ${({ theme }) => theme.bg3};
    margin: 0 auto;
  }
`

const SearchBarWrapper = styled.div<{ focused: boolean }>`
  position: relative;
  max-width: 576px;
  width: 100%;

  ${({ focused }) => `
    & > ${SearchResults} {
      ${!focused ? 'display: none;' : ''}
    }

    & > ${StyledSearchBar} {
      ${
        focused &&
        `
          border-width: 1px 1px 0;
          border-radius: 3px 3px 0 0;
        `
      }
    }
  `}
`

const UsersHeading = styled.h3`
  font-size: 18px;
  margin: 0 0 16px;
`

const SearchSuggestedUser = styled(RowCenter)`
  padding: 8px 16px;
  cursor: pointer;
  gap: 16px;

  :hover {
    background: ${({ theme }) => theme.bg2};
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
`

const StyledUsersRow = styled(Row)`
  margin-bottom: 60px;
  width: 100%;
  overflow: scroll;
  gap: 32px;
`

const USERS_BY_IDS_QUERY = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      slug
      username
      profile {
        pictureUrl(derivative: "width=128")
        certified
      }
    }
  }
`

const CERTIFIED_USERS_QUERY = gql`
  query {
    allCertifiedUsers {
      slug
      username
      profile {
        pictureUrl(derivative: "width=256")
      }
    }
  }
`

interface CustomUsersRowProps {
  loading?: boolean
  users: any[]
}

const UsersRow = ({ loading = false, users }: CustomUsersRowProps) => {
  return (
    <StyledUsersRow>
      {loading
        ? 'loading'
        : users.map((user: any) => (
            <Link key={`user-${user.slug}`} href={`/user/${user.slug}`}>
              <User username={user.username} pictureUrl={user.profile.pictureUrl} certified={true} />
            </Link>
          ))}
    </StyledUsersRow>
  )
}

export default function Community() {
  // search bar
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const onSearchBarInput = useCallback((value) => setSearch(value), [setSearch])

  // certified
  const { data: certifiedUsersData, loading: certifiedUsersLoading } = useQuery(CERTIFIED_USERS_QUERY)
  const certifiedUsers = certifiedUsersData?.allCertifiedUsers ?? []

  // search history
  const { searchedUsers, loading: searchedUsersLoading } = useSearchedUsers()

  // search
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
  const [searchSuggestedUserIds, setSearchSuggestedUserIds] = useState<string[]>([])
  const [searchSuggestedUsers, setSearchSuggestedUsers] = useState<any[]>([])

  const searchBarWrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(event.target))
        setIsSearchBarFocused(false)
    }

    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [setIsSearchBarFocused])

  const onSearchBarFocus = useCallback(() => setIsSearchBarFocused(true), [setIsSearchBarFocused])

  const {
    hits: usersHits,
    loading: usersHitsLoading,
    error: usersHitsError,
  } = useSearchUsers({ search: debouncedSearch })

  useEffect(() => {
    setSearchSuggestedUserIds((usersHits ?? []).map((hit: any) => hit.userId))
  }, [usersHits, setSearchSuggestedUserIds])

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(USERS_BY_IDS_QUERY, { variables: { ids: searchSuggestedUserIds }, skip: !searchSuggestedUserIds.length })

  useEffect(() => {
    if (usersLoading) return
    setSearchSuggestedUsers(usersData?.usersByIds ?? [])
  }, [usersData, usersLoading, setSearchSuggestedUsers])

  return (
    <>
      <Section marginBottom="84px" marginTop="44px">
        <SearchBarWrapper ref={searchBarWrapperRef} focused={isSearchBarFocused && searchSuggestedUsers?.length > 0}>
          <StyledSearchBar
            placeholder="Look for a collector..."
            onUserInput={onSearchBarInput}
            onFocus={onSearchBarFocus}
          />
          <SearchResults>
            <div />
            {searchSuggestedUsers.map((user) => (
              <Link key={`user-${user.username}`} href={`/user/${user.username}`}>
                <SearchSuggestedUser>
                  <img src={user.profile.pictureUrl} />
                  <RowCenter gap={4}>
                    <TYPE.body>{user.username}</TYPE.body>
                    {user.profile.certified && <Certified width="18px" />}
                  </RowCenter>
                </SearchSuggestedUser>
              </Link>
            ))}
          </SearchResults>
        </SearchBarWrapper>
      </Section>
      <Section>
        {searchedUsers.length > 0 && (
          <>
            <UsersHeading>Seen recently</UsersHeading>
            <UsersRow loading={searchedUsersLoading} users={searchedUsers} />
          </>
        )}
        <UsersHeading>Verified collectors</UsersHeading>
        <UsersRow loading={certifiedUsersLoading} users={certifiedUsers} />
      </Section>
    </>
  )
}

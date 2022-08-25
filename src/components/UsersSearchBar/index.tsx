import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'

import { SearchBar } from '@/components/Input'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { useSearchUsers } from '@/state/search/hooks'
import useDebounce from '@/hooks/useDebounce'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'

import Certified from '@/images/certified.svg'

const StyledSearchBar = styled(SearchBar)`
  width: 100%;
`

const SearchResults = styled(Column)`
  border: solid ${({ theme }) => theme.bg3};
  border-width: 1px;
  position: absolute;
  background: ${({ theme }) => theme.bg5};
  left: 0;
  right: 0;
  border-radius: 0 0 3px 3px;
  z-index: 99;
  padding: 12px 0;
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

const SearchSuggestedUser = styled(RowCenter)`
  padding: 8px 16px;
  cursor: pointer;
  gap: 12px;
  position: relative;

  :hover {
    background: ${({ theme }) => theme.bg2};
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
`

const StyledCertified = styled(Certified)`
  width: 18px;
  position: absolute;
  top: 6px;
  left: 47px;
`

const USERS_BY_IDS_QUERY = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      slug
      username
      starknetWallet {
        address
      }
      profile {
        pictureUrl(derivative: "width=128")
        certified
      }
    }
  }
`

interface UsersSearchBarProps {
  onSelect(user: any): void
  selfSearchAllowed?: boolean
}

export default function UsersSearchBar({ onSelect, selfSearchAllowed = true }: UsersSearchBarProps) {
  // current user
  const currentUser = useCurrentUser()

  // search bar
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const onSearchBarInput = useCallback((value) => setSearch(value), [setSearch])

  // search
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
  const [searchSuggestedUserIds, setSearchSuggestedUserIds] = useState<string[]>([])
  const [searchSuggestedUsers, setSearchSuggestedUsers] = useState<any[]>([])

  const searchBarWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (searchBarWrapperRef.current && !searchBarWrapperRef.current.contains(event.target))
        setIsSearchBarFocused(false)
    }

    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [setIsSearchBarFocused])

  const onSearchBarFocus = useCallback(() => setIsSearchBarFocused(true), [setIsSearchBarFocused])

  // algolia search
  const facets = useMemo(
    () => ({ username: selfSearchAllowed ? undefined : `-${currentUser.username}` }),
    [selfSearchAllowed, currentUser.username]
  )

  const {
    hits: usersHits,
    loading: usersHitsLoading,
    error: usersHitsError,
  } = useSearchUsers({ search: debouncedSearch, facets })

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

  // selection
  const handleSelect = useCallback(
    (user: any) => {
      setIsSearchBarFocused(false)
      onSelect(user)
    },
    [onSelect]
  )

  return (
    <SearchBarWrapper ref={searchBarWrapperRef} focused={isSearchBarFocused && searchSuggestedUsers?.length > 0}>
      <StyledSearchBar
        placeholder={t`Look for a collector...`}
        onUserInput={onSearchBarInput}
        onFocus={onSearchBarFocus}
      />
      <SearchResults>
        {searchSuggestedUsers.map((user) => (
          <SearchSuggestedUser key={`user-${user.username}`} onClick={() => handleSelect(user)}>
            {user.profile.certified && <StyledCertified />}
            <img src={user.profile.pictureUrl} />
            <RowCenter gap={4}>
              <TYPE.body>{user.username}</TYPE.body>
            </RowCenter>
          </SearchSuggestedUser>
        ))}
      </SearchResults>
    </SearchBarWrapper>
  )
}

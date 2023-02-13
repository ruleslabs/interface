import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'
import { t } from '@lingui/macro'

import { SearchBar } from '@/components/Input'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { useSearchUsers } from '@/state/search/hooks'
import useDebounce from '@/hooks/useDebounce'
import { TYPE } from '@/styles/theme'
import { useCurrentUser } from '@/state/user/hooks'
import { Certified } from '@/components/User/Badge'
import Avatar from '@/components/Avatar'

const USERS_QUERY = gql`
  query ($ids: [ID!]!) {
    usersByIds(ids: $ids) {
      id
      slug
      username
      starknetWallet {
        address
      }
      profile {
        pictureUrl(derivative: "width=128")
        fallbackUrl(derivative: "width=128")
        certified
      }
    }
  }
`

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
  position: absolute;
  top: 6px;
  left: 47px;
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

  // search focus
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false)
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

  // hits
  const [usersHits, setUsersHits] = useState<any[]>([])
  const [finalUsersHits, setFinalUsersHits] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})

  // query offers data
  const onUsersQueryCompleted = useCallback(
    (data: any) => {
      // compute users table
      setUsersTable(
        (data.usersByIds as any[]).reduce<{ [key: string]: any }>((acc, user) => {
          acc[user.id] = user
          return acc
        }, {})
      )

      // final hits
      setFinalUsersHits(usersHits)
    },
    [usersHits]
  )
  const [queryUsersData, usersQuery] = useLazyQuery(USERS_QUERY, { onCompleted: onUsersQueryCompleted })

  // algolia facets
  const facets = useMemo(
    () => ({ username: selfSearchAllowed || !currentUser?.username ? undefined : `-${currentUser.username}` }),
    [selfSearchAllowed, currentUser?.username]
  )

  // top 10 search
  const onPageFetched = useCallback(
    (hits: any) => {
      setUsersHits(hits)
      queryUsersData({ variables: { ids: hits.map((hit: any) => hit.objectID) } })
    },
    [queryUsersData]
  )
  const usersSearch = useSearchUsers({ search: debouncedSearch, facets, onPageFetched })

  // selection
  const handleSelect = useCallback(
    (user: any) => {
      setIsSearchBarFocused(false)
      onSelect(user)
    },
    [onSelect]
  )

  return (
    <SearchBarWrapper ref={searchBarWrapperRef} focused={isSearchBarFocused && usersHits?.length > 0}>
      <StyledSearchBar
        placeholder={t`Look for a collector...`}
        onUserInput={onSearchBarInput}
        onFocus={onSearchBarFocus}
      />
      <SearchResults>
        {finalUsersHits
          .filter((hit) => usersTable[hit.objectID])
          .map((hit) => (
            <SearchSuggestedUser
              key={`user-${usersTable[hit.objectID].username}`}
              onClick={() => handleSelect(usersTable[hit.objectID])}
            >
              {usersTable[hit.objectID].profile.certified && <StyledCertified />}
              <Avatar
                src={usersTable[hit.objectID].profile.pictureUrl}
                fallbackSrc={usersTable[hit.objectID].profile.fallbackUrl}
              />
              <RowCenter gap={4}>
                <TYPE.body>{usersTable[hit.objectID].username}</TYPE.body>
              </RowCenter>
            </SearchSuggestedUser>
          ))}
      </SearchResults>
    </SearchBarWrapper>
  )
}

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components/macro'
import { t } from '@lingui/macro'

import { SearchBar } from 'src/components/Input'
import Column from 'src/components/Column'
import { RowCenter } from 'src/components/Row'
import useDebounce from 'src/hooks/useDebounce'
import { TYPE } from 'src/styles/theme'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { CertifiedBadge } from 'src/components/User/Badge'
import Avatar from 'src/components/Avatar'
import { useUsers } from 'src/graphql/data/Users'
import { PaginationSpinner } from '../Spinner'

const StyledSearchBar = styled(SearchBar)`
  width: 100%;
`

const SearchResults = styled(Column)`
  border: solid ${({ theme }) => theme.bg3};
  border-width: 1px;
  position: absolute;
  background: ${({ theme }) => theme.bg2};
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
          border-radius: 6px 3px 0 0;
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

  &:hover {
    background: ${({ theme }) => theme.bg4};
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }
`

const StyledCertified = styled(CertifiedBadge)`
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
  const { currentUser } = useCurrentUser()

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

  // fetch users
  const { data: users, loading } = useUsers({
    filter: {
      search: debouncedSearch,
    },
  })

  // users component
  const usersComponents = useMemo(() => {
    if (!users) return null

    return users
      .filter((user) => selfSearchAllowed || user.slug !== currentUser?.slug)
      .map((user) => (
        <SearchSuggestedUser key={user.slug} onClick={() => handleSelect(user)}>
          {user.profile.certified && <StyledCertified />}
          <Avatar src={user.profile.pictureUrl} fallbackSrc={user.profile.fallbackUrl} />
          <RowCenter gap={4}>
            <TYPE.body>{user.username}</TYPE.body>
          </RowCenter>
        </SearchSuggestedUser>
      ))
  }, [users])

  // selection
  const handleSelect = useCallback(
    (user: any) => {
      setIsSearchBarFocused(false)
      onSelect(user)
    },
    [onSelect]
  )

  return (
    <SearchBarWrapper ref={searchBarWrapperRef} focused={isSearchBarFocused && !!users?.length}>
      <StyledSearchBar
        placeholder={t`Look for a collector...`}
        onUserInput={onSearchBarInput}
        onFocus={onSearchBarFocus}
      />
      <SearchResults>
        <PaginationSpinner loading={loading} />
        {usersComponents}
      </SearchResults>
    </SearchBarWrapper>
  )
}

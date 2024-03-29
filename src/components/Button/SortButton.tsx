import { Trans } from '@lingui/macro'
import { useCallback, useState } from 'react'
import Hover from 'src/components/AnimatedIcon/hover'
import { RowButton } from 'src/components/Button'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

type SortData<T extends string> = { name: string; key: T; desc: boolean }
export type SortsData<T extends string> = SortData<T>[]

const StyledSortButton = styled(RowButton)`
  position: relative;
  border: solid 1px ${({ theme }) => theme.text2}80;
  border-radius: 6px;
  padding: 8px 16px;

  &:hover {
    border-color: ${({ theme }) => theme.text2};
  }
`

const Dropdown = styled(Column)<{ isOpen: boolean }>`
  ${({ isOpen }) => !isOpen && 'display: none;'}
  position: absolute;
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;
  top: 38px;
  right: 0;
  padding: 8px 0;
  min-width: 250px;
  z-index: 1;

  & > * {
    padding: 12px 40px;
    white-space: nowrap;
    width: 100%;
    text-align: right;
  }

  & > *:hover {
    background: ${({ theme }) => theme.bg3}40;
  }
`

interface SortButtonProps<T extends string> {
  sortsData: SortsData<T>
  onChange: (sortIndex: number) => void
  sortIndex: number
}

export default function SortButton<T extends string>({ sortsData, onChange, sortIndex }: SortButtonProps<T>) {
  // sort button
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const toggleSortDropdown = useCallback(() => setSortDropdownOpen(!sortDropdownOpen), [sortDropdownOpen])

  return (
    <StyledSortButton onClick={toggleSortDropdown}>
      <TYPE.body>
        <Trans id={sortsData[sortIndex].name}>{sortsData[sortIndex].name}</Trans>
      </TYPE.body>

      <Hover width="16" height="16" reverse={!sortsData[sortIndex].desc} />

      <Dropdown isOpen={sortDropdownOpen}>
        {sortsData.map((sortData, index) => (
          <TYPE.body key={index} onClick={() => onChange(index)}>
            <Trans id={sortData.name}>{sortData.name}</Trans>
          </TYPE.body>
        ))}
      </Dropdown>
    </StyledSortButton>
  )
}

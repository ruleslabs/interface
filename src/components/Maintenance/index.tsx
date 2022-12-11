import { useMemo } from 'react'
import styled from 'styled-components'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Column from '@/components/Column'
import useWindowSize from '@/hooks/useWindowSize'

import RulesPlainIcon from '@/images/logo-plain.svg'

const MAINTENANCE_QUERY = gql`
  query {
    maintenanceProgression
  }
`

const StyledMaintenance = styled(RowCenter)`
  gap: 32px;
  justify-content: center;
  width: 100%;

  svg {
    fill: ${({ theme }) => theme.text1};
    height: 100px;
  }

  ${({ theme }) => theme.media.extraSmall`
    gap: 16px;
  `}
`

const Separator = styled.div`
  width: 1px;
  background: ${({ theme }) => theme.text1};
  height: 75px;
`

export default function Maintenance() {
  const maintenaceQuery = useQuery(MAINTENANCE_QUERY)
  const percentage = useMemo(
    () => (maintenaceQuery.data?.maintenanceProgression ?? 0) / 10_000,
    [maintenaceQuery.data?.maintenanceProgression]
  )

  const windowSize = useWindowSize()

  if (maintenaceQuery.loading) return <div />

  return (
    <StyledMaintenance style={{ marginTop: `${windowSize.height / 2 - 70}px` }}>
      <RulesPlainIcon />

      <Separator />

      <Column gap={6}>
        <TYPE.body>
          <Trans>Update in progress...</Trans>
        </TYPE.body>
        {!!percentage && <TYPE.large>{+percentage.toFixed(2)}%</TYPE.large>}
      </Column>
    </StyledMaintenance>
  )
}

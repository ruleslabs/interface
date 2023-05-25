import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import useWindowSize from 'src/hooks/useWindowSize'

import { ReactComponent as RulesPlainIcon } from 'src/images/logo-plain.svg'

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
    <StyledMaintenance style={windowSize?.height ? { marginTop: `${windowSize.height / 2 - 70}px` } : undefined}>
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

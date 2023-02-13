import { useMemo } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Trans } from '@lingui/macro'

import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PaginationSpinner } from '@/components/Spinner'

const ARTISTS_FUND_QUERY = gql`
  query {
    primaryMarketArtistsFundTotalValue
  }
`

export default function ArtistsFund() {
  const artistsFundQuery = useQuery(ARTISTS_FUND_QUERY)
  const primaryMatketArtistsFundTotalValue = useMemo(
    () =>
      artistsFundQuery.data?.primaryMarketArtistsFundTotalValue
        ? Math.round(artistsFundQuery.data?.primaryMarketArtistsFundTotalValue / 100)
            .toLocaleString()
            .replace(',', ' ')
        : 0,
    [artistsFundQuery.data?.primaryMarketArtistsFundTotalValue]
  )

  // loading
  const isLoading = artistsFundQuery.loading

  return (
    <>
      {!!primaryMatketArtistsFundTotalValue && (
        <Column gap={4}>
          <TYPE.large fontSize={40}>{primaryMatketArtistsFundTotalValue}€</TYPE.large>
          <TYPE.body color="text2">
            <Trans>donated to independent artists</Trans>
          </TYPE.body>
        </Column>
      )}

      <PaginationSpinner loading={isLoading} />
    </>
  )
}

import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useLazyQuery, gql } from '@apollo/client'

// import { TYPE } from '@/styles/theme'
import { useSearchTransfers } from '@/state/search/hooks'
import { PaginationSpinner } from '@/components/Spinner'
import Card from '@/components/CardModel3D/Card'

const TRANSFERS_QUERY = gql`
  query ($cardModelId: ID!, $starknetAddresses: [String!]!) {
    cardModelsByIds(ids: [$cardModelId]) {
      id
      slug
      videoUrl
      scarcity {
        maxSupply
        name
      }
      artist {
        displayName
      }
    }
    usersByStarknetAddresses(starknetAddresses: $starknetAddresses) {
      username
      slug
      profile {
        pictureUrl(derivative: "width=128")
      }
      starknetWallet {
        address
      }
    }
  }
`

const StyledLive = styled.div`
  video {
    width: 100%;
  }
`

export default function Live() {
  // hit
  const [transfersHit, setTransferHit] = useState<any[]>([])

  // tables
  const [usersTable, setUsersTable] = useState<{ [key: string]: any }>({})
  const [cardModel, setCardModel] = useState<any | null>(null)

  // query offers data
  const onTransfersQueryCompleted = useCallback((data: any) => {
    setUsersTable(
      data.usersByStarknetAddresses.reduce<{ [key: string]: any }>((acc, user) => {
        acc[user.starknetWallet.address] = user
        return acc
      }, {})
    )

    console.log(data.cardModelsByIds[0])

    setCardModel(data.cardModelsByIds[0] ?? null)
  }, [])
  const [queryTransferData, transferQuery] = useLazyQuery(TRANSFERS_QUERY, { onCompleted: onTransfersQueryCompleted })

  // search transfer
  const onPageFetched = useCallback((hits: any) => {
    queryTransferData({
      variables: {
        cardModelId: hits[0].cardModelId,
        starknetAddresses: [hits[0].fromStarknetAddress, hits[0].toStarknetAddress],
      },
    })
    setTransferHit(hit)
  })
  const transferSearch = useSearchTransfers({
    sortingKey: 'txIndexDesc',
    hitsPerPage: 1,
    noMinting: true,
    onPageFetched,
  })

  // loading
  const isLoading = transferSearch.loading || transferQuery.loading

  return (
    <StyledLive>
      {transfersHit && cardModel && usersTable !== {} && (
        <>
          <Card videoUrl={cardModel.videoUrl} scarcityName={cardModel.scarcity.name} revealed />
        </>
      )}

      <PaginationSpinner loading={isLoading} />
    </StyledLive>
  )
}

import { useMemo, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Plural, Trans } from '@lingui/macro'

import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PaginationSpinner } from 'src/components/Spinner'
import LiveRewardRow from './LiveRewardRow'
import LiveRewardDetailsModal from 'src/components/LiveRewardModal/Details'
import LiveRewardTicketModal from 'src/components/LiveRewardModal/Ticket'

const GET_ALL_LIVE_EVENTS = gql`
  query {
    allLiveRewards {
      id
      displayName
      pictureUrl(derivative: "width=1568")
      date
      location
      displayName
      totalSlotsCount
      claimedSlotsCount
      eligible
      claimed
      eligibility {
        key
        value
      }
      cardModelReward {
        pictureUrl(derivative: "width=256px")
        season
        scarcity {
          name
        }
        artist {
          displayName
        }
      }
    }
  }
`

export interface LiveReward {
  id: string
  displayName: string
  date: Date
  location: string
  pictureUrl: string
  totalSlotsCount: number
  claimedSlotsCount: number
  claimed?: boolean
  eligible?: boolean
  eligibility: Array<{
    key: string
    value: string
  }>
  cardModelReward: {
    pictureUrl: string
    season: number
    scarcity: {
      name: string
    }
    artist: {
      displayName: string
    }
  }
}

export default function LiveRewards() {
  // selected live reward
  const [selectedLiveReward, setSelectedLiveReward] = useState<LiveReward | null>(null)

  // query
  const allLiveRewardsQuery = useQuery(GET_ALL_LIVE_EVENTS)
  const liveRewards: LiveReward[] = allLiveRewardsQuery.data?.allLiveRewards ?? []

  const openEligibilityCount = useMemo(
    () =>
      liveRewards.reduce<number>(
        (acc, liveReward) =>
          acc + (liveReward.totalSlotsCount > liveReward.claimedSlotsCount && liveReward.eligible ? 1 : 0),
        0
      ),
    [liveRewards.length]
  )

  const isLoading = allLiveRewardsQuery.loading

  return (
    <Column gap={24}>
      {!isLoading && (
        <>
          <TYPE.body>
            {openEligibilityCount ? (
              <Trans>
                You are eligible to
                <span> </span>
                <Plural value={openEligibilityCount} _1="a live reward" other="{openEligibilityCount} live rewards" />!
              </Trans>
            ) : (
              <Trans>No open live rewards you&apos;re eligible to.</Trans>
            )}
          </TYPE.body>

          <Column gap={16}>
            {liveRewards.map((liveReward, index) => (
              <LiveRewardRow key={index} liveReward={liveReward} onSelected={setSelectedLiveReward} />
            ))}
          </Column>
        </>
      )}

      <PaginationSpinner loading={isLoading} />

      <LiveRewardDetailsModal liveReward={selectedLiveReward ?? undefined} />
      <LiveRewardTicketModal liveReward={selectedLiveReward ?? undefined} />
    </Column>
  )
}

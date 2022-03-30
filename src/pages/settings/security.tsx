import { useCallback, useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import moment, { Duration } from 'moment'
import styled from 'styled-components'

import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Section from '@/components/Section'
import { SecondaryButton } from '@/components/Button'
import { useRevokeSessionMutation } from '@/state/auth/hooks'

const Session = styled(RowCenter)`
  width: 100%;
  justify-content: space-between;
  padding: 16px 32px;
  border: solid ${({ theme }) => theme.white}80;
  border-width: 1px 0 0;

  &:last-child {
    border-width: 1px 0;
  }
`

const GET_ACTIVE_SESSIONS = gql`
  query {
    allActiveSessions {
      osName
      creationDate
      payload
      currentSession
    }
  }
`

interface Session {
  osName: string
  duration: Duration
  payload: string
  currentSession: boolean
}

export default function Settings() {
  const { data: activeSessionsData, error: activeSessionError } = useQuery(GET_ACTIVE_SESSIONS)
  const [revokeSessionMutation, { data: revokeSessionData, error: revokeSessionError }] = useRevokeSessionMutation()

  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  const handleSessionRevoke = useCallback(
    (payload, currentSession) => {
      revokeSessionMutation({ variables: { payload } }).catch((error) => {
        console.error(error)
      })
    },
    [revokeSessionMutation]
  )

  useEffect(() => {
    const payload = revokeSessionData?.revokeRefreshToken

    if (payload) {
      setActiveSessions(activeSessions.filter((session) => session.payload !== payload))
    }
  }, [revokeSessionData])

  useEffect(() => {
    setActiveSessions(
      (activeSessionsData?.allActiveSessions ?? [])
        .slice()
        .sort((a: any, b: any) => +b.currentSession - +a.currentSession)
        .map((session: any) => {
          const now = moment(Date.now())
          const creationDate = moment(session.creationDate)
          const duration = moment.duration(creationDate.diff(now))

          return {
            ...session,
            duration,
          }
        })
    )
  }, [activeSessionsData])

  return (
    <Section size="max" marginTop="44px">
      <Column>
        {activeSessions.map((session, index) => (
          <Session key={`active-session-${index}`}>
            <Column gap={4}>
              <TYPE.medium>{session.osName}</TYPE.medium>
              {session.currentSession ? (
                <TYPE.body color="primary1">Current session</TYPE.body>
              ) : (
                <TYPE.body>Last seen {session.duration.humanize(true)}</TYPE.body>
              )}
            </Column>
            {!session.currentSession && (
              <SecondaryButton onClick={() => handleSessionRevoke(session.payload, session.currentSession)}>
                Logout this session
              </SecondaryButton>
            )}
          </Session>
        ))}
      </Column>
    </Section>
  )
}

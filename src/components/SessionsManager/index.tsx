import { useCallback, useEffect, useState } from 'react'
import { useQuery, gql, ApolloError } from '@apollo/client'
import moment, { Duration } from 'moment'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Card from '@/components/Card'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { useRevokeSessionMutation } from '@/state/auth/hooks'

const StyledSessionsManager = styled(Card)`
  margin: 0;
  padding: 64px;
  width: 100%;

  ${({ theme }) => theme.media.medium`
    height: 100%;
    padding: 28px;
  `}
`

const StyledSessionRow = styled(RowCenter)`
  width: 100%;
  justify-content: space-between;
  padding: 16px 32px;
  border-width: 1px 0 0;

  :hover {
    background: ${({ theme }) => theme.bg3}40;
  }

  ${({ theme }) => theme.media.small`
    padding: 12px 0;
  `}
`

const CurrentSession = styled(TYPE.body)`
  background: ${({ theme }) => theme.primary1};
  padding: 0 8px;
  border-radius: 2px;
  font-weight: 400;
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

interface SessionRowProps {
  session?: Session
  onRevoke: (payload: string) => void
}

const SessionRow = ({ session, onRevoke }: SessionRowProps) => {
  if (!session) return null

  return (
    <StyledSessionRow>
      <Column gap={4}>
        <TYPE.medium>{session.osName}</TYPE.medium>
        {session.currentSession ? (
          <CurrentSession>
            <Trans>Current session</Trans>
          </CurrentSession>
        ) : (
          <TYPE.subtitle>Last seen {session.duration.humanize(true)}</TYPE.subtitle>
        )}
      </Column>
      {!session.currentSession && (
        <TYPE.body color="error" onClick={() => onRevoke(session.payload)} textAlign="right" clickable>
          <Trans>Disconnect this session</Trans>
        </TYPE.body>
      )}
    </StyledSessionRow>
  )
}

export default function SessionsManager() {
  const { data: activeSessionsData, error: activeSessionError } = useQuery(GET_ACTIVE_SESSIONS)
  const [revokeSessionMutation] = useRevokeSessionMutation()

  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  const handleSessionRevoke = useCallback(
    (payload) => {
      revokeSessionMutation({ variables: { payload } })
        .then((res: any) => {
          const payload = res?.data?.revokeRefreshToken
          if (payload) setActiveSessions(activeSessions.filter((session) => session.payload !== payload))
        })
        .catch((revokeSessionError: ApolloError) => {
          console.error(revokeSessionError) // TODO handle error
        })
    },
    [revokeSessionMutation, setActiveSessions, activeSessions]
  )

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
    <StyledSessionsManager>
      <Column gap={32}>
        <Column gap={16}>
          <TYPE.large>
            <Trans>Current active session</Trans>
          </TYPE.large>
          <TYPE.subtitle>
            <Trans>You are connected to Rules with this session.</Trans>
          </TYPE.subtitle>
          <SessionRow session={activeSessions[0]} onRevoke={handleSessionRevoke} />
        </Column>

        <Column gap={16}>
          <TYPE.large>
            <Trans>Disconnect from other sessions</Trans>
          </TYPE.large>
          <TYPE.subtitle>
            <Trans>You are also connected to Rules with other sessions, on other devices.</Trans>
          </TYPE.subtitle>
          <Column>
            {activeSessions.map((session, index) =>
              index ? (
                <SessionRow key={`active-session-${index}`} session={session} onRevoke={handleSessionRevoke} />
              ) : null
            )}
          </Column>
        </Column>
      </Column>
    </StyledSessionsManager>
  )
}

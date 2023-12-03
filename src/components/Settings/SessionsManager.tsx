import { gql, useQuery } from '@apollo/client'
import { t, Trans } from '@lingui/macro'
import moment, { Duration } from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { SecondaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Label from 'src/components/Label'
import { RowBetween, RowCenter } from 'src/components/Row'
import { useRevokeSession } from 'src/graphql/data/Auth'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const StyledSessionRow = styled(RowCenter)`
  width: 100%;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;
  align-items: center;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.media.small`
    padding: 12px 8px;
  `}
`

const RevokeButton = styled(SecondaryButton)`
  background: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg3}80;
  color: ${({ theme }) => theme.error};
  min-height: unset;
  padding: 4px 12px;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.error};
    color: ${({ theme }) => theme.text1};
  }
`

const GET_ACTIVE_SESSIONS = gql`
  query {
    allActiveSessions {
      osName
      creationDate
      payload
      isCurrentSession
    }
  }
`

interface Session {
  osName: string
  duration: Duration
  payload: string
  isCurrentSession: boolean
}

interface SessionRowProps extends Omit<Session, 'payload'> {
  onRevoke: () => void
}

const SessionRow = ({ osName, duration, isCurrentSession, onRevoke }: SessionRowProps) => {
  return (
    <StyledSessionRow>
      <RowBetween>
        <Column gap={4}>
          <TYPE.subtitle fontWeight={500}>{osName}</TYPE.subtitle>

          {isCurrentSession ? (
            <Label value={t`Current session`} color="primary1" uppercased />
          ) : (
            <TYPE.subtitle fontSize={14}>Last seen {duration.humanize(true)}</TYPE.subtitle>
          )}
        </Column>

        {!isCurrentSession && (
          <RevokeButton onClick={onRevoke}>
            <Trans>Disconnect</Trans>
          </RevokeButton>
        )}
      </RowBetween>
    </StyledSessionRow>
  )
}

export default function SessionsManager() {
  const activeSessionsQuery = useQuery(GET_ACTIVE_SESSIONS)
  const [revokeSessionMutation] = useRevokeSession()

  const [activeSessions, setActiveSessions] = useState<Session[]>([])

  const handleSessionRevoke = useCallback(
    async (payload) => {
      const { success } = await revokeSessionMutation({ variables: { payload } })

      if (success) {
        setActiveSessions(activeSessions.filter((session) => session.payload !== payload))
      }
    },
    [revokeSessionMutation, setActiveSessions, activeSessions]
  )

  useEffect(() => {
    setActiveSessions(
      (activeSessionsQuery.data?.allActiveSessions ?? [])
        .slice()
        .sort((a: any, b: any) => +b.isCurrentSession - +a.isCurrentSession)
        .map((session: any) => ({
          ...session,
          duration: moment.duration(moment(session.creationDate).diff(moment(Date.now()))),
        }))
    )
  }, [activeSessionsQuery.data])

  return (
    <Column gap={24}>
      <TYPE.body>
        <Trans>
          A session is a device your account is currently logged into. You can disconnect these sessions from this
          device.
        </Trans>
      </TYPE.body>

      <Column gap={16}>
        {activeSessions.map((session, index) => (
          <SessionRow
            key={`active-session-${index}`}
            osName={session.osName}
            duration={session.duration}
            isCurrentSession={session.isCurrentSession}
            onRevoke={() => handleSessionRevoke(session.payload)}
          />
        ))}
      </Column>
    </Column>
  )
}

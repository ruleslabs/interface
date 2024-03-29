import { useConnect } from '@starknet-react/core'
import { Connection, L1Connection, L2Connection } from 'src/connections'
import { useTryL1Activation } from 'src/hooks/useL1WalletActivation'
import { Row } from 'src/theme/components/Flex'
import * as Text from 'src/theme/components/Text'
import noop from 'src/utils/noop'

import * as styles from './Option.css'

interface OptionProps {
  connection: Connection
  activate: () => void
}

function Option({ connection, activate }: OptionProps) {
  return (
    <Row gap="12" className={styles.option} onClick={activate}>
      <img width={32} height={32} src={connection.getIcon?.()} />
      <Text.Body>{connection.getName()}</Text.Body>
    </Row>
  )
}

interface L1OptionProps {
  connection: L1Connection
}

export function L1Option({ connection }: L1OptionProps) {
  // wallet activation
  const tryActivation = useTryL1Activation()
  const activate = () => tryActivation(connection, noop)

  return <Option connection={connection} activate={activate} />
}

interface L2OptionProps {
  connection: L2Connection
}

export function L2Option({ connection }: L2OptionProps) {
  // wallet activation
  const { connect } = useConnect()
  const activate = () => connect({ connector: connection.connector })

  return <Option connection={connection} activate={activate} />
}

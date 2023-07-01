import { useCallback, useState } from 'react'

import * as Text from 'src/theme/components/Text'
import * as Icons from 'src/theme/components/Icons'
import Box from 'src/theme/components/Box'
import { Row } from 'src/theme/components/Flex'
import * as styles from './LongString.css'

interface LongStringProps {
  value: string
  copiable?: boolean
}

export default function LongString({ value, copiable = false }: LongStringProps) {
  const [copied, setCopied] = useState(false)

  // copy
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value)

    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }, [value])

  return (
    <Row className={styles.longStringContainer}>
      <Text.Body className={styles.lognStringText}>{value}</Text.Body>

      {copiable && (
        <Box className={styles.copyIconContainer} onClick={copy}>
          {copied ? <Icons.Copied /> : <Icons.Copy />}
        </Box>
      )}
    </Row>
  )
}

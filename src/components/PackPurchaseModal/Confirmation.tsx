import { useCallback } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import Link from '@/components/Link'
import { useStarknet } from '@/lib/starknet'
import { NETWORKS } from '@/constants/networks'

import Copy from '@/images/copy.svg'
import ExternalLink from '@/images/external-link.svg'
import Checkmark from '@/images/checkmark.svg'

const Title = styled(TYPE.large)`
  font-weight: 400;
  text-align: center;
  width: 100%;

  span {
    font-weight: 700;
  }

  svg {
    margin-right: 8px;
    width: 24px;
    stroke: ${({ theme }) => theme.primary1};
  }
`

const TxHash = styled(TYPE.body)`
  background: ${({ theme }) => theme.bg3};
  padding: 4px 8px;
  border-radius: 2px;
  letter-spacing: 0.5px;
`

const TxHashWrapper = styled(RowCenter)`
  gap: 16px;
  justify-content: center;

  svg {
    cursor: pointer;
    width: 16px;
    margin: 0 0 -2px 4px;
  }

  svg * {
    stroke: ${({ theme }) => theme.text1};
  }

  ${({ theme }) => theme.media.small`
    flex-direction: column;
  `}
`

interface ConfirmationProps {
  txHash: string
  packName: string
}

export default function Confirmation({ txHash, packName }: ConfirmationProps) {
  const { network } = useStarknet()
  const explorerBaseUrl = NETWORKS[network]?.explorerBaseUrl

  const onCopyTxHash = useCallback(() => {
    navigator.clipboard.writeText(txHash)
  }, [txHash])

  return (
    <Column gap={32}>
      <Title>
        <Checkmark />
        <Trans>
          Your&nbsp;
          <span>{packName}&nbsp;</span>
          is on its way
        </Trans>
      </Title>
      <TxHashWrapper>
        <TxHash>
          {txHash.substring(0, 8)}
          ...
          {txHash.substring(txHash.length - 8)}
        </TxHash>
        <RowCenter gap={16}>
          <TYPE.body onClick={onCopyTxHash} clickable>
            <Trans>Copy</Trans>
            <Copy />
          </TYPE.body>
          {explorerBaseUrl && (
            <Link href={`${explorerBaseUrl}/tx/${txHash}`} target="_blank">
              <TYPE.body clickable>
                <Trans>View on Voyager</Trans>
                <ExternalLink />
              </TYPE.body>
            </Link>
          )}
        </RowCenter>
      </TxHashWrapper>
    </Column>
  )
}

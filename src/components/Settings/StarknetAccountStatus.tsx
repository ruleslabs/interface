import { t, Trans } from '@lingui/macro'
import Column from 'src/components/Column'
import Link from 'src/components/Link'
import Row from 'src/components/Row'
import StarknetAccountPrivateKeyModal from 'src/components/StarknetAccountPrivateKeyModal'
import LongString from 'src/components/Text/LongString'
import Subtitle from 'src/components/Text/Subtitle'
import { getChainInfo } from 'src/constants/chainInfo'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { useStarknetAccountPrivateKeyModalToggle } from 'src/state/application/hooks'
import { getChecksumAddress } from 'starknet'
import styled from 'styled-components/macro'

import { PrimaryButton, SecondaryButton } from '../Button'

const ButtonsWrapper = styled(Row)`
  gap: 16px;

  ${({ theme }) => theme.media.extraSmall`
    & button {
      padding: 4px;
      width: 100%;
    }

    & > * {
      flex: 1;
    }
  `}
`

export default function StarknetAccountStatus() {
  // current user
  const { address } = useRulesAccount()

  // private key modal
  const toggleStarknetAccountPrivateKeyModal = useStarknetAccountPrivateKeyModalToggle()

  if (!address) return null

  return (
    <>
      <Column gap={12}>
        <Subtitle value={t`Wallet address`} />
        <LongString value={getChecksumAddress(address)} copiable />

        <ButtonsWrapper>
          <Link
            target="_blank"
            href={`${
              getChainInfo(rulesSdk.networkInfos.starknetChainId)?.explorer
            }/contract/${address}#portfolio-sub-nfts`}
          >
            <PrimaryButton>
              <Trans>See on Starkscan</Trans>
            </PrimaryButton>
          </Link>

          <SecondaryButton onClick={toggleStarknetAccountPrivateKeyModal}>
            <Trans>See my private key</Trans>
          </SecondaryButton>
        </ButtonsWrapper>
      </Column>

      <StarknetAccountPrivateKeyModal />
    </>
  )
}

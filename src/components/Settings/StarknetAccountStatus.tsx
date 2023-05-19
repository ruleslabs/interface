import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import useCurrentUser from '@/hooks/useCurrentUser'
import Column from '@/components/Column'
import { PrimaryButton, SecondaryButton } from '../Button'
import LongHex from '@/components/Text/LongHex'
import Link from '@/components/Link'
import { NETWORKS, networkId } from '@/constants/networks'
import Row from '@/components/Row'
import Subtitle from '@/components/Text/Subtitle'
import { useStarknetAccountPrivateKeyModalToggle } from '@/state/application/hooks'
import StarknetAccountPrivateKeyModal from '@/components/StarknetAccountPrivateKeyModal'

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
  const { currentUser } = useCurrentUser()

  // private key modal
  const toggleStarknetAccountPrivateKeyModal = useStarknetAccountPrivateKeyModalToggle()

  return (
    <>
      <Column gap={12}>
        <Subtitle value={t`Wallet address`} />
        <LongHex value={currentUser.starknetWallet.address} />

        <ButtonsWrapper>
          <Link
            target="_blank"
            href={`${NETWORKS[networkId].explorerBaseUrl}/contract/${currentUser.starknetWallet.address}`}
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

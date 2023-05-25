import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Plural, Trans } from '@lingui/macro'

import Column from 'src/components/Column'
import { PrimaryButton } from '../Button'
import { useRetrieveEthersModalToggle } from 'src/state/application/hooks'
import EtherRetrieveModal from 'src/components/EtherRetrieverModal'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { TYPE } from 'src/styles/theme'
import { WeiAmount } from '@rulesorg/sdk-core'

const RetrieveButton = styled(PrimaryButton)`
  width: fit-content;
`

export default function StarknetAccountStatus() {
  // current user
  const { currentUser } = useCurrentUser()

  // private key modal
  const toggleRetrieveEthersModal = useRetrieveEthersModalToggle()

  // total amount
  const totalAmountToRetrieve = useMemo(
    () =>
      ((currentUser?.retrievableEthers ?? []) as any[])
        .reduce<WeiAmount>((acc, { amount }) => acc.add(WeiAmount.fromRawAmount(amount)), WeiAmount.ZERO)
        .toSignificant(6),
    [currentUser?.retrievableEthers?.length]
  )

  if (!currentUser) return null

  return (
    <>
      <Column gap={16}>
        {currentUser.retrievableEthers.length > 0 ? (
          <>
            <TYPE.body>
              <Trans>
                You have
                <span> </span>
                <Plural value={currentUser.retrievableEthers.length} _1="a withdraw" other="{0} withdraws" />
                <span> </span>
                to retrieve
                <span> </span>
                <strong>({totalAmountToRetrieve} ETH)</strong> to your Ethereum wallet.
              </Trans>
            </TYPE.body>

            <RetrieveButton onClick={toggleRetrieveEthersModal}>
              <Trans>Retrieve my ETH</Trans>
            </RetrieveButton>
          </>
        ) : (
          <TYPE.body>
            <Trans>Nothing to retrieve yet !</Trans>
          </TYPE.body>
        )}
      </Column>

      <EtherRetrieveModal />
    </>
  )
}

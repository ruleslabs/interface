import { useCallback } from 'react'
import { Trans } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { PrimaryButton } from 'src/components/Button'
import { TYPE } from 'src/styles/theme'
import useRulesAccount from 'src/hooks/useRulesAccount'
import { ModalBody } from '../Modal/Classic'
import { StarknetStatus } from '../Web3Status'
import { Column, Row } from 'src/theme/components/Flex'
import { PaginationSpinner } from '../Spinner'
import { useCardsCount } from 'src/graphql/data/Cards'
import Link from '../Link'
import { ModalContentProps } from 'src/types'
import { MigrateCollectionModalMode } from '.'

export default function MigrateCollectionModal({ setModalMode }: ModalContentProps<MigrateCollectionModalMode>) {
  // current user
  const { currentUser } = useCurrentUser()

  // starknet accounts
  const { address: rulesAddress } = useRulesAccount()

  // cards count
  const { data: cardsCount, loading } = useCardsCount({
    filter: {
      ownerStarknetAddress: rulesAddress ?? '0x0',
      seasons: [],
      scarcityAbsoluteIds: [],
    },
  })

  // cards transfer
  const onCardsTransfer = useCallback(() => {
    if (!setModalMode) return

    setModalMode(MigrateCollectionModalMode.CARDS)
  }, [setModalMode])

  // packs transfer
  const onPacksTransfer = useCallback(() => {
    if (!setModalMode) return

    setModalMode(MigrateCollectionModalMode.PACKS)
  }, [setModalMode])

  if (!currentUser) return null

  return (
    <ModalBody>
      {loading ? (
        <PaginationSpinner loading />
      ) : (
        <Column gap={'24'}>
          <TYPE.large>
            <Trans>Dear Rulers</Trans>
          </TYPE.large>

          <TYPE.body textAlign="justify">
            <Trans>
              Thank you for your confidence in our platform. As previously announced,&nbsp;
              <Link href="#" target="_blank" underline>
                Rules is about to close.
              </Link>
              <br />
              <br />
              To ensure that you can continue to enjoy your collection, we have set up a simple transfer process to an
              external wallet (
              <Link href="https://www.argent.xyz/" target="_blank" underline>
                ArgentX
              </Link>
              <span> or </span>
              <Link href="https://braavos.app" target="_blank" underline>
                Braavos
              </Link>
              )
            </Trans>
          </TYPE.body>

          <StarknetStatus>
            <Row gap={'16'}>
              {!!cardsCount && (
                <PrimaryButton onClick={onCardsTransfer} width={'full'} large>
                  <Trans>Transfer {cardsCount} cards</Trans>
                </PrimaryButton>
              )}

              <PrimaryButton onClick={onPacksTransfer} width={'full'} large>
                <Trans>Transfer 10 packs</Trans>
              </PrimaryButton>
            </Row>
          </StarknetStatus>
        </Column>
      )}
    </ModalBody>
  )
}

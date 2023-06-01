import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans, t } from '@lingui/macro'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { useStarknet } from '@starknet-react/core'

import { ModalBody } from 'src/components/Modal/Sidebar'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useETHBalance, useSetWalletModalMode } from 'src/state/wallet/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import useRulesAccount from 'src/hooks/useRulesAccount'
import * as Text from 'src/theme/components/Text'
import { useGetWalletConstructorCallData } from 'src/hooks/useCreateWallet'
import StarknetSigner from '../StarknetSigner'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { Account, ec, hash, stark } from 'starknet'
import { PaginationSpinner } from '../Spinner'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { DEPLOYMENT_DEPOSIT_SUGGESTION_FACTOR } from 'src/constants/misc'
import { useModalOpened } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'

export default function Deploy() {
  const [parsedDummyDeploymentMaxFee, setParsedDummyDeploymentMaxFee] = useState<WeiAmount | null>(null)

  // display
  const display = useMemo(
    () => ({
      confirmationText: t`Your deployment is on its way`,
      confirmationActionText: t`Confirm deployment`,
      transactionText: t`Wallet deployment`,
    }),
    []
  )

  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)

  // current user
  const { currentUser } = useCurrentUser()
  const { publicKey } = currentUser?.starknetWallet ?? {}

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])

  // wallet
  const { address } = useRulesAccount()
  const { library } = useStarknet()

  // starknet tx
  const { setAccountDeploymentPayload, setSigning, resetStarknetTx } = useStarknetTx()

  // ETH balance
  const balance = useETHBalance(address)

  // deployment
  const getWalletConstructorCallData = useGetWalletConstructorCallData()
  useEffect(() => {
    if (!address || !publicKey || !library) return

    setAccountDeploymentPayload({
      classHash: constants.ACCOUNT_CLASS_HASH,
      addressSalt: publicKey,
      constructorCalldata: getWalletConstructorCallData(publicKey),
      contractAddress: address,
    })

    // dummy deployment fee estimation
    const dummyPrivateKey = stark.randomAddress()
    const dummyPublicKey = ec.starkCurve.getStarkKey(dummyPrivateKey)
    const dummyCalldata = getWalletConstructorCallData(dummyPublicKey)

    const dummyAddress = hash.calculateContractAddressFromHash(
      dummyPublicKey,
      constants.ACCOUNT_CLASS_HASH,
      dummyCalldata,
      0
    )

    const dummyAccount = new Account(library, dummyAddress, dummyPrivateKey)

    dummyAccount
      .estimateAccountDeployFee({
        classHash: constants.ACCOUNT_CLASS_HASH,
        addressSalt: dummyPublicKey,
        constructorCalldata: dummyCalldata,
        contractAddress: dummyAddress,
      })
      .then(({ suggestedMaxFee }) =>
        setParsedDummyDeploymentMaxFee(WeiAmount.fromRawAmount(suggestedMaxFee.toString()))
      )
  }, [address, library, publicKey])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const componentContent = useMemo(() => {
    if (parsedDummyDeploymentMaxFee && balance && balance.lessThan(parsedDummyDeploymentMaxFee)) {
      // Multipl
      const suggestedDeposit = parsedDummyDeploymentMaxFee.multiply(DEPLOYMENT_DEPOSIT_SUGGESTION_FACTOR)

      return (
        <Column gap={24}>
          <Column gap={20}>
            <Text.Body>
              <Trans>The deployment will cost a small fee, start by adding some funds to your wallet.</Trans>
            </Text.Body>

            <Text.Body>
              <Trans>
                <strong>
                  {+suggestedDeposit.toFixed(6)} ETH (€
                  {weiAmountToEURValue(suggestedDeposit)?.toFixed(2)})
                </strong>{' '}
                should be enough
              </Trans>
            </Text.Body>

            <PrimaryButton onClick={onDepositMode} large>
              <Trans>Add funds</Trans>
            </PrimaryButton>
          </Column>
        </Column>
      )
    } else if (parsedDummyDeploymentMaxFee && balance) {
      setSigning(true)
    }

    return <PaginationSpinner loading={true} />
  }, [parsedDummyDeploymentMaxFee, balance])

  useEffect(() => {
    resetStarknetTx()
  }, [isOpen])

  return (
    <ModalBody>
      <StarknetSigner display={display}>{componentContent}</StarknetSigner>
    </ModalBody>
  )
}

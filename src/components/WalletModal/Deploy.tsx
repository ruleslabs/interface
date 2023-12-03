import { Trans } from '@lingui/macro'
import { constants, WeiAmount } from '@rulesorg/sdk-core'
import { useProvider } from '@starknet-react/core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import { ModalBody } from 'src/components/Modal/Sidebar'
import { DEPLOYMENT_DEPOSIT_SUGGESTION_FACTOR } from 'src/constants/misc'
import { useGetWalletConstructorCallData } from 'src/hooks/useCreateWallet'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useRulesAccount from 'src/hooks/useRulesAccount'
import useStarknetTx from 'src/hooks/useStarknetTx'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened } from 'src/state/application/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { useETHBalance, useSetWalletModalMode } from 'src/state/wallet/hooks'
import * as Text from 'src/theme/components/Text'
import { Account, ec, hash, stark } from 'starknet'

import { PaginationSpinner } from '../Spinner'
import StarknetSigner from '../StarknetSigner/Transaction'

export default function Deploy() {
  const [parsedDummyDeploymentMaxFee, setParsedDummyDeploymentMaxFee] = useState<WeiAmount | null>(null)

  // current user
  const { currentUser } = useCurrentUser()
  const { currentPublicKey } = currentUser?.starknetWallet ?? {}

  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()

  const onDepositMode = useCallback(() => setWalletModalMode(WalletModalMode.DEPOSIT), [setWalletModalMode])

  // wallet
  const { address } = useRulesAccount()
  const { provider } = useProvider()

  // starknet tx
  const { setAccountDeploymentPayload, setSigning, signing, resetStarknetTx } = useStarknetTx()

  // ETH balance
  const balance = useETHBalance(address)

  // deployment
  const getWalletConstructorCallData = useGetWalletConstructorCallData()
  useEffect(() => {
    if (!address || !currentPublicKey || !provider) return

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

    const dummyAccount = new Account(provider, dummyAddress, dummyPrivateKey)

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
  }, [address, provider, currentPublicKey])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  const componentContent = useMemo(() => {
    if (currentPublicKey && parsedDummyDeploymentMaxFee && balance && balance.lessThan(parsedDummyDeploymentMaxFee)) {
      // Multiply suggested deposit in case of a rapid gas price increase
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
    } else if (currentPublicKey && parsedDummyDeploymentMaxFee && balance && !signing) {
      setAccountDeploymentPayload({
        classHash: constants.ACCOUNT_CLASS_HASH,
        addressSalt: currentPublicKey.toLowerCase(),
        constructorCalldata: getWalletConstructorCallData(currentPublicKey),
        contractAddress: address,
      })
      setSigning(true)
    }

    return <PaginationSpinner loading={true} />
  }, [parsedDummyDeploymentMaxFee, balance, signing, currentPublicKey])

  useEffect(() => {
    resetStarknetTx()
  }, [isOpen])

  return (
    <ModalBody>
      <StarknetSigner action="walletDeployment" skipSignin allowUndeployed>
        {componentContent}
      </StarknetSigner>
    </ModalBody>
  )
}

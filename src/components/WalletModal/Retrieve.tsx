import JSBI from 'jsbi'
import { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'

import { useCurrentUser, useSetCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import Row, { RowBetween } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Metamask from '@/components/Metamask'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import EthereumSigner from '@/components/EthereumSigner'
import { useEthereumMulticallContract, useEthereumStarkgateContract } from '@/hooks/useContract'
import Link from '@/components/Link'
import { desiredChainId } from '@/constants/connectors'
import { CHAINS } from '@/constants/networks'
import { useRetrieveEtherMutation, useSetWalletModalMode } from '@/state/wallet/hooks'
import { WalletModalMode } from '@/state/wallet/actions'

import ExternalLinkIcon from '@/images/external-link.svg'

const RetrievableWrapper = styled(RowBetween)`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.bg5};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 4px;
`

const RetrievableAddress = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 3px;
  margin-left: auto;
  cursor: pointer;

  & svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.text1};
  }

  &:hover * {
    text-decoration: underline;
  }
`

export default function Retrieve() {
  // current user
  const currentUser = useCurrentUser()
  const setCurrentUser = useSetCurrentUser()

  // modal mode
  const setWalletModalMode = useSetWalletModalMode()
  const onBack = useCallback(() => setWalletModalMode(WalletModalMode.WITHDRAW), [])

  // amount
  const parsedAmounts = useMemo(
    () =>
      (currentUser?.retrievableEthers ?? []).map((retrievableEther: any) =>
        WeiAmount.fromRawAmount(retrievableEther.amount)
      ),
    [currentUser?.retrievableEthers]
  )
  const totalParsedAmount = useMemo(() => {
    const total = ((currentUser?.retrievableEthers ?? []) as any[]).reduce<JSBI>(
      (acc, retrievableEther: any) => JSBI.add(JSBI.BigInt(retrievableEther.amount), acc),
      JSBI.BigInt(0)
    )

    return WeiAmount.fromRawAmount(total.toString())
  }, [currentUser?.retrievableEthers])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // tx
  const [txHash, setTxHash] = useState<string | null>(null)
  const [waitingForTx, setWaitingForTx] = useState(false)

  // error
  const [error, setError] = useState<string | null>(null)

  // mutation
  const [retrieveEtherMutation] = useRetrieveEtherMutation()

  // l1 contracts
  const ethereumMulticallContract = useEthereumMulticallContract()
  const ethereumStarkgateContract = useEthereumStarkgateContract()

  // retrieve
  const onRetrieve = useCallback(() => {
    if (!ethereumStarkgateContract || !ethereumMulticallContract || !currentUser?.retrievableEthers) return

    const fragment = ethereumStarkgateContract.interface?.getFunction('withdraw')
    if (!fragment) return

    setWaitingForTx(true)

    const estimate = ethereumMulticallContract.estimateGas.aggregate
    const method = ethereumMulticallContract.aggregate
    const args = currentUser.retrievableEthers.map((retrievableEther: any) => ({
      target: ethereumStarkgateContract.address,
      callData: ethereumStarkgateContract.interface.encodeFunctionData(fragment, [
        retrievableEther.amount,
        retrievableEther.l1Recipient,
      ]),
    }))

    estimate(args, {})
      .then((estimatedGasLimit) =>
        method(args, { gasLimit: estimatedGasLimit }).then((response: any) => {
          setTxHash(response.hash)

          retrieveEtherMutation({
            variables: {
              hash: response.hash,
              withdraws: currentUser.retrievableEthers.map((retrievableEther: any) => ({
                amount: retrievableEther.amount,
                l1Recipient: retrievableEther.l1Recipient,
              })),
            },
          })
            .then(() => setCurrentUser({ ...currentUser, retrievableEthers: [] }))
            .catch((retrieveEtherError: ApolloError) => {
              console.error(retrieveEtherError?.graphQLErrors?.[0])
            })
        })
      )
      .catch((error: any) => {
        setError(error.message)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) console.error(error)
      })
  }, [ethereumMulticallContract, ethereumStarkgateContract, currentUser?.retrievableEthers])

  return (
    <EthereumSigner
      onBack={onBack}
      confirmationText={t`Your ${totalParsedAmount?.toSignificant(6)} ETH transfer is on its way`}
      transactionText={t`${totalParsedAmount?.toSignificant(6)} ETH transfer to your Ethereum wallet`}
      waitingForTx={waitingForTx}
      txHash={txHash ?? undefined}
      error={error ?? undefined}
    >
      <Column gap={26}>
        {(currentUser?.retrievableEthers ?? []).map((retrievableEther: any, index: number) => (
          <RetrievableWrapper key={`retrievable-ether-${index}`}>
            <Column gap={8}>
              <TYPE.body>
                <Trans>Amount to transfer</Trans>
              </TYPE.body>

              <Row gap={12}>
                <TYPE.medium>{parsedAmounts[index]?.toSignificant(6) ?? 0} ETH</TYPE.medium>
                <TYPE.medium color="text2">{weiAmountToEURValue(parsedAmounts[index]) ?? 0}€</TYPE.medium>
              </Row>
            </Column>

            <RetrievableAddress
              target="_blank"
              href={`${CHAINS[desiredChainId].explorerBaseUrl}/address/${retrievableEther.l1Recipient}`}
            >
              <TYPE.body>
                {retrievableEther.l1Recipient.substring(0, 5)}...
                {retrievableEther.l1Recipient.substring(retrievableEther.l1Recipient.length - 4)}
              </TYPE.body>

              <ExternalLinkIcon />
            </RetrievableAddress>
          </RetrievableWrapper>
        ))}

        <Metamask>
          <PrimaryButton onClick={onRetrieve} large>
            <Trans>Validate all</Trans>
          </PrimaryButton>
        </Metamask>
      </Column>
    </EthereumSigner>
  )
}

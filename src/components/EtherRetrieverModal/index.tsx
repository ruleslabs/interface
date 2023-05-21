import JSBI from 'jsbi'
import { useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'

import ClassicModal, { ModalBody, ModalContent } from '@/components/Modal/Classic'
import { ModalHeader } from '@/components/Modal'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Metamask from '@/components/Metamask'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import EthereumSigner from '@/components/EthereumSigner'
import { useEthereumMulticallContract, useEthereumStarkgateContract } from '@/hooks/useContract'
import Link from '@/components/Link'
import { desiredChainId } from '@/constants/connectors'
import { CHAINS } from '@/constants/networks'
import { useRetrieveEtherMutation } from '@/state/wallet/hooks'
import { useModalOpened, useRetrieveEthersModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import LongHex from '@/components/Text/LongHex'
import Subtitle from '@/components/Text/Subtitle'
import Divider from '@/components/Divider'

import ExternalLinkIcon from '@/images/external-link.svg'
import useCurrentUser from '@/hooks/useCurrentUser'

const RetrievableWrapper = styled(Column)`
  width: 100%;
  padding: 12px 20px;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 3px;
  gap: 16px;
`

const SeeOnEtherscanWrapper = styled(RowCenter)`
  gap: 4px;

  & svg {
    width: 16px;
    height: 16px;
    fill: ${({ theme }) => theme.text2};
  }

  & div {
    white-space: nowrap;
  }
`

export default function EtherRetrieveModal() {
  // current user
  const { currentUser, setCurrentUser } = useCurrentUser()

  // modal
  const toggleRetrieveEthersModal = useRetrieveEthersModalToggle()
  const isOpen = useModalOpened(ApplicationModal.RETRIEVE_ETHERS)

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
            .then(() =>
              setCurrentUser((currentUser) => {
                if (!currentUser) return
                currentUser.retrievableEthers = []
              })
            )
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
    <ClassicModal isOpen={isOpen} onDismiss={toggleRetrieveEthersModal}>
      <ModalContent>
        <ModalHeader title={t`ETH retrieve`} onDismiss={toggleRetrieveEthersModal} />

        <ModalBody>
          <EthereumSigner
            confirmationText={t`Your ETH transfer is on its way`}
            transactionText={t`${totalParsedAmount?.toSignificant(6)} ETH transfer to your Ethereum wallet`}
            waitingForTx={waitingForTx}
            txHash={txHash ?? undefined}
            error={error ?? undefined}
          >
            <Column gap={24}>
              {(currentUser?.retrievableEthers ?? []).map((retrievableEther: any, index: number) => (
                <RetrievableWrapper key={`retrievable-ether-${index}`}>
                  <Column gap={8}>
                    <Subtitle value={t`Recipient`} />

                    <Column gap={8}>
                      <LongHex value={retrievableEther.l1Recipient} />

                      <Link
                        target="_blank"
                        href={`${CHAINS[desiredChainId].explorerBaseUrl}/address/${retrievableEther.l1Recipient}`}
                      >
                        <SeeOnEtherscanWrapper>
                          <TYPE.subtitle clickable>
                            <Trans>See on Etherscan</Trans>
                          </TYPE.subtitle>

                          <ExternalLinkIcon />
                        </SeeOnEtherscanWrapper>
                      </Link>
                    </Column>
                  </Column>

                  <Divider />

                  <RowCenter gap={8}>
                    <TYPE.medium color="primary1">+ {parsedAmounts[index]?.toSignificant(6) ?? 0} ETH</TYPE.medium>
                    <TYPE.body color="text2">{weiAmountToEURValue(parsedAmounts[index]) ?? 0}€</TYPE.body>
                  </RowCenter>
                </RetrievableWrapper>
              ))}

              <Metamask>
                <PrimaryButton onClick={onRetrieve} large>
                  <Trans>Validate all</Trans>
                </PrimaryButton>
              </Metamask>
            </Column>
          </EthereumSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

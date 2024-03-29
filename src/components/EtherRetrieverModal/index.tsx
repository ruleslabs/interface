import { ApolloError } from '@apollo/client'
import { t, Trans } from '@lingui/macro'
import { addr, WeiAmount } from '@rulesorg/sdk-core'
import JSBI from 'jsbi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from 'src/components/Button'
import Column from 'src/components/Column'
import Divider from 'src/components/Divider'
import EthereumSigner from 'src/components/EthereumSigner'
import Link from 'src/components/Link'
import { ModalHeader } from 'src/components/Modal'
import ClassicModal, { ModalBody, ModalContent } from 'src/components/Modal/Classic'
import { RowCenter } from 'src/components/Row'
import LongString from 'src/components/Text/LongString'
import Subtitle from 'src/components/Text/Subtitle'
import { EthereumStatus } from 'src/components/Web3Status'
import { getChainInfo } from 'src/constants/chainInfo'
import { useEthereumMulticallContract, useEthereumStarkgateContract } from 'src/hooks/useContract'
import useCurrentUser from 'src/hooks/useCurrentUser'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { ReactComponent as ExternalLinkIcon } from 'src/images/external-link.svg'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { ApplicationModal } from 'src/state/application/actions'
import { useModalOpened, useRetrieveEthersModalToggle } from 'src/state/application/hooks'
import { useRetrieveEtherMutation } from 'src/state/wallet/hooks'
import { TYPE } from 'src/styles/theme'
import styled from 'styled-components/macro'

const RetrievableWrapper = styled(Column)`
  width: 100%;
  padding: 12px 20px;
  background: ${({ theme }) => theme.bg3}40;
  border: 1px solid ${({ theme }) => theme.bg3}80;
  border-radius: 6px;
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
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [waitingForTx, setWaitingForTx] = useState(false)

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
        addr.checksum(retrievableEther.l1Recipient),
      ]),
    }))

    estimate(args, {})
      .then((estimatedGasLimit) =>
        method(args, { gasLimit: estimatedGasLimit }).then((response: any) => {
          setTxHash(response.hash)

          retrieveEtherMutation({ variables: { hash: response.hash } })
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
  }, [ethereumMulticallContract, ethereumStarkgateContract])

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setTxHash(null)
      setWaitingForTx(false)
    }
  }, [isOpen])

  return (
    <ClassicModal isOpen={isOpen} onDismiss={toggleRetrieveEthersModal}>
      <ModalContent>
        <ModalHeader title={t`ETH retrieve`} onDismiss={toggleRetrieveEthersModal} />

        <ModalBody>
          <EthereumSigner
            confirmationText={t`Your ETH transfer is on its way`}
            transactionDesc={t`${totalParsedAmount?.toSignificant(6)} ETH transfer to your Ethereum wallet`}
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
                      <LongString value={retrievableEther.l1Recipient} copiable />

                      <Link
                        target="_blank"
                        href={`${getChainInfo(rulesSdk.networkInfos.ethereumChainId)?.explorer}/address/${
                          retrievableEther.l1Recipient
                        }`}
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

              <EthereumStatus>
                <PrimaryButton onClick={onRetrieve} large>
                  <Trans>Validate all</Trans>
                </PrimaryButton>
              </EthereumStatus>
            </Column>
          </EthereumSigner>
        </ModalBody>
      </ModalContent>
    </ClassicModal>
  )
}

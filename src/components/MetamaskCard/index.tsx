import { useEffect } from 'react'
import { metaMaskHooks, metaMask, desiredChainId } from '@/constants/connectors'
import { TYPE } from '@/styles/theme'

const { useAccount, useChainId } = metaMaskHooks

export default function MetamaskCard() {
  const account = useAccount()
  const chainId = useChainId()

  // attempt to connect eagerly on mount
  useEffect(() => {
    metaMask.connectEagerly()
  }, [])

  return (
    <>
      {account && chainId === desiredChainId ? (
        <TYPE.body clickable>Deposit from external wallet</TYPE.body>
      ) : (
        <TYPE.body onClick={() => metaMask.activate(desiredChainId)} clickable>
          {account ? 'Switch network' : 'Connect to Metamask'}
        </TYPE.body>
      )}
    </>
  )
}

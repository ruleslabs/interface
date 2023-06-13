import React from 'react'

import Confirmation from './Confirmation'

interface EthereumSignerProps extends React.HTMLAttributes<HTMLDivElement> {
  confirmationText: string
  transactionDesc: string
  waitingForTx: boolean
  txHash?: string
  error?: string
}

export default function EthereumSigner({
  children,
  confirmationText,
  transactionDesc,
  waitingForTx,
  txHash,
  error,
}: EthereumSignerProps) {
  return (
    <>
      {txHash || waitingForTx ? (
        <Confirmation
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          confirmationText={confirmationText}
          transactionDesc={transactionDesc}
        />
      ) : (
        children
      )}
    </>
  )
}

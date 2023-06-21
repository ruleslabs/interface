import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components/macro'
import { sign } from '@rulesorg/sdk-core'

import { Signature } from 'src/graphql/data/__generated__/types-and-hooks'
import PrivateKeyDecipherForm from '../PrivateKeyDecipherForm'
import useStarknetMessages from 'src/hooks/useStarknetMessages'
import { StxAction } from 'src/types/starknetTx'
import Error from '../Error'
import { PaginationSpinner } from 'src/components/Spinner'
import { useMaintenance, useNeedsSignerEscape } from 'src/hooks/useCurrentUser'
import Confirmation from './Confirmation'
import { ec, encode } from 'starknet'
import SignerEscape from 'src/components/LockedWallet/SignerEscape'
import Maintenance from 'src/components/LockedWallet/Maintenance'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

interface StarknetSignerProps {
  children?: React.ReactNode
  action: StxAction
  onSignature: (signatures: Signature[], fullPublicKey: string) => Promise<{ success: boolean }>
  error?: string | null
}

export default function StarknetSigner({ children, action, onSignature, error }: StarknetSignerProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // current user
  const needsSignerEscape = useNeedsSignerEscape()
  const maintenance = useMaintenance()

  // starknet state
  const { signing, messages } = useStarknetMessages()

  // starknet account
  const signMessages = useCallback(
    async (pk: string) => {
      setLoading(true)

      const ret = await onSignature(
        messages.map((hash) => sign.signHash(hash, pk)),
        encode.buf2hex(ec.starkCurve.getPublicKey(pk))
      )
      setSuccess(ret.success)
      setLoading(false)
    },
    [messages.length]
  )

  const modalContent = useMemo(() => {
    if (maintenance) {
      return <Maintenance />
    }

    if (success) {
      return <Confirmation action={action} />
    }

    if (needsSignerEscape) {
      return <SignerEscape />
    }

    if (!signing) {
      return children
    }

    if (error) {
      return <Error error={error} />
    }

    if (loading) {
      return <PaginationSpinner loading={true} />
    }

    return <PrivateKeyDecipherForm onPrivateKeyDeciphered={signMessages} />
  }, [action, signing, loading, error, signMessages, children, needsSignerEscape, maintenance, success])

  return (
    <>
      <DummyFocusInput type="text" />

      {modalContent}
    </>
  )
}

import 'moment/locale/fr'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { Plural, Trans } from '@lingui/macro'

import useCurrentUser from 'src/hooks/useCurrentUser'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton } from 'src/components/Button'
import Placeholder from 'src/components/Placeholder'
import PackPurchaseModal from 'src/components/PackPurchaseModal'
import { usePackPurchaseModalToggle } from 'src/state/application/hooks'
import InputStepCounter from 'src/components/Input/StepCounter'
import { useAuthModalToggle } from 'src/state/application/hooks'
import { useSetAuthMode } from 'src/state/auth/hooks'
import { AuthMode } from 'src/state/auth/actions'
import useFormatedDate from 'src/hooks/useFormatedDate'

interface PackBreakdownProps {
  name: string
  id: string
  season: number
  cardsPerPack: number
  price?: number
  releaseDate?: Date
  availableQuantity?: number
  soldout?: boolean
  onSuccessfulPackPurchase: (boughtQuantity: number) => void
}

export default function PackBreakdown({
  name,
  id,
  season,
  cardsPerPack,
  price,
  releaseDate,
  availableQuantity,
  soldout,
  onSuccessfulPackPurchase,
}: PackBreakdownProps) {
  const { currentUser } = useCurrentUser()

  // modal
  const togglePackPurchaseModal = usePackPurchaseModalToggle()

  const toggleAuthModal = useAuthModalToggle()
  const setAuthMode = useSetAuthMode()

  const toggleSignUpModal = useCallback(() => {
    setAuthMode(AuthMode.SIGN_UP)
    toggleAuthModal()
  }, [toggleAuthModal, setAuthMode])

  const handlePackPurchase = useCallback(() => {
    if (currentUser) togglePackPurchaseModal()
    else toggleSignUpModal()
  }, [!!currentUser, togglePackPurchaseModal, toggleSignUpModal])

  // release
  const releaseDateFormatted = useFormatedDate(releaseDate)
  const released = useMemo(() => (releaseDate ? new Date().getTime() >= releaseDate.getTime() : true), [releaseDate])

  // quantity
  const [quantity, setQuantity] = useState(1)
  const incrementQuantity = useCallback(() => setQuantity(quantity + 1), [quantity, setQuantity])
  const decrementQuantity = useCallback(() => setQuantity(quantity - 1), [quantity, setQuantity])

  useEffect(() => {
    if (availableQuantity && quantity > availableQuantity) setQuantity(availableQuantity)
  }, [availableQuantity, quantity, setQuantity])

  const actionComponent = useMemo(() => {
    if (!price) {
      return (
        <Placeholder>
          <Trans>Not in sale</Trans>
        </Placeholder>
      )
    }

    if (released && availableQuantity) {
      return (
        <Column gap={16}>
          <InputStepCounter
            value={quantity}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            min={1}
            max={availableQuantity}
          />
          <PrimaryButton onClick={handlePackPurchase} large>
            <Trans>Buy - {((price * quantity) / 100).toFixed(2)}€</Trans>
          </PrimaryButton>
        </Column>
      )
    }

    if (soldout) {
      return (
        <Placeholder>
          <Trans>Soldout</Trans>
        </Placeholder>
      )
    }

    if (!released) {
      return (
        <Placeholder>
          <Trans>On sale {releaseDateFormatted}</Trans>
        </Placeholder>
      )
    }

    return (
      <Placeholder>
        <Trans>Already bought</Trans>
      </Placeholder>
    )
  }, [
    released,
    availableQuantity,
    quantity,
    incrementQuantity,
    decrementQuantity,
    handlePackPurchase,
    price,
    releaseDateFormatted,
    soldout,
  ])

  return (
    <>
      <Column gap={28}>
        <Column gap={8}>
          <TYPE.body fontWeight={700} fontSize={28}>
            <Trans id={name}>{name}</Trans>
          </TYPE.body>
          <TYPE.body>
            <Trans>Season {season}</Trans>
          </TYPE.body>
          <TYPE.body>
            <Plural value={cardsPerPack} _1="Includes {cardsPerPack} card" other="Includes {cardsPerPack} cards" />
          </TYPE.body>
        </Column>

        {actionComponent}
      </Column>

      {price && (
        <PackPurchaseModal
          price={price}
          quantity={quantity}
          onSuccessfulPackPurchase={onSuccessfulPackPurchase}
          packId={id}
          packName={name}
        />
      )}
    </>
  )
}

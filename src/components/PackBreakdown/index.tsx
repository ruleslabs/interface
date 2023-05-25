import 'moment/locale/fr'

import { useCallback, useState, useEffect } from 'react'
import { Plural, Trans, t } from '@lingui/macro'
import { Trans as TransReact } from '@lingui/react'

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
  seasons: number[]
  cardsPerPack: number
  price: number
  releaseDate?: Date
  availableSupply?: number
  availableQuantity?: number
  onSuccessfulPackPurchase: (boughtQuantity: number) => void
}

export default function PackBreakdown({
  name,
  id,
  seasons,
  cardsPerPack,
  price,
  releaseDate,
  availableSupply,
  availableQuantity,
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
  const released = releaseDate ? +releaseDate - +new Date() <= 0 : true

  // quantity
  const [quantity, setQuantity] = useState(1)
  const incrementQuantity = useCallback(() => setQuantity(quantity + 1), [quantity, setQuantity])
  const decrementQuantity = useCallback(() => setQuantity(quantity - 1), [quantity, setQuantity])

  useEffect(() => {
    if (availableQuantity && quantity > availableQuantity) setQuantity(availableQuantity)
  }, [availableQuantity, quantity, setQuantity])

  return (
    <>
      <Column gap={28}>
        <Column gap={8}>
          <TYPE.body fontWeight={700} fontSize={28}>
            <Trans id={name}>{name}</Trans>
          </TYPE.body>
          <TYPE.body>
            <Plural value={seasons.length} _1="Season" other="Seasons" />
            {seasons.map((season, index) => `${index > 0 ? ', ' : ' '}${season}`)}
          </TYPE.body>
          <TYPE.body>
            <Plural value={cardsPerPack} _1="Includes {cardsPerPack} card" other="Includes {cardsPerPack} cards" />
          </TYPE.body>
        </Column>

        {released && (availableSupply === undefined || availableSupply > 0) && availableQuantity ? (
          <Column gap={12}>
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
        ) : (
          <Placeholder>
            {released ? (availableQuantity ? t`Sold out` : t`Already bought`) : t`On sale ${releaseDateFormatted}`}
          </Placeholder>
        )}
      </Column>
      <TransReact
        id={name}
        render={({ translation }) => (
          <PackPurchaseModal
            price={price}
            quantity={quantity}
            onSuccessfulPackPurchase={onSuccessfulPackPurchase}
            packId={id}
            packName={typeof translation === 'string' ? translation : ''}
          />
        )}
      />
    </>
  )
}

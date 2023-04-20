import 'moment/locale/fr'

import { useMemo, useCallback, useState, useEffect } from 'react'
import moment from 'moment'
import { Plural, Trans, t } from '@lingui/macro'

import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import Placeholder from '@/components/Placeholder'
import PackPurchaseModal from '@/components/PackPurchaseModal'
import { usePackPurchaseModalToggle } from '@/state/application/hooks'
import InputStepCounter from '@/components/Input/StepCounter'
import { useActiveLocale } from '@/hooks/useActiveLocale'
import { useAuthModalToggle } from '@/state/application/hooks'
import { useSetAuthMode } from '@/state/auth/hooks'
import { AuthMode } from '@/state/auth/actions'
import useFormatedDate from '@/hooks/useFormatedDate'

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
  const currentUser = useCurrentUser()

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
          <Trans
            id={name}
            render={({ translation }) => (
              <TYPE.body fontWeight={700} fontSize={28}>
                {translation}
              </TYPE.body>
            )}
          />
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
      <Trans
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

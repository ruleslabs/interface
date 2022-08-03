import { useCallback } from 'react'
import { authenticator } from 'otplib'

import { useCurrentUser } from '@/state/user/hooks'

export default function useNewTwoFactorAuthSecret() {
  const currentUser = useCurrentUser()

  return useCallback(() => {
    if (!currentUser) return null

    const secret = authenticator.generateSecret()
    const otpauthUrl = `otpauth://totp/${currentUser.username}?secret=${secret}&issuer=Rules`

    return { raw: secret, url: otpauthUrl }
  }, [currentUser?.username])
}

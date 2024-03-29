import { authenticator } from 'otplib'
import { useCallback } from 'react'
import useCurrentUser from 'src/hooks/useCurrentUser'

export default function useNewTwoFactorAuthSecret() {
  const { currentUser } = useCurrentUser()

  return useCallback(() => {
    if (!currentUser) return null

    const secret = authenticator.generateSecret()
    const otpauthUrl = `otpauth://totp/${currentUser.username}?secret=${secret}&issuer=Rules`

    return { raw: secret, url: otpauthUrl }
  }, [currentUser?.username])
}

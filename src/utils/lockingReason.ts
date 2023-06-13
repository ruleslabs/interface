import { constants } from '@rulesorg/sdk-core'

export function isSoftLockingReason(lockingReason?: constants.StarknetWalletLockingReason) {
  switch (lockingReason) {
    case constants.StarknetWalletLockingReason.MAINTENANCE:
    case undefined:
      return true

    default:
      return false
  }
}

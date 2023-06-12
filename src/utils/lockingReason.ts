import { constants } from '@rulesorg/sdk-core'

export function isSoftLockingReason(lockingReason?: constants.StarknetWalletLockingReason) {
  switch (lockingReason) {
    case constants.StarknetWalletLockingReason.UNDEPLOYED:
    case undefined:
      return true

    default:
      return false
  }
}

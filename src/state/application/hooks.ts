import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { AppState } from '@/state'
import { useAppSelector, useAppDispatch } from '@/state/hooks'
import { setOpenModal, setHomepageTabKey, ApplicationModal, HomepageTabKey } from './actions'

// BLOCK NUMBER

export function useBlockNumber(): number | undefined {
  return useAppSelector((state: AppState) => state.application.blockNumber)
}

export function useEthereumBlockNumber(): number | undefined {
  const { chainId } = useWeb3React()
  return useAppSelector((state: AppState) => state.application.ethereumBlockNumber[chainId ?? -1])
}

// ETHER

export function useEtherPrice(): number | undefined {
  return useAppSelector((state: AppState) => state.application.etherPrice)
}

// HOMEPAGE

export function useHomepageTab(): AppState['application']['homepageTabKey'] {
  return useAppSelector((state: AppState) => state.application.homepageTabKey)
}

export function useSetHomepageTab(): (tabKey: HomepageTabKey) => void {
  const dispatch = useAppDispatch()
  return useCallback((tabKey: HomepageTabKey) => dispatch(setHomepageTabKey({ tabKey })), [dispatch])
}

// MODAL

export function useModalOpen(modal: ApplicationModal | null): boolean {
  const openModal = useAppSelector((state) => state.application.openModal)
  return openModal === modal
}

export function useCloseModal(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal: null })), [dispatch])
}

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal })), [dispatch, modal])
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenModal({ modal: open ? null : modal })), [dispatch, modal, open])
}

export function useSettingsModalToggle(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS)
}

export function useAuthModalToggle(): () => void {
  return useToggleModal(ApplicationModal.AUTH)
}

export function useDeckInsertionModalToggle(): () => void {
  return useToggleModal(ApplicationModal.DECK_INSERTION)
}

export function usePackPurchaseModalToggle(): () => void {
  return useToggleModal(ApplicationModal.PACK_PURCHASE)
}

export function useNavModalMobileToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV_MOBILE)
}

export function useNavModalUserDesktopToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV_USER_DESKTOP)
}

export function useNavModalUserMobileToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV_USER_MOBILE)
}

export function useWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.WALLET)
}

export function useAvatarEditModalToggle(): () => void {
  return useToggleModal(ApplicationModal.AVATAR_EDIT)
}

export function useOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.OFFER)
}

export function useCreateOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CREATE_OFFER)
}

export function useCancelOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CANCEL_OFFER)
}

export function useAcceptOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.ACCEPT_OFFER)
}

export function useUpgradeWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.UPGRADE_WALLET)
}

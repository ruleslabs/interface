import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'

import { AppState } from 'src/state'
import { useAppSelector, useAppDispatch } from 'src/state/hooks'
import { setOpenedModal, setOpenedSidebarModal, ApplicationModal, ApplicationSidebarModal } from './actions'

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

// MODAL

// GETTERS

export function useModalOpened(modal: ApplicationModal | ApplicationSidebarModal): boolean {
  const openedModal = useAppSelector((state) => state.application.openedModal)
  return openedModal === modal
}

export function useSidebarModalOpened(modal: ApplicationSidebarModal): boolean {
  const openedSidebarModal = useAppSelector((state) => state.application.openedSidebarModal)
  return openedSidebarModal === modal
}

// OPEN

export function useOpenModal(modal: ApplicationModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedModal({ modal })), [dispatch, modal])
}

export function useOpenSidebarModal(modal: ApplicationSidebarModal): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedSidebarModal({ modal })), [dispatch, modal])
}

// CLOSE

export function useCloseModal(): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => {
    dispatch(setOpenedModal({ modal: null }))
    dispatch(setOpenedSidebarModal({ modal: null }))
  }, [dispatch])
}

// TOGGLE

export function useToggleModal(modal: ApplicationModal): () => void {
  const isOpen = useModalOpened(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedModal({ modal: isOpen ? null : modal })), [dispatch, modal, isOpen])
}

export function useToggleSidebarModal(modal: ApplicationSidebarModal): () => void {
  const isOpen = useSidebarModalOpened(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedSidebarModal({ modal: isOpen ? null : modal })), [dispatch, modal, isOpen])
}

// CLASSIC

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

export function useNavModalUserDesktopToggle(): () => void {
  return useToggleModal(ApplicationModal.NAV_USER_DESKTOP)
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

export function useCancelListingModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CANCEL_LISTING)
}

export function useAcceptOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.ACCEPT_OFFER)
}

export function useUpgradeWalletModalToggle(): () => void {
  return useToggleModal(ApplicationModal.UPGRADE_WALLET)
}

export function useFiltersModalToggle(): () => void {
  return useToggleModal(ApplicationModal.FILTERS)
}

export function useStarknetAccountPrivateKeyModalToggle(): () => void {
  return useToggleModal(ApplicationModal.STARKNET_ACCOUNT_PRIVATE_KEY)
}

export function useRetrieveEthersModalToggle(): () => void {
  return useToggleModal(ApplicationModal.RETRIEVE_ETHERS)
}

export function useLiveRewardDetailsModalToggle(): () => void {
  return useToggleModal(ApplicationModal.LIVE_REWARD_DETAILS)
}

export function useLiveRewardTicketModalToggle(): () => void {
  return useToggleModal(ApplicationModal.LIVE_REWARD_TICKET)
}

export function useClaimLiveRewardModalToggle(): () => void {
  return useToggleModal(ApplicationModal.CLAIM_LIVE_REWARD)
}

// SIDEBAR

export function useNotificationsModalToggle(): () => void {
  return useToggleSidebarModal(ApplicationSidebarModal.NOTIFICATIONS)
}

export function useNavModalMobileToggle(): () => void {
  return useToggleSidebarModal(ApplicationSidebarModal.NAV_MOBILE)
}

export function useNavModalUserMobileToggle(): () => void {
  return useToggleSidebarModal(ApplicationSidebarModal.NAV_USER_MOBILE)
}

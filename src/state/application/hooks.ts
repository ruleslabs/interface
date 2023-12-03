import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { AppState } from 'src/state'
import { useAppDispatch, useAppSelector } from 'src/state/hooks'

import {
  ApplicationModal,
  ApplicationSidebarModal,
  setOpenedModal,
  setOpenedSidebarModal,
  setOpenedWalletConnectModal,
  WalletConnectModal,
} from './actions'

// BLOCKS

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

export function useWalletConnectModalOpened(modal: WalletConnectModal): boolean {
  const openedWalletConnectModal = useAppSelector((state) => state.application.openedWalletConnectModal)
  return openedWalletConnectModal === modal
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

function useToggleModal(modal: ApplicationModal): () => void {
  const isOpen = useModalOpened(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedModal({ modal: isOpen ? null : modal })), [dispatch, modal, isOpen])
}

function useToggleSidebarModal(modal: ApplicationSidebarModal): () => void {
  const isOpen = useSidebarModalOpened(modal)
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(setOpenedSidebarModal({ modal: isOpen ? null : modal })), [dispatch, modal, isOpen])
}

function useToggleWalletConnectModal(modal: WalletConnectModal): () => void {
  const isOpen = useWalletConnectModalOpened(modal)
  const dispatch = useAppDispatch()
  return useCallback(
    () => dispatch(setOpenedWalletConnectModal({ modal: isOpen ? null : modal })),
    [dispatch, modal, isOpen]
  )
}

// CLASSIC

export function useAuthModalToggle(): () => void {
  return useToggleModal(ApplicationModal.AUTH)
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

export function useMigrateCollectionModalToggle(): () => void {
  return useToggleModal(ApplicationModal.MIGRATE_COLLECTION)
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

export function useOfferModalToggle(): () => void {
  return useToggleModal(ApplicationModal.OFFER)
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

// WALLET CONNECT

export function useEthereumWalletConnectModalToggle(): () => void {
  return useToggleWalletConnectModal(WalletConnectModal.ETHEREUM)
}

export function useStarknetWalletConnectModalToggle(): () => void {
  return useToggleWalletConnectModal(WalletConnectModal.STARKNET)
}

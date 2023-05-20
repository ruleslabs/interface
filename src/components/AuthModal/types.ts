export interface OnSuccessfulConnectionResponse {
  accessToken: string
  closeModal?: boolean
}

export interface AuthFormProps {
  onSuccessfulConnection: (res: OnSuccessfulConnectionResponse) => void
}

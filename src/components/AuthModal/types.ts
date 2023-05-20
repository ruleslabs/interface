export interface OnSuccessfulConnectionResponse {
  accessToken: string
}

export interface AuthFormProps {
  onSuccessfulConnection: (res: OnSuccessfulConnectionResponse) => void
}

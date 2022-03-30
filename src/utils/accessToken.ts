function getAccessTokenLocalstorageKey() {
  const key = process.env.NEXT_PUBLIC_ACCESS_TOKEN_LOCALSTORAGE_KEY
  if (!key) {
    throw new Error("Can't store accessToken: No localStorage key")
  }

  return key
}

export function storeAccessToken(token: string) {
  localStorage.setItem(getAccessTokenLocalstorageKey(), token)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(getAccessTokenLocalstorageKey())
}

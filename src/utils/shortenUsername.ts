import { MAX_SHORT_USERNAME_LENGTH } from 'src/constants/misc'

export default function shortenUsername(username: string) {
  return username.length > MAX_SHORT_USERNAME_LENGTH
    ? `${username.substring(0, MAX_SHORT_USERNAME_LENGTH - 2)}[..]`
    : username
}

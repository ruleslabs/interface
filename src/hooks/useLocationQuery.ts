import { useLocation } from 'react-router-dom'

export default function useLocationQuery() {
  return new URLSearchParams(useLocation().search)
}

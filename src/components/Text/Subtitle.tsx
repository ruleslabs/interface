import { TYPE } from '@/styles/theme'

interface SubtitleProps {
  value: string
}

export default function Subtitle({ value }: SubtitleProps) {
  return <TYPE.medium fontSize={16}>{value}</TYPE.medium>
}

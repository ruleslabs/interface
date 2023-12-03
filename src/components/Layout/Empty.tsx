import Box from 'src/theme/components/Box'

interface EmptyLayoutProps {
  children: React.ReactNode
}

// Avoid margin collapsing
export default function EmptyLayout({ children }: EmptyLayoutProps) {
  return (
    <>
      <Box position="sticky" style={{ height: '1px' }} />
      {children}
    </>
  )
}

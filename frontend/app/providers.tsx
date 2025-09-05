import ReactQueryProvider from './components/ReactQueryProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>
}

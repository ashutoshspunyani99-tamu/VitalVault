'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamic import with SSR disabled
const PrivyProvider = dynamic(() => import('@privy-io/react-auth').then((mod) => mod.PrivyProvider), { ssr: false })

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID
  return (
    clientId &&
    appId && (
      <PrivyProvider
        appId={appId}
        clientId={clientId}
        config={{
          appearance: {
            showWalletLoginFirst: false
          }
        }}
      >
        {children}
      </PrivyProvider>
    )
  )
}

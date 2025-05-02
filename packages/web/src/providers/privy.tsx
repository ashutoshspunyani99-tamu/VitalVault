'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import dynamic from 'next/dynamic'

// export default PrivyProviderWrapper
// import { PrivyProvider } from '@privy-io/react-auth'
// import { useRouter } from 'next/router'

// export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
//   // const appId = process.env.PRIVY_APP_ID

//   //   const router = useRouter()
//   return (
//     <PrivyProvider
//       appId="cma6lio7o01lnjo0nwfxivisi"
//       config={{
//         appearance: {
//           showWalletLoginFirst: false
//         }
//       }}
//     >
//       {children}
//     </PrivyProvider>
//   )
// }

const PrivyProviderWrapper = dynamic(
  () =>
    Promise.resolve(function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
      return (
        <PrivyProvider
          appId="cma6lio7o01lnjo0nwfxivisi"
          config={{
            appearance: {
              showWalletLoginFirst: false
            }
          }}
        >
          {children}
        </PrivyProvider>
      )
    }),
  { ssr: false }
)

export default PrivyProviderWrapper

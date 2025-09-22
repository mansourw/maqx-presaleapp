import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string, // paste in .env.local
      metadata: {
        name: 'MAQX Presale',
        description: 'Presale dApp for MAQX',
        url: 'https://presale.maqx.io',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
  ],
})
'use client';

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { useState } from 'react';

import { config } from '@/config/wagmi';

// Create QueryClient outside component to prevent re-initialization
let queryClientInstance = null;

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
          staleTime: 60 * 1000, // 1 minute
        },
      },
    });
  }
  return queryClientInstance;
}

export default function WalletProvider({ children }) {
    const [queryClient] = useState(() => getQueryClient());
    
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider 
                    theme={lightTheme({
                        accentColor: '#f97316',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                    coolMode={false}
                    modalSize="compact"
                    initialChain={config.chains[0]}
                    showRecentTransactions={true}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

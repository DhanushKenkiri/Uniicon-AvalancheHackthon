import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from '@wagmi/core/chains';

// Get project ID from environment or use default
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0d96c994eeaf761d2d2ac3a07192d980';

export const config = getDefaultConfig({
  appName: 'Uniicon - AI Icon Generator',
  projectId,
  chains: [avalancheFuji],
  ssr: true,
  // Enhanced wallet configurations
  walletConnectProjectId: projectId,
  enableOfficialWallets: true,
  enableWalletConnect: true,
  enableInjectedWalletFallback: true,
});

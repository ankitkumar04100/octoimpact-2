import { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: string | null;
  chainName: string;
  balance: string | null;
  isMetaMask: boolean;
  error: string | null;
}

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum Mainnet',
  '0x5': 'Goerli Testnet',
  '0xaa36a7': 'Sepolia Testnet',
  '0x89': 'Polygon',
  '0x13881': 'Mumbai Testnet',
  '0x539': 'Localhost',
  '0x7a69': 'Hardhat',
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
    chainName: 'Unknown',
    balance: null,
    isMetaMask: false,
    error: null,
  });

  const hasProvider = typeof window !== 'undefined' && !!window.ethereum;

  useEffect(() => {
    if (!hasProvider) return;
    setState(s => ({ ...s, isMetaMask: !!window.ethereum?.isMetaMask }));

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState(s => ({ ...s, connected: false, address: null, balance: null }));
      } else {
        setState(s => ({ ...s, address: accounts[0], connected: true }));
        fetchBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(s => ({ ...s, chainId, chainName: CHAIN_NAMES[chainId] || `Chain ${parseInt(chainId, 16)}` }));
    };

    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum!.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
        window.ethereum!.request({ method: 'eth_chainId' }).then(handleChainChanged);
      }
    });

    return () => {
      window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum!.removeListener('chainChanged', handleChainChanged);
    };
  }, [hasProvider]);

  const fetchBalance = async (addr: string) => {
    if (!window.ethereum) return;
    try {
      const bal = await window.ethereum.request({ method: 'eth_getBalance', params: [addr, 'latest'] });
      const ethBalance = (parseInt(bal, 16) / 1e18).toFixed(4);
      setState(s => ({ ...s, balance: ethBalance }));
    } catch { /* ignore */ }
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState(s => ({ ...s, error: 'MetaMask not detected. Please install MetaMask extension.' }));
      return;
    }
    try {
      setState(s => ({ ...s, error: null }));
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setState(s => ({
        ...s,
        connected: true,
        address: accounts[0],
        chainId,
        chainName: CHAIN_NAMES[chainId] || `Chain ${parseInt(chainId, 16)}`,
      }));
      fetchBalance(accounts[0]);
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || 'Connection rejected' }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(s => ({ ...s, connected: false, address: null, balance: null, chainId: null, chainName: 'Unknown' }));
  }, []);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return { ...state, hasProvider, shortAddress, connect, disconnect };
}

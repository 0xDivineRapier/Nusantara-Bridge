import React, { useEffect, useState, useMemo } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { mainnet, bsc, polygon } from 'viem/chains';
import { Asset, Network } from '../types';
import { NetworkSelector } from './NetworkSelector';

interface WalletOverviewProps {
  initialTotalValueUsd: number;
  initialAssets: Asset[];
  selectedNetwork: Network;
  onNetworkSelect: (network: Network) => void;
  walletAddress: string | null;
}

const getChain = (networkId: string) => {
  switch (networkId) {
    case 'ethereum': return mainnet;
    case 'bsc': return bsc;
    case 'polygon': return polygon;
    default: return mainnet;
  }
};

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  initialTotalValueUsd,
  initialAssets,
  selectedNetwork,
  onNetworkSelect,
  walletAddress
}) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [loading, setLoading] = useState(false);

  // Fetch Real-time Balance for Native Currency
  useEffect(() => {
    if (!walletAddress || !walletAddress.startsWith('0x')) return;

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const client = createPublicClient({
          chain: getChain(selectedNetwork.id),
          transport: http(),
        });

        const balanceBigInt = await client.getBalance({ 
          address: walletAddress as `0x${string}` 
        });
        
        const formattedBalance = formatEther(balanceBigInt);

        setAssets(prevAssets => {
          return prevAssets.map(asset => {
            // Only update the native asset of the selected network
            if (asset.networkId === selectedNetwork.id && asset.symbol === selectedNetwork.nativeCurrency.symbol) {
              const newBalance = parseFloat(formattedBalance).toFixed(4);
              const newValueUsd = parseFloat(newBalance) * asset.priceUsd;
              
              return {
                ...asset,
                balance: newBalance,
                valueUsd: newValueUsd
              };
            }
            return asset;
          });
        });

      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [selectedNetwork, walletAddress]);

  // Recalculate Total Value dynamically
  const totalValueUsd = useMemo(() => {
    return assets.reduce((acc, asset) => acc + asset.valueUsd, 0);
  }, [assets]);

  // Sort assets: assets on the selected network first
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.networkId === selectedNetwork.id && b.networkId !== selectedNetwork.id) return -1;
    if (a.networkId !== selectedNetwork.id && b.networkId === selectedNetwork.id) return 1;
    return b.valueUsd - a.valueUsd;
  });

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 relative overflow-hidden group h-full">
      {/* Background Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl -mr-12 -mt-12 transition-all duration-700 group-hover:bg-indigo-600/20"></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Total Portfolio Value
            </h3>
            <div className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              ${totalValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              {loading && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
            </div>
          </div>

          {/* Mobile/Dashboard Network Selector */}
          <div className="block lg:hidden">
              <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider font-semibold">Active Network</label>
              <NetworkSelector
                  selectedNetwork={selectedNetwork}
                  onSelect={onNetworkSelect}
              />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">My Assets</h4>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {sortedAssets.map((asset) => {
              const isSelectedChain = asset.networkId === selectedNetwork.id;
              const isNative = asset.symbol === selectedNetwork.nativeCurrency.symbol;
              
              return (
                <div 
                  key={`${asset.networkId}-${asset.symbol}`} 
                  className={`flex justify-between items-center text-sm p-3 rounded-lg transition-all border ${isSelectedChain ? 'bg-slate-800/80 border-slate-700 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${asset.networkId === 'ethereum' ? 'bg-purple-500' : asset.networkId === 'bsc' ? 'bg-yellow-500' : 'bg-indigo-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                    <div>
                        <div className={`font-medium ${isSelectedChain ? 'text-white' : 'text-slate-400'}`}>{asset.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{asset.networkId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isSelectedChain ? 'text-white' : 'text-slate-400'}`}>
                      {asset.balance} <span className="text-xs opacity-75">{asset.symbol}</span>
                    </div>
                    <div className="text-slate-600 text-xs">${asset.valueUsd.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

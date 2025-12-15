import React from 'react';
import { Network } from '../types';
import { SUPPORTED_NETWORKS } from '../constants';

interface NetworkSelectorProps {
  selectedNetwork: Network;
  onSelect: (network: Network) => void;
  className?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  selectedNetwork, 
  onSelect,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-1 p-1 bg-slate-900/50 backdrop-blur-md rounded-full border border-slate-800 ${className}`}>
      {SUPPORTED_NETWORKS.map((network) => {
        const isActive = selectedNetwork.id === network.id;
        return (
          <button
            key={network.id}
            onClick={() => onSelect(network)}
            aria-pressed={isActive}
            type="button"
            className={`
              relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ease-out
              ${isActive 
                ? `${network.color} text-white shadow-lg shadow-black/20 ring-1 ring-white/10 scale-105` 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }
            `}
          >
            {network.shortName}
          </button>
        );
      })}
    </div>
  );
};
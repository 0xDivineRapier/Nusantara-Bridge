
import React, { useState, useMemo } from 'react';
import { SwapInterface } from './components/SwapInterface';
import { MarketChart } from './components/Chart';
import { Transaction, BridgeStatus, Network, KYCStatus } from './types';
import { INITIAL_RATES, SUPPORTED_NETWORKS, MOCK_WALLET_ASSETS } from './constants';
import { Landing } from './components/Landing';
import { NetworkSelector } from './components/NetworkSelector';
import { WalletOverview } from './components/WalletOverview';
import { KYCViews } from './components/KYCViews';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [history, setHistory] = useState<Transaction[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(SUPPORTED_NETWORKS[0]);
  
  // KYC State
  const [kycStatus, setKycStatus] = useState<KYCStatus>(KYCStatus.PENDING);
  const [kycRejectReason, setKycRejectReason] = useState<string | undefined>(undefined);

  const handleConnectWallet = () => {
    // Simulate wallet connection with a valid EVM address for Viem compatibility
    // Using a random valid address for demonstration
    setTimeout(() => {
      setWalletConnected(true);
      setWalletAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); // Vitalik's address as placeholder
      
      // On new signup (connect), start at PENDING (or simulate user state fetch)
      setKycStatus(KYCStatus.PENDING);
    }, 800);
  };

  const handleTransactionComplete = (tx: Transaction) => {
    setHistory(prev => [tx, ...prev]);
  };

  const handleKYCStatusChange = (status: KYCStatus, reason?: string) => {
    setKycStatus(status);
    if (reason) setKycRejectReason(reason);
  };

  const ethRate = INITIAL_RATES[0];

  // Calculate Initial Total Asset Value (Fallback)
  const initialTotalValueUsd = useMemo(() => {
    return MOCK_WALLET_ASSETS.reduce((acc, asset) => acc + asset.valueUsd, 0);
  }, []);

  const getStatusColor = (status: BridgeStatus) => {
    switch (status) {
      case BridgeStatus.COMPLETED:
        return 'bg-green-900/30 text-green-400';
      case BridgeStatus.PAYOUT_INITIATED:
        return 'bg-purple-900/30 text-purple-400';
      case BridgeStatus.EXCHANGED:
        return 'bg-indigo-900/30 text-indigo-400';
      case BridgeStatus.DEPOSIT_CONFIRMED:
        return 'bg-blue-900/30 text-blue-400';
      case BridgeStatus.PENDING_DEPOSIT:
        return 'bg-yellow-900/30 text-yellow-400';
      case BridgeStatus.FAILED:
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const isProcessing = (status: BridgeStatus) => {
    return status !== BridgeStatus.COMPLETED && status !== BridgeStatus.FAILED;
  };

  if (view === 'landing') {
    return <Landing onEnterApp={() => setView('dashboard')} />;
  }

  // --- RENDER CONTENT BASED ON AUTH & KYC ---
  
  const renderMainContent = () => {
    // 1. Wallet Not Connected
    if (!walletConnected) {
       return (
         <div className="col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 relative overflow-hidden h-full flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                  <h3 className="text-slate-400 text-sm font-medium">ETH/IDR Price (Indodax)</h3>
                  <div className="flex items-end mt-2">
                    <span className="text-3xl font-bold text-white">
                      {ethRate.price.toLocaleString('id-ID')}
                    </span>
                    <span className="ml-3 text-sm font-medium text-emerald-400 mb-1 bg-emerald-400/10 px-2 py-0.5 rounded">
                      +{ethRate.change24h}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Updated: Just now</p>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 md:col-span-2 relative min-h-[300px]">
                   <h3 className="text-slate-400 text-sm font-medium mb-4 absolute top-6 left-6 z-10">Market Trend (24H)</h3>
                   <MarketChart />
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center flex flex-col items-center justify-center min-h-[400px]">
               <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Wallet Disconnected</h3>
               <p className="text-slate-400 mb-6 max-w-xs">Connect your Ethereum wallet using Viem to start bridging assets securely.</p>
               <button 
                onClick={handleConnectWallet}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
               >
                 Connect Wallet
               </button>
            </div>
         </div>
       );
    }

    // 2. Wallet Connected BUT KYC Not Verified
    if (kycStatus !== KYCStatus.VERIFIED) {
      return (
        <div className="col-span-12">
          <KYCViews 
            status={kycStatus} 
            onStatusChange={handleKYCStatusChange}
            walletAddress={walletAddress!}
          />
        </div>
      );
    }

    // 3. Wallet Connected AND Verified (Dashboard)
    return (
      <div className="col-span-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <WalletOverview 
              initialTotalValueUsd={initialTotalValueUsd}
              initialAssets={MOCK_WALLET_ASSETS}
              selectedNetwork={selectedNetwork}
              onNetworkSelect={setSelectedNetwork}
              walletAddress={walletAddress}
           />
           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 md:col-span-2 relative min-h-[300px]">
             <h3 className="text-slate-400 text-sm font-medium mb-4 absolute top-6 left-6 z-10">Market Trend (24H)</h3>
             <MarketChart />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Swap Interface */}
          <div className="lg:col-span-5">
            <SwapInterface 
              onTransactionComplete={handleTransactionComplete} 
              selectedNetwork={selectedNetwork}
            />
          </div>

          {/* History & Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">Recent Transactions</h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Real-time</span>
              </div>
              {history.length === 0 ? (
                 <div className="p-12 text-center text-slate-500">
                    No transactions yet. Start bridging to see history.
                 </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-950/50 text-xs uppercase font-medium">
                      <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">In ({selectedNetwork.nativeCurrency.symbol})</th>
                        <th className="px-6 py-4">Out (IDR)</th>
                        <th className="px-6 py-4">Ref ID</th>
                        <th className="px-6 py-4 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {history.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                              {isProcessing(tx.status) && (
                                <span className="w-1.5 h-1.5 bg-current opacity-75 rounded-full mr-1.5 animate-pulse"></span>
                              )}
                              {tx.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-medium">
                            {tx.usdcAmount}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {tx.idrAmount ? `Rp ${parseFloat(tx.idrAmount).toLocaleString('id-ID', { maximumFractionDigits: 0 })}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                             {tx.xenditPayoutId || '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-xs">
                            {tx.createdAt.toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-red-600/5 rounded-bl-full transition-transform group-hover:scale-150 duration-500"></div>
                  <h4 className="text-slate-300 font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure & Private
                  </h4>
                  <p className="text-sm text-slate-500 relative z-10">Powered by Xendit's enterprise-grade disbursement API.</p>
               </div>
               <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/5 rounded-bl-full transition-transform group-hover:scale-150 duration-500"></div>
                  <h4 className="text-slate-300 font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Warung Liquidity
                  </h4>
                  <p className="text-sm text-slate-500 relative z-10">Factoring services for verified merchants.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
              <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-red-800 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-red-900/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Nusantara Bridge
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {walletConnected && (
                <>
                  <div className="hidden lg:block">
                    <NetworkSelector 
                      selectedNetwork={selectedNetwork} 
                      onSelect={setSelectedNetwork} 
                    />
                  </div>
                  {/* Verification Badge */}
                  {kycStatus === KYCStatus.VERIFIED && (
                    <div className="hidden md:flex items-center gap-1 bg-green-900/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold border border-green-900/30">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      Verified
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleConnectWallet}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  walletConnected 
                    ? "bg-slate-800 text-red-400 border border-red-500/30" 
                    : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
              >
                {walletConnected ? `${walletAddress?.substring(0,6)}...${walletAddress?.substring(38)}` : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
           {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

import React from 'react';
import { Button } from './Button';
import { SUPPORTED_BANKS } from '../constants';

interface LandingProps {
  onEnterApp: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-nusantara-red selection:text-white">
      
      {/* Navbar - Landing Version */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-nusantara-red to-red-800 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20 transform rotate-3">
                 {/* Stylized Garuda/Bird Wing Abstract */}
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Nusantara Bridge
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-nusantara-red font-semibold">Gateway Indonesia</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Fitur</a>
              <a href="#banks" className="hover:text-white transition-colors">Bank</a>
              <a href="#security" className="hover:text-white transition-colors">Keamanan</a>
              <Button onClick={onEnterApp} variant="primary" className="bg-red-600 hover:bg-red-500 shadow-red-900/20">
                Launch App
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-batik-pattern">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 text-xs text-nusantara-gold font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live on Ethereum Mainnet & Xendit
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Jembatan Aset Digital <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-nusantara-red to-white">
              Untuk Indonesia
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert Ethereum & USDC to Rupiah instantly directly to your local bank account. 
            Powered by reliable enterprise infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onEnterApp}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-lg shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Mulai Sekarang
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg border border-slate-700 transition-all">
              Documentation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-slate-800/50 pt-12">
             <div>
               <div className="text-3xl font-bold text-white">2.5s</div>
               <div className="text-sm text-slate-500">Transaction Time</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-white">100%</div>
               <div className="text-sm text-slate-500">Succes Rate</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-white">0.5%</div>
               <div className="text-sm text-slate-500">Low Fee</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-white">24/7</div>
               <div className="text-sm text-slate-500">Automated</div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Infrastruktur Kelas Dunia</h2>
            <p className="text-slate-400">Built with the best technology stack for speed and compliance.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-red-900/50 transition-colors">
              <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Settlement</h3>
              <p className="text-slate-400 leading-relaxed">
                Using Xendit's disbursement API, funds arrive in your BCA, Mandiri, or BNI account in seconds.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-red-900/50 transition-colors">
              <div className="w-12 h-12 bg-orange-900/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Best Market Rates</h3>
              <p className="text-slate-400 leading-relaxed">
                Direct integration with Indodax ensures you get high-liquidity IDR rates without hidden markups.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-red-900/50 transition-colors">
              <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Non-Custodial</h3>
              <p className="text-slate-400 leading-relaxed">
                We don't hold your funds. Smart contracts automate the flow from your wallet to the exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banks Marquee */}
      <section id="banks" className="py-16 border-y border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Supported Local Banks</p>
           <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {SUPPORTED_BANKS.map((bank) => (
                <div key={bank.code} className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-8 bg-slate-700 rounded-full"></span>
                  {bank.name}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm text-center">
        <div className="max-w-7xl mx-auto px-4">
           <p>&copy; 2024 Nusantara Bridge. All rights reserved.</p>
           <p className="mt-2">Made with ❤️ in Jakarta.</p>
        </div>
      </footer>
    </div>
  );
};
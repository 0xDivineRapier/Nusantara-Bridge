
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { parseUnits } from 'viem';
import { Currency, Transaction, Network, Exchange, ExchangeId } from '../types';
import { INITIAL_RATES, SUPPORTED_BANKS, SUPPORTED_EXCHANGES, MOCK_WALLET_ASSETS } from '../constants';
import { createBridgeTransaction } from '../services/mockBackend';
import { getMarketInsight } from '../services/geminiService';
import { Button } from './Button';

// Zod Schema for Validation
const swapSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .regex(/^\d*\.?\d*$/, "Must be a valid number")
    .refine((val) => {
      try {
        return parseFloat(val) > 0;
      } catch {
        return false;
      }
    }, "Amount must be positive"),
  bank: z.string().min(1, "Please select a bank"),
  accountNumber: z.string().min(5, "Account number too short").regex(/^\d+$/, "Must be numeric"),
  exchangeId: z.string().min(1, "Please select an exchange"),
});

interface SwapInterfaceProps {
  onTransactionComplete: (tx: Transaction) => void;
  selectedNetwork: Network;
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({ onTransactionComplete, selectedNetwork }) => {
  const [formData, setFormData] = useState({
    amount: '',
    bank: '',
    accountNumber: '',
    exchangeId: 'indodax'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Dynamic currency based on network
  const currencySymbol = selectedNetwork.nativeCurrency.symbol;
  
  // Find balance for this network's native asset
  const networkBalance = useMemo(() => {
     const asset = MOCK_WALLET_ASSETS.find(
        a => a.networkId === selectedNetwork.id && a.symbol === currencySymbol
     );
     return asset ? asset.balance : '0.00';
  }, [selectedNetwork, currencySymbol]);

  // Derived state using BigInt math
  const currentRate = useMemo(() => {
    // Find rate matching symbol/IDR, e.g. "ETH/IDR" or "BNB/IDR"
    const rateObj = INITIAL_RATES.find(r => r.pair === `${currencySymbol}/IDR`);
    return rateObj?.price || 42000000; // Fallback
  }, [currencySymbol]);
  
  const { grossIdr, fee, netIdr, amountValid } = useMemo(() => {
    try {
      if (!formData.amount || isNaN(Number(formData.amount))) {
        throw new Error("Invalid input");
      }

      // 1 Unit = 1e18 Wei
      const amountBN = parseUnits(formData.amount, 18);
      
      // Rate is integer IDR per 1 Unit
      const rateBN = BigInt(Math.floor(currentRate));
      
      // Gross IDR = (AmountInWei * Rate) / 1e18
      const grossIdrBN = (amountBN * rateBN) / BigInt(1e18);
      
      // Fee = 0.5% (50 Basis Points)
      // Fee = Gross * 50 / 10000
      const feeBN = (grossIdrBN * 50n) / 10000n;
      
      const netIdrBN = grossIdrBN - feeBN;

      return {
        grossIdr: grossIdrBN,
        fee: feeBN,
        netIdr: netIdrBN,
        amountValid: true
      };
    } catch (e) {
      return {
        grossIdr: 0n,
        fee: 0n,
        netIdr: 0n,
        amountValid: false
      };
    }
  }, [formData.amount, currentRate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Prevent multiple decimals for amount
    if (name === 'amount' && value.split('.').length > 2) return;

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const fetchInsight = useCallback(async () => {
    if (!amountValid || !formData.amount) return;
    setInsightLoading(true);
    const insight = await getMarketInsight(formData.amount, currencySymbol, currentRate);
    setAiInsight(insight);
    setInsightLoading(false);
  }, [amountValid, formData.amount, currentRate, currencySymbol]);

  // Debounce AI insight fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amountValid) fetchInsight();
    }, 1000);
    return () => clearTimeout(timer);
  }, [amountValid, fetchInsight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = swapSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      // Simulate Backend Call
      const tx = await createBridgeTransaction(
        formData.amount,
        Currency.ETH, // In a real app, map this to dynamic currency
        formData.bank,
        formData.accountNumber,
        currentRate
      );

      onTransactionComplete(tx);
      setFormData({ amount: '', bank: '', accountNumber: '', exchangeId: 'indodax' });
      setAiInsight(null);
    } catch (err) {
      console.error(err);
      setErrors({ form: "Transaction failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const selectedExchange = SUPPORTED_EXCHANGES.find(e => e.id === formData.exchangeId);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className={`bg-${selectedNetwork.color.replace('bg-', '')} w-2 h-6 rounded mr-3`}></span>
          Bridge {currencySymbol}
        </h2>
        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
           {selectedNetwork.name}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* From Section */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <label className="block text-sm text-slate-400 mb-2">From (Crypto)</label>
          <div className="flex items-center justify-between">
            <input
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleInputChange}
              className={`bg-transparent text-2xl font-bold text-white focus:outline-none w-full ${errors.amount ? 'text-red-400' : ''}`}
            />
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <div className={`w-6 h-6 ${selectedNetwork.color} rounded-full flex items-center justify-center text-[8px] font-bold`}>{currencySymbol[0]}</div>
              <span className="font-semibold text-white">{currencySymbol}</span>
            </div>
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          <div className="flex justify-between items-center mt-2">
             <div className="text-xs text-slate-500">
                Balance: {networkBalance} {currencySymbol}
             </div>
             <button 
               type="button" 
               onClick={() => setFormData(prev => ({...prev, amount: networkBalance}))}
               className="text-xs text-primary-500 hover:text-primary-400 font-medium"
             >
               MAX
             </button>
          </div>
        </div>

        {/* AI Insight Box */}
        {formData.amount && amountValid && (
          <div className="bg-slate-800/50 border border-indigo-500/30 rounded-lg p-3 text-xs">
            <div className="flex items-center text-indigo-400 mb-1 font-semibold">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gemini Market Analysis
            </div>
            {insightLoading ? (
              <span className="animate-pulse text-slate-500">Analyzing market conditions...</span>
            ) : (
              <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
            )}
          </div>
        )}

        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-slate-700 rounded-full p-2 border-4 border-slate-800">
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* To Section */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <label className="block text-sm text-slate-400 mb-2">To (Fiat Bank Transfer)</label>
          <div className="flex items-center justify-between mb-4">
            <input 
              type="text" 
              disabled
              value={amountValid ? `Rp ${new Intl.NumberFormat('id-ID').format(netIdr)}` : 'Rp 0'}
              className="bg-transparent text-2xl font-bold text-slate-200 focus:outline-none w-full disabled:cursor-not-allowed disabled:opacity-80"
            />
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-[10px]">Rp</div>
              <span className="font-semibold text-white">IDR</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             {/* Exchange Selector */}
            <div className="relative">
              <label className="text-xs text-slate-500 mb-1 block">Best Rate From</label>
              <select 
                name="exchangeId" 
                value={formData.exchangeId}
                onChange={handleInputChange}
                className={`w-full bg-slate-800 text-white text-sm rounded-lg p-2.5 border ${errors.exchangeId ? 'border-red-500' : 'border-slate-600'} focus:ring-primary-500 focus:border-primary-500`}
              >
                {SUPPORTED_EXCHANGES.map(ex => (
                  <option key={ex.id} value={ex.id}>
                     {ex.name} {ex.region === 'ID' ? '🇮🇩' : '🌎'} ({ex.trustScore}/10)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <select 
                  name="bank" 
                  value={formData.bank}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 text-white text-sm rounded-lg p-2.5 border ${errors.bank ? 'border-red-500' : 'border-slate-600'} focus:ring-primary-500 focus:border-primary-500`}
                >
                  <option value="">Bank</option>
                  {SUPPORTED_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.code}</option>
                  ))}
                </select>
                {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank}</p>}
              </div>
              <div className="col-span-2">
                <input
                  name="accountNumber"
                  type="text"
                  placeholder="Account Number"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 text-white text-sm rounded-lg p-2.5 border ${errors.accountNumber ? 'border-red-500' : 'border-slate-600'} focus:ring-primary-500 focus:border-primary-500`}
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Info */}
        <div className="text-xs text-slate-400 space-y-1 px-1">
          <div className="flex justify-between">
            <span>Market Rate ({selectedExchange?.name})</span>
            <span className="text-slate-200">1 {currencySymbol} ≈ {currentRate.toLocaleString('id-ID')} IDR</span>
          </div>
          <div className="flex justify-between">
            <span>Bridge Fee (0.5%)</span>
            <span className="text-slate-200">Rp {Number(fee).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Arrival</span>
            <span className="text-green-400">~5 Minutes (Instant via Xendit)</span>
          </div>
        </div>

        {errors.form && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">{errors.form}</p>}

        <Button type="submit" className="w-full py-4 text-lg" isLoading={loading}>
          Confirm Swap
        </Button>
      </form>
    </div>
  );
};

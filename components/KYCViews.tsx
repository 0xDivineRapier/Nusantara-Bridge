
import React, { useState } from 'react';
import { KYCStatus } from '../types';
import { Button } from './Button';
import { submitKYC } from '../services/mockBackend';

interface KYCViewsProps {
  status: KYCStatus;
  onStatusChange: (status: KYCStatus, reason?: string) => void;
  walletAddress: string;
}

export const KYCViews: React.FC<KYCViewsProps> = ({ status, onStatusChange, walletAddress }) => {
  const [formData, setFormData] = useState({
    ktp: null as File | null,
    shopFront: null as File | null,
    warungName: '',
  });
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'ktp' | 'shopFront') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleFillDummy = () => {
    // Create dummy file objects for testing
    const dummyFile = new File(["dummy_content"], "test_image.jpg", { type: "image/jpeg" });
    setFormData({
      warungName: "Warung Digital Sejahtera (Test)",
      ktp: dummyFile,
      shopFront: dummyFile,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Immediate state update to IN_REVIEW
    onStatusChange(KYCStatus.IN_REVIEW);

    try {
      const result = await submitKYC(walletAddress, formData);
      
      if (result.status === KYCStatus.REJECTED) {
        setRejectReason(result.reason || "Verification failed");
      }
      
      onStatusChange(result.status, result.reason);
    } catch (error) {
      console.error("KYC Error", error);
      setRejectReason("System error during verification");
      onStatusChange(KYCStatus.REJECTED);
    }
  };

  // 1. PENDING VIEW (Submission Form)
  if (status === KYCStatus.PENDING) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Warung Liquidity Verification</h2>
            <p className="text-slate-400 text-sm">To access instant settlements, we need to verify your business identity.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={handleFillDummy}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
              >
                Auto-fill Dummy Data
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Warung / Business Name</label>
              <input 
                type="text"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="e.g. Warung Sejahtera"
                value={formData.warungName}
                onChange={(e) => setFormData({...formData, warungName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${formData.ktp ? 'border-blue-500/50 bg-blue-900/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <input type="file" required={!formData.ktp} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'ktp')} />
                <div className="flex flex-col items-center">
                  {formData.ktp ? (
                    <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${formData.ktp ? 'text-blue-200' : 'text-slate-300'}`}>{formData.ktp ? formData.ktp.name : "Upload KTP"}</span>
                  <span className="text-xs text-slate-500 mt-1">Photo of ID Card</span>
                </div>
              </div>

              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer relative ${formData.shopFront ? 'border-blue-500/50 bg-blue-900/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <input type="file" required={!formData.shopFront} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'shopFront')} />
                <div className="flex flex-col items-center">
                  {formData.shopFront ? (
                    <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${formData.shopFront ? 'text-blue-200' : 'text-slate-300'}`}>{formData.shopFront ? formData.shopFront.name : "Upload Shop Front"}</span>
                  <span className="text-xs text-slate-500 mt-1">Photo of Location</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-lg">
              Submit Documents
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 2. IN_REVIEW VIEW
  if (status === KYCStatus.IN_REVIEW) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4">
        <div className="bg-slate-900 rounded-xl p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
           {/* Animated Background */}
           <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>
           </div>
           
           <div className="w-20 h-20 bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-3">Documents Under Review</h2>
           <p className="text-slate-400 mb-6 max-w-sm mx-auto">
             Your submission is being processed by our compliance team and local regulators.
           </p>
           
           <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 inline-block text-left w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-300">Document Upload Complete</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                 <span className="text-sm text-white font-medium">Compliance Check (D+1 Standard)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                 <span className="text-sm text-slate-500">Liquidity Access Activation</span>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // 3. REJECTED VIEW
  if (status === KYCStatus.REJECTED) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center px-4">
        <div className="bg-slate-900 rounded-xl p-10 border border-red-900/50 shadow-2xl">
           <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
           </div>
           
           <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
           <p className="text-slate-400 mb-6">We could not verify your documents.</p>
           
           <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg mb-8 text-left">
              <p className="text-xs text-red-300 uppercase font-bold mb-1">Reason</p>
              <p className="text-red-200">{rejectReason || "Unknown error."}</p>
           </div>
           
           <Button onClick={() => onStatusChange(KYCStatus.PENDING)} className="w-full bg-slate-800 hover:bg-slate-700">
             Try Again
           </Button>
        </div>
      </div>
    );
  }

  return null;
};

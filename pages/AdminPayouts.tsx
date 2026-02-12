
import React, { useState } from 'react';
import { Landmark, Check, X, AlertCircle, Clock, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { PayoutRequest } from '../types';

export const AdminPayouts: React.FC = () => {
  const { payouts, processPayout, settings } = useProperties();
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [reference, setReference] = useState('');

  const handleProcess = async (status: 'Approved' | 'Rejected') => {
    if (!selectedPayout) return;
    await processPayout(selectedPayout.id, status, reference);
    setSelectedPayout(null);
    setReference('');
  };

  const pendingPayouts = payouts.filter(p => p.status === 'Pending');

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-serif text-forge-navy font-bold mb-2">Commission Settlements</h1>
          <p className="text-slate-500">Authorize and log bank transfers for earned agent commissions.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-serif text-xl text-forge-navy font-bold">Payout Queue</h3>
              <span className="bg-amber-100 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {pendingPayouts.length} Active Requests
              </span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                    <tr>
                       <th className="px-8 py-5">Date</th>
                       <th className="px-8 py-5">Realtor</th>
                       <th className="px-8 py-5">Amount</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {payouts.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                         <td className="px-8 py-6 font-bold text-forge-navy">{p.agent_name}</td>
                         <td className="px-8 py-6 font-bold">₦{p.amount.toLocaleString()}</td>
                         <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'Approved' ? 'bg-green-100 text-green-600' : 
                              p.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                            }`}>
                               {p.status}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                           {p.status === 'Pending' && (
                             <button 
                               onClick={() => setSelectedPayout(p)}
                               className="bg-forge-navy text-white px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-forge-dark"
                             >
                               Process
                             </button>
                           )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Payout Approval Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-navy/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 relative">
            <h2 className="text-2xl font-serif text-forge-navy font-bold mb-6">Authorize Payout</h2>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-8 space-y-4">
               <div>
                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Amount Due</p>
                 <p className="text-2xl font-bold text-forge-navy">₦{selectedPayout.amount.toLocaleString()}</p>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                 <CreditCard size={18} className="text-forge-gold" />
                 <span>Bank transfer required</span>
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Reference (e.g. Bank Transfer Ref)</label>
                <input 
                  type="text" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference ID"
                  className="w-full bg-slate-50 border p-4 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleProcess('Rejected')}
                  className="flex-1 py-4 border border-red-200 text-red-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-50"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleProcess('Approved')}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-700"
                >
                  Mark as Paid
                </button>
              </div>
              <button onClick={() => setSelectedPayout(null)} className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

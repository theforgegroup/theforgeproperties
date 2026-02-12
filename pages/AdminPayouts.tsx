
import React from 'react';
import { Landmark, Check, X, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { PayoutRequest } from '../types';

export const AdminPayouts: React.FC = () => {
  const { payouts, updatePayoutStatus, settings } = useProperties();

  const handleApprove = async (id: string) => {
    if(window.confirm("Mark this payout as completed and funds transferred?")) {
      await updatePayoutStatus(id, 'Approved');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if(reason) {
      await updatePayoutStatus(id, 'Rejected');
    }
  };

  const pendingCount = payouts.filter(p => p.status === 'Pending').length;
  const totalPaid = payouts.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-serif text-forge-navy font-bold mb-2">Financial Settlements</h1>
          <p className="text-slate-500">Review and authorize commission payout requests from the agent network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
             <Clock className="text-amber-500 mb-4" size={24} />
             <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pending Requests</p>
             <h3 className="text-2xl font-bold text-forge-navy">{pendingCount}</h3>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
             <CheckCircle className="text-green-500 mb-4" size={24} />
             <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Disbursed</p>
             <h3 className="text-2xl font-bold text-forge-navy">₦{(totalPaid / 1000000).toFixed(1)}M</h3>
          </div>
          <div className="bg-forge-navy text-white p-8 rounded-2xl shadow-xl">
             <AlertCircle className="text-forge-gold mb-4" size={24} />
             <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Min Threshold</p>
             <h3 className="text-2xl font-bold">₦{settings.min_payout_amount.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-8 border-b border-slate-100">
              <h3 className="font-serif text-xl text-forge-navy font-bold">Settlement Queue</h3>
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
                             <div className="flex justify-end gap-2">
                               <button onClick={() => handleApprove(p.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><Check size={18} /></button>
                               <button onClick={() => handleReject(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><X size={18} /></button>
                             </div>
                           )}
                         </td>
                      </tr>
                    ))}
                    {payouts.length === 0 && (
                      <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No payout requests in the queue.</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

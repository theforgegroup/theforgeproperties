
import React, { useState } from 'react';
import { Search, UserCheck, UserX, Award, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { Agent } from '../types';

export const AdminAgents: React.FC = () => {
  const { agents, updateAgent, adjustAgentWallet } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const handleStatusUpdate = async (agent: Agent, newStatus: Agent['status']) => {
    await updateAgent({ ...agent, status: newStatus });
  };

  const handleWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !adjustmentAmount) return;
    await adjustAgentWallet(selectedAgent.id, parseFloat(adjustmentAmount), adjustmentReason);
    setSelectedAgent(null);
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy font-bold mb-2">Network Hub</h1>
            <p className="text-slate-500">Oversee accounts, adjust balances, and track referral performance.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search network..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                <tr>
                  <th className="px-8 py-5">Agent</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Sales</th>
                  <th className="px-8 py-5">Referrals</th>
                  <th className="px-8 py-5">Wallet</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredAgents.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-forge-navy text-forge-gold flex items-center justify-center font-bold">
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-forge-navy">{a.name}</p>
                          <p className="text-xs text-slate-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        a.status === 'Active' ? 'bg-green-100 text-green-600' : 
                        a.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold">{a.total_sales} closed</td>
                    <td className="px-8 py-6">
                       <p className="font-mono text-xs">{a.referral_code}</p>
                       <p className="text-[10px] text-slate-400">{a.total_clicks} clicks / {a.total_leads} leads</p>
                    </td>
                    <td className="px-8 py-6 font-bold text-forge-navy">
                       ₦{a.available_balance.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedAgent(a)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          title="Adjust Wallet"
                        >
                          <DollarSign size={18} />
                        </button>
                        {a.status !== 'Active' && (
                          <button onClick={() => handleStatusUpdate(a, 'Active')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><UserCheck size={18} /></button>
                        )}
                        {a.status !== 'Suspended' && (
                          <button onClick={() => handleStatusUpdate(a, 'Suspended')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><UserX size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Wallet Adjustment Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-navy/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 relative">
            <h2 className="text-2xl font-serif text-forge-navy font-bold mb-2">Adjust Balance</h2>
            <p className="text-slate-500 text-sm mb-8">Directly modify {selectedAgent.name}'s wallet.</p>
            <form onSubmit={handleWalletAdjust} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (Use negative for deduction)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                  <input 
                    type="number" 
                    required
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="w-full bg-slate-50 border p-4 pl-10 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                <input 
                  type="text" 
                  required
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Correcting commission error"
                  className="w-full bg-slate-50 border p-4 rounded-xl text-sm"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setSelectedAgent(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 bg-forge-navy text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Apply Change</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

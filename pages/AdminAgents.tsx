
import React, { useState } from 'react';
import { Search, UserCheck, UserX, Award, Shield, Mail, Phone, ExternalLink } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { Agent } from '../types';

export const AdminAgents: React.FC = () => {
  const { agents, updateAgent } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatusUpdate = async (agent: Agent, newStatus: Agent['status']) => {
    await updateAgent({ ...agent, status: newStatus });
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaderboard = [...agents].sort((a, b) => b.total_sales - a.total_sales).slice(0, 3);

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy font-bold mb-2">Agent Network</h1>
            <p className="text-slate-500">Manage, verify, and monitor your referral network performance.</p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.map((a, i) => (
            <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                  <Award size={64} />
               </div>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-forge-navy text-forge-gold flex items-center justify-center font-bold">#{i+1}</div>
                  <h3 className="font-bold text-forge-navy truncate">{a.name}</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Sales</p>
                     <p className="text-lg font-bold text-forge-navy">{a.total_sales}</p>
                  </div>
                  <div>
                     <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Commission</p>
                     <p className="text-lg font-bold text-forge-gold">₦{(a.total_commission / 1000000).toFixed(1)}M</p>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
             <h3 className="font-serif text-xl text-forge-navy font-bold">Registered Realtors</h3>
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-forge-gold"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                <tr>
                  <th className="px-8 py-5">Agent</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Network</th>
                  <th className="px-8 py-5">Wallet</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredAgents.map(a => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-forge-navy font-bold">
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
                    <td className="px-8 py-6">
                       <p className="font-mono text-xs text-forge-navy">{a.referral_code}</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest">{a.total_clicks} clicks</p>
                    </td>
                    <td className="px-8 py-6 font-bold">
                       ₦{a.available_balance.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {a.status !== 'Active' && (
                          <button onClick={() => handleStatusUpdate(a, 'Active')} title="Approve Agent" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"><UserCheck size={18} /></button>
                        )}
                        {a.status !== 'Suspended' && (
                          <button onClick={() => handleStatusUpdate(a, 'Suspended')} title="Suspend Agent" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><UserX size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAgents.length === 0 && (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No agents found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

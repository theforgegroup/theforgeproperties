
import React, { useState } from 'react';
import { Landmark, Plus, Search, CheckCircle, Wallet, DollarSign, Activity } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';
import { AdminLayout } from '../components/AdminLayout';
import { AgentSale } from '../types';

export const AdminSales: React.FC = () => {
  const { sales, agents, properties, addSale, updateSaleStatus, makeCommissionAvailable, settings } = useProperties();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [newSale, setNewSale] = useState<Partial<AgentSale>>({
    agent_id: '',
    property_id: '',
    client_name: '',
    commission_type: 'Percentage',
    commission_percentage: settings.default_commission_rate,
    commission_amount: 0
  });

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const agent = agents.find(a => a.id === newSale.agent_id);
    const property = properties.find(p => p.id === newSale.property_id);
    if (!agent || !property) return;

    let commissionAmount = 0;
    if (newSale.commission_type === 'Percentage') {
      commissionAmount = (property.price * (newSale.commission_percentage || 0)) / 100;
    } else {
      commissionAmount = newSale.commission_amount || 0;
    }

    const sale: AgentSale = {
      id: Date.now().toString(),
      agent_id: agent.id,
      agent_name: agent.name,
      property_id: property.id,
      property_name: property.title,
      client_name: newSale.client_name || 'Anonymous',
      sale_amount: property.price,
      deal_status: 'Pending',
      commission_type: newSale.commission_type as 'Percentage' | 'Fixed',
      commission_percentage: newSale.commission_type === 'Percentage' ? newSale.commission_percentage : undefined,
      commission_amount: commissionAmount,
      is_available: false,
      date: new Date().toISOString()
    };

    await addSale(sale);
    setShowAddModal(false);
    setNewSale({ agent_id: '', property_id: '', client_name: '', commission_type: 'Percentage', commission_percentage: settings.default_commission_rate });
  };

  const filteredSales = sales.filter(s => 
    s.property_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif text-forge-navy font-bold mb-2">Deal Pipeline</h1>
            <p className="text-slate-500 text-sm">Monitor closures and authorize commission payouts.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-forge-navy text-white px-8 py-4 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-forge-dark shadow-xl"
          >
            <Plus size={16} /> Record Closing
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search deals..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                <tr>
                  <th className="px-8 py-5">Property / Client</th>
                  <th className="px-8 py-5">Agent</th>
                  <th className="px-8 py-5">Commission</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredSales.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                       <p className="font-bold text-forge-navy">{s.property_name}</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest">{s.client_name}</p>
                    </td>
                    <td className="px-8 py-6 text-slate-600">{s.agent_name}</td>
                    <td className="px-8 py-6 font-bold text-forge-gold">₦{s.commission_amount.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block text-center ${
                          s.deal_status === 'Approved' ? 'bg-green-100 text-green-600' : 
                          s.deal_status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {s.deal_status}
                        </span>
                        {s.is_available && (
                          <span className="text-[9px] text-green-600 font-bold uppercase text-center">Funds Verified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {s.deal_status === 'Pending' && (
                          <button 
                            onClick={() => updateSaleStatus(s.id, 'Approved')}
                            className="bg-forge-navy text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest"
                          >
                            Approve Deal
                          </button>
                        )}
                        {s.deal_status === 'Approved' && !s.is_available && (
                          <button 
                            onClick={() => makeCommissionAvailable(s.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                          >
                            <Wallet size={12} /> Confirm Funds
                          </button>
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

      {/* Record Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-navy/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-10 relative">
            <h2 className="text-2xl font-serif text-forge-navy font-bold mb-8">Record Professional Closing</h2>
            <form onSubmit={handleCreateSale} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Realtor</label>
                  <select required value={newSale.agent_id} onChange={(e) => setNewSale({...newSale, agent_id: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl text-sm">
                    <option value="">Select Agent</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Property</label>
                  <select required value={newSale.property_id} onChange={(e) => setNewSale({...newSale, property_id: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl text-sm">
                    <option value="">Select Portfolio Unit</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title} (₦{p.price.toLocaleString()})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client Name</label>
                  <input type="text" required value={newSale.client_name} onChange={(e) => setNewSale({...newSale, client_name: e.target.value})} className="w-full bg-slate-50 border p-4 rounded-xl text-sm" placeholder="Enter purchaser name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Comm. Type</label>
                  <select value={newSale.commission_type} onChange={(e) => setNewSale({...newSale, commission_type: e.target.value as any})} className="w-full bg-slate-50 border p-4 rounded-xl text-sm">
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {newSale.commission_type === 'Percentage' ? 'Commission Rate (%)' : 'Fixed Commission Amount (₦)'}
                </label>
                <input 
                  type="number" 
                  required 
                  value={newSale.commission_type === 'Percentage' ? newSale.commission_percentage : newSale.commission_amount} 
                  onChange={(e) => setNewSale({
                    ...newSale, 
                    [newSale.commission_type === 'Percentage' ? 'commission_percentage' : 'commission_amount']: parseFloat(e.target.value)
                  })} 
                  className="w-full bg-slate-50 border p-4 rounded-xl text-sm" 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 bg-forge-navy text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Authorize Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

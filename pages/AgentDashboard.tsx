
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, DollarSign, Award, ArrowUpRight, Copy, Check, 
  Wallet, LayoutDashboard, LogOut, MessageSquare, Menu, X, Landmark, History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { PayoutRequest } from '../types';

export const AgentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { settings, getAgentSales, getAgentPayouts, requestPayout, agents } = useProperties();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'wallet' | 'referrals'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isWhatsAppDismissed, setIsWhatsAppDismissed] = useState(false);

  // Sync with real Agent data from Context for Wallet precision
  const agent = agents.find(a => a.id === currentUser?.id) || currentUser;
  const agentSales = (getAgentSales ? getAgentSales(agent.id) : []) || [];
  const agentPayouts = (getAgentPayouts ? getAgentPayouts(agent.id) : []) || [];
  
  const referralLink = `forgeproperties.ng/ref/${agent?.referral_code || 'CODE'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < settings.min_payout_amount || amount > (agent.available_balance || 0)) {
      alert(`Min payout is ₦${settings.min_payout_amount.toLocaleString()}. Max is your available balance.`);
      return;
    }

    const payout: PayoutRequest = {
      id: Date.now().toString(),
      agent_id: agent.id,
      agent_name: agent.name,
      amount: amount,
      status: 'Pending',
      date: new Date().toISOString()
    };

    await requestPayout(payout);
    setShowPayoutModal(false);
    setPayoutAmount('');
    alert("Settlement request initiated.");
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${
        activeTab === id 
          ? 'bg-forge-gold text-forge-navy shadow-lg shadow-forge-gold/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-forge-navy flex flex-col lg:flex-row overflow-hidden">
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-forge-dark border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex flex-col mb-12">
            <span className="text-2xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-forge-gold">Agents</span>
          </div>
          <nav className="space-y-3 flex-grow">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="sales" label="Pipeline" icon={Landmark} />
            <NavItem id="wallet" label="My Wallet" icon={Wallet} />
            <NavItem id="referrals" label="Referral Lab" icon={Users} />
          </nav>
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold font-bold">{agent?.name?.charAt(0)}</div>
              <div className="truncate"><p className="text-white font-bold text-sm truncate">{agent?.name}</p><p className="text-slate-500 text-[10px] uppercase tracking-wider">Accredited Agent</p></div>
            </div>
            <button onClick={logout} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-xs uppercase font-bold tracking-widest"><LogOut size={16} /> Sign Out</button>
          </div>
        </div>
      </div>

      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 relative">
        <div className="lg:hidden bg-forge-navy p-6 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <div className="flex flex-col"><span className="text-xl font-serif font-bold text-white tracking-widest">THE FORGE</span><span className="text-[8px] uppercase tracking-[0.3em] text-forge-gold">Agents</span></div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-white"><Menu size={28} /></button>
        </div>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div><h1 className="text-3xl font-serif text-forge-navy font-bold">Protocol Dashboard</h1><p className="text-slate-500">Real-time ledger and performance tracking.</p></div>
            <button onClick={() => setActiveTab('wallet')} className="bg-forge-navy text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark shadow-xl">Manage Settlement</button>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Sales', val: (agent.total_sales || 0).toString(), sub: 'Closed Deals', icon: Award, color: 'text-forge-navy' },
                  { label: 'Total Earned', val: `₦${(agent.total_earned || 0).toLocaleString()}`, sub: 'Lifetime comm.', icon: DollarSign, color: 'text-forge-gold' },
                  { label: 'Pending Balance', val: `₦${(agent.pending_balance || 0).toLocaleString()}`, sub: 'Awaiting clearance', icon: History, color: 'text-blue-500' },
                  { label: 'Available Balance', val: `₦${(agent.available_balance || 0).toLocaleString()}`, sub: 'Settlement ready', icon: Wallet, color: 'text-green-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}><stat.icon size={24} /></div>
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-forge-navy truncate">{stat.val}</h3>
                    <p className="text-slate-500 text-xs mt-2">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
                 <h3 className="font-serif text-xl text-forge-navy font-bold mb-8">Referral Lab</h3>
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Unique Protocol Link</p>
                       <p className="font-mono text-xs text-slate-600 truncate mb-4">{referralLink}</p>
                       <button onClick={copyToClipboard} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${copied ? 'bg-green-500 text-white' : 'bg-forge-navy text-white hover:bg-forge-dark'}`}>
                         {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy Referral Link'}
                       </button>
                    </div>
                 </div>
              </div>
            </>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100"><h3 className="font-serif text-xl text-forge-navy font-bold">Deal Ledger</h3></div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        <tr><th className="px-8 py-5">Date</th><th className="px-8 py-5">Property</th><th className="px-8 py-5">Commission</th><th className="px-8 py-5">Status</th></tr>
                     </thead>
                     <tbody className="text-sm">
                        {agentSales.map(sale => (
                          <tr key={sale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                             <td className="px-8 py-6 font-bold text-forge-navy">{sale.property_name}</td>
                             <td className="px-8 py-6 font-bold">₦{sale.commission_amount.toLocaleString()}</td>
                             <td className="px-8 py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  sale.deal_status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                   {sale.deal_status}
                                </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-8">
               <div className="bg-forge-navy text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="relative z-10">
                     <p className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4">Settlement Balance</p>
                     <h2 className="text-5xl font-bold mb-4">₦{(agent.available_balance || 0).toLocaleString()}</h2>
                     <p className="text-white/60 text-sm">Pending Clearance: ₦{(agent.pending_balance || 0).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setShowPayoutModal(true)} className="relative z-10 bg-forge-gold text-forge-navy px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white shadow-xl">Request Settlement</button>
               </div>
            </div>
          )}
        </div>
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-navy/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 relative z-10">
            <h3 className="text-2xl font-serif text-forge-navy font-bold mb-2">Request Settlement</h3>
            <p className="text-slate-500 text-sm mb-8">Funds will be disbursed to your registered account.</p>
            <div className="space-y-6">
              <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border p-4 rounded-xl text-xl font-bold focus:outline-none" />
              <button onClick={handlePayout} className="w-full bg-forge-navy text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs">Confirm Request</button>
              <button onClick={() => setShowPayoutModal(false)} className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

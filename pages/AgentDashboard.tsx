
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, DollarSign, Award, ArrowUpRight, Copy, Check, 
  Wallet, PieChart, LayoutDashboard, LogOut, MessageSquare, Menu, X, 
  ArrowRight, Landmark, CreditCard, History, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { AgentSale, PayoutRequest } from '../types';

export const AgentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { settings, getAgentSales, getAgentPayouts, requestPayout } = useProperties();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'wallet' | 'referrals'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isWhatsAppDismissed, setIsWhatsAppDismissed] = useState(false);

  // Real Agent Data
  const agentSales = getAgentSales(currentUser?.id) || [];
  const agentPayouts = getAgentPayouts(currentUser?.id) || [];
  
  // Dynamic Stats
  const totalEarned = agentSales.reduce((sum, s) => sum + s.commission_amount, 0);
  const pendingComm = agentSales.filter(s => s.deal_status === 'Pending' || s.deal_status === 'Under Review').reduce((sum, s) => sum + s.commission_amount, 0);
  const approvedPayouts = agentPayouts.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0);
  const availableBal = totalEarned - approvedPayouts;

  // Real Activity Logic
  const activityLog = [...agentSales].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(sale => ({
    type: 'sale',
    title: `Deal ${sale.deal_status}: ${sale.property_name}`,
    time: new Date(sale.date).toLocaleDateString(),
    icon: sale.deal_status === 'Paid' ? DollarSign : Award,
    color: sale.deal_status === 'Paid' ? 'text-green-600' : 'text-blue-600'
  }));

  const referralLink = `forgeproperties.ng/ref/${currentUser?.referral_code || 'CODE'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < settings.min_payout_amount || amount > availableBal) {
      alert(`Min payout is ₦${settings.min_payout_amount.toLocaleString()}. Max is your available balance.`);
      return;
    }

    const payout: PayoutRequest = {
      id: Date.now().toString(),
      agent_id: currentUser.id,
      agent_name: currentUser.name,
      amount: amount,
      status: 'Pending',
      date: new Date().toISOString()
    };

    await requestPayout(payout);
    setShowPayoutModal(false);
    setPayoutAmount('');
    alert("Payout request submitted successfully.");
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
      
      {/* Sidebar */}
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
            <NavItem id="sales" label="Sales & Deals" icon={Landmark} />
            <NavItem id="wallet" label="My Wallet" icon={Wallet} />
            <NavItem id="referrals" label="Referral Lab" icon={Users} />
          </nav>

          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold font-bold">
                {currentUser?.name?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-white font-bold text-sm truncate">{currentUser?.name}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider">Accredited Realtor</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-xs uppercase font-bold tracking-widest"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-forge-navy p-6 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-forge-gold">Agents</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-white">
            <Menu size={28} />
          </button>
        </div>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-serif text-forge-navy font-bold">Good Day, {currentUser?.name?.split(' ')[0]}</h1>
              <p className="text-slate-500">Heres whats happening with your portfolio today.</p>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/listings')} className="bg-white border border-slate-200 text-forge-navy px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-md transition-all">
                  Browse Properties
               </button>
               <button onClick={() => setActiveTab('wallet')} className="bg-forge-navy text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark shadow-xl transition-all">
                  Withdraw Funds
               </button>
            </div>
          </div>

          {!isWhatsAppDismissed && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                  <MessageSquare size={200} />
               </div>
               <div className="relative z-10 flex items-center gap-6">
                 <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <MessageSquare size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-1">Join the Official Agent Community</h3>
                    <p className="text-white/80 text-sm">Real-time updates, off-market deals, and community support.</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 relative z-10">
                 <a 
                   href={settings.whatsapp_group_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
                 >
                   Join WhatsApp Group
                 </a>
                 <button onClick={() => setIsWhatsAppDismissed(true)} className="p-2 hover:bg-white/20 rounded-lg">
                   <X size={20} />
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Earnings', val: `₦${totalEarned.toLocaleString()}`, sub: 'Lifetime commissions', icon: DollarSign, color: 'text-forge-navy' },
                  { label: 'Available Balance', val: `₦${availableBal.toLocaleString()}`, sub: 'Ready for withdrawal', icon: Wallet, color: 'text-forge-gold' },
                  { label: 'Total Referrals', val: (currentUser?.total_clicks || 0).toString(), sub: 'Clicks & Leads', icon: Users, color: 'text-blue-500' },
                  { label: 'Active Deals', val: agentSales.filter(s => s.deal_status !== 'Paid').length.toString(), sub: 'In progress', icon: Award, color: 'text-green-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                        <stat.icon size={24} />
                      </div>
                      <span className="text-green-500 text-xs font-bold flex items-center gap-1">
                        <ArrowUpRight size={14} /> +0%
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-forge-navy truncate">{stat.val}</h3>
                    <p className="text-slate-500 text-xs mt-2">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-serif text-xl text-forge-navy font-bold">Earning Performance</h3>
                      <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none">
                        <option>Last 6 Months</option>
                      </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 pt-4">
                       {[20, 30, 15, 45, 10, 5].map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-2">
                           <div className="w-full bg-slate-50 rounded-lg relative overflow-hidden h-full">
                              <div 
                                className="absolute bottom-0 left-0 w-full bg-forge-gold transition-all duration-1000 ease-out" 
                                style={{ height: `${h}%` }}
                              />
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold">W {i+1}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-serif text-xl text-forge-navy font-bold mb-8">Recent Activity</h3>
                    <div className="space-y-6">
                       {activityLog.length > 0 ? activityLog.map((log, i) => (
                         <div key={i} className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 ${log.color}`}>
                               <log.icon size={18} />
                            </div>
                            <div className="flex-grow min-w-0">
                               <p className="text-sm font-bold text-forge-navy truncate">{log.title}</p>
                               <p className="text-xs text-slate-500">{log.time}</p>
                            </div>
                         </div>
                       )) : (
                         <div className="text-center py-12 text-slate-400 text-sm italic">
                           No recent activity to show.
                         </div>
                       )}
                    </div>
                    <button onClick={() => setActiveTab('sales')} className="w-full mt-8 py-4 border-2 border-slate-50 rounded-xl text-xs font-bold uppercase tracking-widest text-forge-navy hover:bg-slate-50 transition-all">
                       View All Transactions
                    </button>
                 </div>
              </div>
            </>
          )}

          {activeTab === 'referrals' && (
            <div className="max-w-4xl space-y-8">
               <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-xl text-center">
                  <div className="w-20 h-20 bg-forge-navy text-forge-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                     <Users size={40} />
                  </div>
                  <h2 className="text-3xl font-serif text-forge-navy font-bold mb-4">Your Professional Network</h2>
                  <p className="text-slate-500 mb-10 max-w-xl mx-auto">
                     Share your unique referral link with your network. Every lead generated and deal closed through this link is automatically attributed to your account.
                  </p>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4">
                     <div className="flex-grow text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Referral Code: <span className="text-forge-navy">{currentUser?.referral_code}</span></p>
                        <p className="font-mono text-sm text-slate-600 truncate">{referralLink}</p>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className={`px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-3 ${
                          copied ? 'bg-green-500 text-white' : 'bg-forge-navy text-white hover:bg-forge-dark'
                        }`}
                     >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy Link'}
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Link Clicks', val: (currentUser?.total_clicks || 0).toString(), icon: ArrowUpRight },
                    { label: 'Leads Generated', val: (currentUser?.total_leads || 0).toString(), icon: Users },
                    { label: 'Conversion Rate', val: '0.0%', icon: TrendingUp },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                       <div className="w-12 h-12 bg-slate-50 text-forge-navy rounded-full flex items-center justify-center mx-auto mb-4">
                          <s.icon size={20} />
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                       <h4 className="text-2xl font-bold text-forge-navy">{s.val}</h4>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-8">
               <div className="bg-forge-navy text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute -top-20 -left-20 w-80 h-80 bg-forge-gold rounded-full blur-[100px]" />
                     <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-forge-gold rounded-full blur-[100px]" />
                  </div>
                  
                  <div className="relative z-10">
                     <p className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4">Commission Wallet</p>
                     <h2 className="text-5xl font-bold mb-4">₦{availableBal.toLocaleString()}</h2>
                     <div className="flex items-center gap-6 text-white/60 text-sm">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Active</span>
                        <span className="flex items-center gap-2">₦{pendingComm.toLocaleString()} Pending Settlement</span>
                     </div>
                  </div>

                  <div className="relative z-10 w-full md:w-auto">
                     <button 
                       onClick={() => setShowPayoutModal(true)}
                       className="w-full md:w-auto bg-forge-gold text-forge-navy px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shadow-forge-gold/10"
                     >
                        Request Payout
                     </button>
                  </div>
               </div>

               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="font-serif text-xl text-forge-navy font-bold">Transaction History</h3>
                     <History size={20} className="text-slate-400" />
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                           <tr>
                              <th className="px-8 py-5">Date</th>
                              <th className="px-8 py-5">Reference</th>
                              <th className="px-8 py-5">Amount</th>
                              <th className="px-8 py-5">Status</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm">
                           {agentPayouts.map(p => (
                             <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                <td className="px-8 py-6 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-8 py-6 font-bold text-forge-navy">Payout #{p.id.slice(-4)}</td>
                                <td className="px-8 py-6 font-bold">₦{p.amount.toLocaleString()}</td>
                                <td className="px-8 py-6">
                                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                     p.status === 'Approved' ? 'bg-green-100 text-green-600' : 
                                     p.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                   }`}>
                                      {p.status}
                                   </span>
                                </td>
                             </tr>
                           ))}
                           {agentPayouts.length === 0 && (
                             <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No payout history found.</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                 <h3 className="font-serif text-xl text-forge-navy font-bold">My Sales Portfolio</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                       <tr>
                          <th className="px-8 py-5">Date</th>
                          <th className="px-8 py-5">Client</th>
                          <th className="px-8 py-5">Property</th>
                          <th className="px-8 py-5">Commission</th>
                          <th className="px-8 py-5">Status</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {agentSales.map(sale => (
                         <tr key={sale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="px-8 py-6 font-bold text-forge-navy">{sale.client_name}</td>
                            <td className="px-8 py-6 text-slate-600">{sale.property_name}</td>
                            <td className="px-8 py-6 font-bold">₦{sale.commission_amount.toLocaleString()}</td>
                            <td className="px-8 py-6">
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                 sale.deal_status === 'Paid' ? 'bg-green-100 text-green-600' : 
                                 sale.deal_status === 'Approved' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                               }`}>
                                  {sale.deal_status}
                               </span>
                            </td>
                         </tr>
                       ))}
                       {agentSales.length === 0 && (
                         <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No sales tracked yet. Close your first deal to see it here!</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-forge-navy/80 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl p-10 relative z-10 shadow-2xl">
            <h3 className="text-2xl font-serif text-forge-navy font-bold mb-2">Request Payout</h3>
            <p className="text-slate-500 text-sm mb-8">Funds will be disbursed to your registered bank account.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available: ₦{availableBal.toLocaleString()}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₦</span>
                  <input 
                    type="number" 
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-4 rounded-xl text-xl font-bold focus:border-forge-gold focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Minimum payout: ₦{settings.min_payout_amount.toLocaleString()}</p>
              </div>

              <button 
                onClick={handlePayout}
                className="w-full bg-forge-navy text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-forge-dark shadow-xl"
              >
                Confirm Request
              </button>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

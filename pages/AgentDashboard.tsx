
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, DollarSign, Award, ArrowUpRight, Copy, Check, 
  Wallet, LayoutDashboard, LogOut, MessageSquare, Menu, X, Landmark, History, 
  PieChart, Activity, Shield
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

  // Sync with real Agent data from Context for Wallet precision (MVP logic)
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
    alert("Settlement request initiated and pending review.");
  };

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 font-bold uppercase tracking-widest text-[10px] ${
        activeTab === id 
          ? 'bg-forge-gold text-forge-navy shadow-xl shadow-forge-gold/20 translate-x-2' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-forge-navy flex flex-col lg:flex-row overflow-hidden">
      
      {/* Sidebar - Reverted to Sleek Dark Theme */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-forge-dark border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-10">
          <div className="flex flex-col mb-16">
            <span className="text-3xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-[10px] uppercase tracking-[0.5em] text-forge-gold mt-1">Agents</span>
          </div>

          <nav className="space-y-4 flex-grow">
            <NavItem id="overview" label="Protocol Hub" icon={LayoutDashboard} />
            <NavItem id="sales" label="Sales Pipeline" icon={Landmark} />
            <NavItem id="wallet" label="Treasury" icon={Wallet} />
            <NavItem id="referrals" label="Referral Lab" icon={Users} />
          </nav>

          <div className="pt-10 border-t border-white/10">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forge-gold to-forge-goldLight flex items-center justify-center text-forge-navy font-black shadow-lg">
                {agent?.name?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-white font-bold text-sm truncate">{agent?.name}</p>
                <p className="text-forge-gold/60 text-[9px] uppercase tracking-widest font-bold">Accredited Member</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 text-slate-500 hover:text-red-400 transition-colors text-[10px] uppercase font-black tracking-widest"
            >
              <LogOut size={16} /> Terminate Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-forge-navy p-6 flex justify-between items-center sticky top-0 z-40 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-forge-gold">Agents</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-white hover:text-forge-gold transition-colors">
            <Menu size={28} />
          </button>
        </div>

        <div className="p-6 lg:p-16 max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-4xl font-serif text-forge-navy font-bold leading-tight">Elite Performance <br /><span className="text-forge-gold">Protocol</span></h1>
              <p className="text-slate-500 mt-2 font-medium">Monitoring your corporate real estate portfolio in real-time.</p>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/listings')} className="bg-white border-2 border-slate-100 text-forge-navy px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:border-forge-gold hover:text-forge-gold transition-all shadow-sm">
                  View Inventory
               </button>
               <button onClick={() => setActiveTab('wallet')} className="bg-forge-navy text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-forge-dark shadow-2xl transition-all">
                  Access Treasury
               </button>
            </div>
          </div>

          {/* WhatsApp CTA Reverted */}
          {!isWhatsAppDismissed && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-1000">
                  <MessageSquare size={300} />
               </div>
               <div className="relative z-10 flex items-center gap-8">
                 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                    <MessageSquare size={40} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold mb-2">Join the High-Perfomance Network</h3>
                    <p className="text-white/80 text-base max-w-md">Access off-market listings, legal updates, and real-time support from the community.</p>
                 </div>
               </div>
               <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                 <a 
                   href={settings.whatsapp_group_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex-1 md:flex-none text-center bg-white text-emerald-600 px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl"
                 >
                   Join Community
                 </a>
                 <button onClick={() => setIsWhatsAppDismissed(true)} className="p-3 hover:bg-white/20 rounded-xl transition-colors">
                   <X size={24} />
                 </button>
               </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Total Sales', val: (agent.total_sales || 0).toString(), sub: 'Asset Closed', icon: Award, color: 'text-forge-navy' },
                  { label: 'Total Earned', val: `₦${(agent.total_earned || 0).toLocaleString()}`, sub: 'Lifetime Comm.', icon: DollarSign, color: 'text-forge-gold' },
                  { label: 'Pending Settlement', val: `₦${(agent.pending_balance || 0).toLocaleString()}`, sub: 'Awaiting Funds', icon: History, color: 'text-blue-500' },
                  { label: 'Available Treasury', val: `₦${(agent.available_balance || 0).toLocaleString()}`, sub: 'Withdraw Ready', icon: Wallet, color: 'text-green-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon size={28} />
                      </div>
                      <span className="text-green-500 text-[10px] font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                        <ArrowUpRight size={14} /> ACTIVE
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-forge-navy truncate tracking-tight">{stat.val}</h3>
                    <p className="text-slate-500 text-xs mt-3 font-medium">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 {/* Visual Chart Placeholder */}
                 <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="font-serif text-2xl text-forge-navy font-bold">Revenue Projections</h3>
                      <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-forge-navy"></span>
                        <span className="w-3 h-3 rounded-full bg-forge-gold"></span>
                      </div>
                    </div>
                    <div className="h-72 flex items-end justify-between gap-6 pt-6">
                       {[35, 50, 40, 75, 45, 90, 60].map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="w-full bg-slate-50 rounded-2xl relative overflow-hidden h-full border border-slate-100/50">
                              <div 
                                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-forge-navy to-forge-gold opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out cursor-pointer" 
                                style={{ height: `${h}%` }}
                              />
                           </div>
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Q{i+1}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-forge-navy p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                       <PieChart size={40} className="text-forge-gold mb-8" />
                       <h3 className="text-3xl font-serif font-bold mb-4">Referral Analytics</h3>
                       <p className="text-slate-400 text-sm leading-relaxed mb-10">Conversion metrics from your unique protocol link.</p>
                       
                       <div className="space-y-6">
                          <div className="flex justify-between items-end">
                             <span className="text-xs uppercase font-bold tracking-widest text-slate-500">Total Reach</span>
                             <span className="text-2xl font-bold">{agent.total_clicks || 0}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-forge-gold w-3/4 rounded-full"></div>
                          </div>
                          <div className="flex justify-between items-end">
                             <span className="text-xs uppercase font-bold tracking-widest text-slate-500">Qualified Leads</span>
                             <span className="text-2xl font-bold">{agent.total_leads || 0}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-white w-1/2 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setActiveTab('referrals')} className="relative z-10 w-full mt-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-forge-gold hover:text-forge-navy transition-all">
                       Expand Research
                    </button>
                 </div>
              </div>
            </>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-10">
               <div className="bg-forge-navy text-white p-16 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute -top-20 -left-20 w-96 h-96 bg-forge-gold rounded-full blur-[120px]" />
                     <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-forge-gold rounded-full blur-[120px]" />
                  </div>
                  
                  <div className="relative z-10">
                     <p className="text-forge-gold text-xs uppercase tracking-[0.5em] font-bold mb-6">Corporate Treasury</p>
                     <h2 className="text-6xl md:text-7xl font-bold mb-6 tracking-tighter">₦{(agent.available_balance || 0).toLocaleString()}</h2>
                     <div className="flex items-center gap-8 text-white/60 text-sm font-medium">
                        <span className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> SETTLED</span>
                        <span className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-500" /> ₦{(agent.pending_balance || 0).toLocaleString()} PENDING</span>
                     </div>
                  </div>

                  <div className="relative z-10 w-full md:w-auto">
                     <button 
                       onClick={() => setShowPayoutModal(true)}
                       className="w-full md:w-auto bg-forge-gold text-forge-navy px-14 py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-2xl shadow-forge-gold/20"
                     >
                        Request Settlement
                     </button>
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                     <h3 className="font-serif text-2xl text-forge-navy font-bold">Transaction Ledger</h3>
                     <History size={24} className="text-slate-300" />
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                           <tr>
                              <th className="px-10 py-6">Timestamp</th>
                              <th className="px-10 py-6">Protocol Reference</th>
                              <th className="px-10 py-6">Valuation</th>
                              <th className="px-10 py-6">Security Status</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm">
                           {agentPayouts.map(p => (
                             <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                                <td className="px-10 py-8 text-slate-500 font-medium">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-10 py-8 font-bold text-forge-navy uppercase tracking-widest text-xs">TRX-#{p.id.slice(-6)}</td>
                                <td className="px-10 py-8 font-black text-lg">₦{p.amount.toLocaleString()}</td>
                                <td className="px-10 py-8">
                                   <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                     p.status === 'Paid' ? 'bg-green-100 text-green-600' : 
                                     p.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                   }`}>
                                      {p.status}
                                   </span>
                                </td>
                             </tr>
                           ))}
                           {agentPayouts.length === 0 && (
                             <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic font-serif">No transactions found in this treasury node.</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="max-w-4xl space-y-12">
               <div className="bg-white p-16 rounded-[3rem] border border-slate-100 shadow-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="w-24 h-24 bg-forge-navy text-forge-gold rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
                     <Users size={48} />
                  </div>
                  <h2 className="text-4xl font-serif text-forge-navy font-bold mb-6">Protocol Networking</h2>
                  <p className="text-slate-500 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                     Deploy your unique protocol link to curate new clients. Every inquiry and closed deal via this link is attributed to your master ledger.
                  </p>
                  
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row items-center gap-6 group">
                     <div className="flex-grow text-left min-w-0 w-full">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-2">Protocol ID: <span className="text-forge-navy">{agent?.referral_code}</span></p>
                        <p className="font-mono text-sm text-slate-500 truncate">{referralLink}</p>
                     </div>
                     <button 
                        onClick={copyToClipboard}
                        className={`w-full md:w-auto px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-4 shadow-xl ${
                          copied ? 'bg-green-500 text-white' : 'bg-forge-navy text-white hover:bg-forge-dark'
                        }`}
                     >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Link Secured' : 'Copy Protocol'}
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Network Reach', val: (agent.total_clicks || 0).toString(), icon: Activity },
                    { label: 'Client Conversion', val: (agent.total_leads || 0).toString(), icon: Users },
                    { label: 'Trust Score', val: 'AAA+', icon: Shield },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:shadow-xl transition-all">
                       <div className="w-16 h-16 bg-slate-50 text-forge-navy rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <s.icon size={28} />
                       </div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">{s.label}</p>
                       <h4 className="text-3xl font-bold text-forge-navy">{s.val}</h4>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50">
                 <h3 className="font-serif text-2xl text-forge-navy font-bold">Sales Portfolio</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                       <tr>
                          <th className="px-10 py-6">Closing Date</th>
                          <th className="px-10 py-6">Property Residence</th>
                          <th className="px-10 py-6">Commission Valuation</th>
                          <th className="px-10 py-6">Deal Integrity</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {agentSales.map(sale => (
                         <tr key={sale.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors">
                            <td className="px-10 py-8 text-slate-500 font-medium">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="px-10 py-8">
                               <p className="font-bold text-forge-navy text-sm">{sale.property_name}</p>
                               <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Client Attribution Locked</p>
                            </td>
                            <td className="px-10 py-8 font-black text-lg text-forge-gold">₦{sale.commission_amount.toLocaleString()}</td>
                            <td className="px-10 py-8">
                               <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                 sale.deal_status === 'Approved' ? 'bg-green-100 text-green-600' : 
                                 sale.deal_status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                               }`}>
                                  {sale.deal_status}
                               </span>
                            </td>
                         </tr>
                       ))}
                       {agentSales.length === 0 && (
                         <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-serif">No sales protocols detected. Secure your first closing to view data.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payout Modal - Reverted to High End Style */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-forge-navy/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-12 relative z-10 shadow-2xl border-t-8 border-forge-gold">
            <h3 className="text-3xl font-serif text-forge-navy font-bold mb-3">Treasury Withdrawal</h3>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Verify the settlement amount. Funds are disbursed via secure bank transfer within 24-48 hours.</p>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Available: ₦{(agent.available_balance || 0).toLocaleString()}</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-xl">₦</span>
                  <input 
                    type="number" 
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 pl-14 pr-6 py-6 rounded-2xl text-2xl font-bold focus:border-forge-gold focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-3 italic text-center font-medium">System Minimum: ₦{settings.min_payout_amount.toLocaleString()}</p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handlePayout}
                  className="w-full bg-forge-navy text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-forge-dark shadow-2xl transition-all"
                >
                  Confirm Settlement Request
                </button>
                <button 
                  onClick={() => setShowPayoutModal(false)}
                  className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors"
                >
                  Abort Protocol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

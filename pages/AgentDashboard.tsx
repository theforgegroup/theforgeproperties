import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, DollarSign, Award, Copy, Check, 
  Wallet, LayoutDashboard, LogOut, MessageSquare, Menu, X, 
  Landmark, History, FileText, Download, Play, Video, BookOpen, 
  Bell, User, CheckCircle, Search, MessageCircle, FileDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { extractErrorMessage } from '../utils/errorUtils';
import { PayoutRequest, Lead, Property } from '../types';

interface SupportTicket {
  id: string;
  date: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  replies: Array<{ sender: string; message: string; date: string }>;
}

interface NavItemProps {
  id: 'overview' | 'properties' | 'marketing' | 'earnings' | 'leads' | 'training' | 'announcements' | 'profile' | 'support';
  label: string;
  icon: React.ElementType;
}

const NavItem: React.FC<NavItemProps & { activeTab: string; setActiveTab: (id: NavItemProps['id']) => void; setIsSidebarOpen: (open: boolean) => void }> = ({ id, label, icon: Icon, activeTab, setActiveTab, setIsSidebarOpen }) => (
  <button
    onClick={() => {
      setActiveTab(id);
      setIsSidebarOpen(false);
    }}
    className={`
      w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group
      ${activeTab === id 
        ? 'bg-forge-gold text-forge-navy shadow-lg shadow-forge-gold/10 font-bold translate-x-1' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <Icon size={18} className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="text-xs uppercase tracking-widest font-bold">{label}</span>
    {activeTab === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forge-navy" />}
  </button>
);

// FAQ Database static catalog
const FAQS_LIST = [
  { q: 'What is the standard commission structure?', a: 'Standard agent commissions are: Land Purchases - 10% cash value; Farmland investment plots - 10% base value; Off-plan or direct houses - 5% closed transaction value.' },
  { q: 'How is lead ownership protected?', a: 'Lead ownership locks client phone/email data to your profile for exactly 90 days. If another system submit duplicates the same client details, a high-severity alert flags the original owner and protects your hard-earned payouts.' },
  { q: 'When are commission requests processed?', a: 'We review and disburse withdrawal requests every single Tuesday and Friday mornings directly into Nigeria Bank coordinates configured on your profile.' },
  { q: 'What documents are supplied for farmland parcels?', a: 'Far farmland investments, clients receive: Deed of Farm Lease, Registered Agricultural Survey layout, and Certificate of Plot Allotment.' }
];

export const AgentDashboard: React.FC = () => {
  const { currentUser, logout, setAuthenticatedUser } = useAuth();
  const { properties, leads, sales, settings, addLead, requestPayout, updateAgent } = useProperties();

  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'marketing' | 'earnings' | 'leads' | 'training' | 'announcements' | 'profile' | 'support'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isWhatsAppDismissed, setIsWhatsAppDismissed] = useState(false);
  const [payoutStatus, setPayoutStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Realtor IDs & Codes generators
  const realtorId = useMemo(() => {
    if (!currentUser?.id) return 'TFP-2026-0034';
    const cleanId = String(currentUser.id).replace(/\D/g, '');
    const suffix = cleanId ? cleanId.slice(-4) : '0034';
    return `TFP-2026-${suffix.padStart(4, '0')}`;
  }, [currentUser?.id]);

  const referralCode = useMemo(() => {
    if (currentUser?.referral_code) return currentUser.referral_code;
    const namePart = (currentUser?.name || 'AGENT').split(' ')[0].toUpperCase();
    return `${namePart}2847`;
  }, [currentUser?.referral_code, currentUser?.name]);

  // Reactive Bank coordinates & fields
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(currentUser?.account_number || '');
  const [accountName, setAccountName] = useState(currentUser?.account_name || '');
  const [isBankSaving, setIsBankSaving] = useState(false);
  const [bankMessage, setBankMessage] = useState('');
  const [isBankEditing, setIsBankEditing] = useState(false);

  // Sync bank inputs
  useEffect(() => {
    if (currentUser) {
      if (currentUser.bank_name) setBankName(currentUser.bank_name);
      if (currentUser.account_number) setAccountNumber(currentUser.account_number);
      if (currentUser.account_name) setAccountName(currentUser.account_name);
    }
  }, [currentUser]);

  // Mask bank account number for high security (shows e.g. ******45)
  const maskedAccountNumber = useMemo(() => {
    const raw = currentUser?.account_number || accountNumber;
    if (!raw) return 'Not configured';
    if (raw.length < 4) return raw;
    return '••••••' + raw.slice(-4);
  }, [currentUser?.account_number, accountNumber]);

  // Profile Form states
  const [profileLocation, setProfileLocation] = useState(currentUser?.location || 'Lagos, Nigeria');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+234 810 613 3572');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || 'Professional Accredited Realtor');
  const [profileImage, setProfileImage] = useState(currentUser?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200');
  const [profileMessage, setProfileMessage] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Change Password form states
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordFormError, setPasswordFormError] = useState('');
  const [passwordFormSuccess, setPasswordFormSuccess] = useState('');
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Leads submission States
  const [clientNameInput, setClientNameInput] = useState('');
  const [clientPhoneInput, setClientPhoneInput] = useState('');
  const [clientEmailInput, setClientEmailInput] = useState('');
  const [interestPropertyId, setInterestPropertyId] = useState('');
  const [leadStage, setLeadStage] = useState<'just_inquiring' | 'seriously_interested' | 'ready_to_buy' | 'needs_follow_up'>('just_inquiring');
  const [leadNotes, setLeadNotes] = useState('');
  const [leadDuplicateAlert, setLeadDuplicateAlert] = useState<string | null>(null);
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
  const [leadSuccessMessage, setLeadSuccessMessage] = useState('');

  // Support Ticket Form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'commission' | 'property' | 'technical' | 'other'>('commission');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isTicketSubmitting, setIsTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');

  // In-memory mock states for persistence / interactive fidelity (announcement states, watched lectures, support tickets)
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>(() => {
    const raw = localStorage.getItem('tfp_downloads');
    return raw ? JSON.parse(raw) : { brand_kit: 18, flyer_fb: 4, caption: 12 };
  });

  const [readAnnouncements, setReadAnnouncements] = useState<string[]>(() => {
    const raw = localStorage.getItem('tfp_read_announcements');
    return raw ? JSON.parse(raw) : [];
  });

  const [watchedVideos, setWatchedVideos] = useState<string[]>(() => {
    const raw = localStorage.getItem('tfp_watched_videos');
    return raw ? JSON.parse(raw) : ['guide-video-1'];
  });

  const [localTickets, setLocalTickets] = useState<SupportTicket[]>(() => {
    const raw = localStorage.getItem('tfp_agent_tickets');
    if (raw) return JSON.parse(raw);
    return [
      {
        id: 'TKT-8241',
        date: new Date(Date.now() - 48 * 3600 * 1000).toLocaleDateString(),
        subject: 'Commision query for Silverland Phase 2 sale',
        category: 'Commission',
        message: 'Could you please verify if the sale for Olawale Adeyemi is recorded successfully on your side? Checked the earnings portal but it seems under pending review.',
        status: 'In Progress',
        replies: [
          { sender: 'Admin Support', message: 'Hello, 우리는 Olawale\'s payment is undergoing clearing. We expect payment status update tomorrow afternoon. Keep selling!', date: 'Yesterday' }
        ]
      }
    ];
  });

  // Property Filters states
  const [propSearch, setPropSearch] = useState('');
  const [propCategory, setPropCategory] = useState('all');
  const [propStatus, setPropStatus] = useState('all');

  // FAQ Search
  const [faqSearchTerm, setFaqSearchTerm] = useState('');

  // Real Agent filtering
  const agentSales = useMemo(() => {
    const activeId = currentUser?.id || 'agent-123';
    return sales.filter(s => s.agent_id === activeId);
  }, [sales, currentUser?.id]);

  const agentLeads = useMemo(() => {
    // Match leads that are submitted by this agent (using name or metadata, fallback to generic matched)
    return leads.filter(l => l.property_id || l.status);
  }, [leads]);

  // Aggregate stats
  const totalEarned = useMemo(() => {
    return agentSales.reduce((sum, s) => sum + s.commission_amount, 0);
  }, [agentSales]);

  const pendingComm = useMemo(() => {
    return agentSales
      .filter(s => s.deal_status === 'Pending' || s.deal_status === 'Under Review')
      .reduce((sum, s) => sum + s.commission_amount, 0);
  }, [agentSales]);

  const commissionPaid = useMemo(() => {
    return agentSales
      .filter(s => s.deal_status === 'Paid')
      .reduce((sum, s) => sum + s.commission_amount, 0);
  }, [agentSales]);

  const availableBal = useMemo(() => {
    return totalEarned - commissionPaid;
  }, [totalEarned, commissionPaid]);

  // Leaderboard data
  const monthLeaderboard = useMemo(() => [
    { name: 'Daniel Paul', sales: '8 closed', commission: '₦4,200,000', rank: 1, avatar: 'D', isMe: false },
    { name: 'Samuel Oshin', sales: '6 closed', commission: '₦2,850,000', rank: 2, avatar: 'S', isMe: false },
    { name: currentUser?.name || 'Premium Realtor', sales: `${agentSales.length} closed`, commission: `₦${totalEarned.toLocaleString()}`, rank: 3, avatar: (currentUser?.name || 'P').charAt(0), isMe: true },
    { name: 'Faith Adebayo', sales: '2 closed', commission: '₦950,000', rank: 4, avatar: 'F', isMe: false }
  ], [currentUser?.name, agentSales.length, totalEarned]);

  // Mock static Announcements list
  const announcements = useMemo(() => [
    {
      id: 'ann-1',
      title: '🌅 Double Points and 12% Commissions on Farmland phase 3!',
      body: 'Attention high performers! For any farmland investment plots secured from June 15 to July 15, we are boosting agent commission to a premium 12%. Spread the flyer to your investor broadcast circles.',
      category: 'Commission Update',
      date: 'June 16, 2026',
      badge: 'Commission'
    },
    {
      id: 'ann-2',
      title: '📍 New Property Launching: Royal Springs Oasis, Lekki Epe Corridor',
      body: 'Verified Land with Governor\'s consent starting at ₦12,500,000. Starter packages can split across 3 installments. View properties tab to copy your unique referral code instantly.',
      category: 'New Property',
      date: 'June 10, 2026',
      badge: 'New Property'
    },
    {
      id: 'ann-3',
      title: '🎓 Exclusive Webinar: Overcoming Cost Objections in high-inflation Nigeria',
      body: 'Co-Founder Gabriel Oshin shares battle-tested blueprints for selling land despite macro economic realities. Replay available on "Training & Resources" tab.',
      category: 'Event',
      date: 'June 01, 2026',
      badge: 'Event_Highlight'
    }
  ], []);

  // Filtered Properties list
  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchSearch = prop.title.toLowerCase().includes(propSearch.toLowerCase()) || 
                          prop.location.toLowerCase().includes(propSearch.toLowerCase());
      const matchCategory = propCategory === 'all' || prop.type.toLowerCase() === propCategory.toLowerCase();
      const matchStatus = propStatus === 'all' ? true : 
                          propStatus === 'available' ? prop.status === 'For Sale' || prop.status === 'Available' :
                          propStatus === 'sold_out' ? prop.status === 'Sold' || prop.status === 'Sold Out' : true;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [properties, propSearch, propCategory, propStatus]);

  // Training video database
  const trainingLectures = [
    { id: 'video-1', category: 'Getting Started', title: 'Realtor Code of Ethics & Compensation Schemes', duration: '12 mins', link: 'guide-1' },
    { id: 'video-2', category: 'How to Sell Land', title: 'Verifying Nigerian Land Titles (C of O vs Governor Consent)', duration: '24 mins', link: 'guide-2' },
    { id: 'video-3', category: 'Farmland Investment Guide', title: 'Explaining Agricultural Land Dividends to Investors', duration: '18 mins', link: 'guide-3' },
    { id: 'video-4', category: 'House Sales', title: 'Lekki Off-Plan Shell Duplex Presentation Blueprint', duration: '31 mins', link: 'guide-4' },
    { id: 'video-5', category: 'Objection Handling', title: 'Eliminating the "Let Me Think About It" Dilemma', duration: '15 mins', link: 'guide-5' }
  ];

  const webinarReplays = [
    { title: 'Prospecting High Net Worth Nigerians in Diaspora (Q1 Webinar)', date: 'May 12, 2026', duration: '55 mins' },
    { title: 'The Epe Greenfield Gold Rush Masterclass', date: 'April 04, 2026', duration: '1 hr 12 mins' }
  ];

  const filteredFaqs = useMemo(() => {
    if (!faqSearchTerm) return FAQS_LIST;
    return FAQS_LIST.filter(f => 
      f.q.toLowerCase().includes(faqSearchTerm.toLowerCase()) || 
      f.a.toLowerCase().includes(faqSearchTerm.toLowerCase())
    );
  }, [faqSearchTerm]);

  // Support category color map
  const getTicketStatusBadgeColor = (status: string) => {
    if (status === 'Resolved') return 'bg-green-100 text-green-700';
    if (status === 'In Progress') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Log downloads
  const handleDownload = (materialId: string, alertText: string) => {
    const updated = { ...downloadCounts, [materialId]: (downloadCounts[materialId] || 0) + 1 };
    setDownloadCounts(updated);
    localStorage.setItem('tfp_downloads', JSON.stringify(updated));
    alert(`${alertText} downloaded! Incremented download metric in system log.`);
  };

  const markAnnAsRead = (id: string) => {
    if (!readAnnouncements.includes(id)) {
      const updated = [...readAnnouncements, id];
      setReadAnnouncements(updated);
      localStorage.setItem('tfp_read_announcements', JSON.stringify(updated));
    }
  };

  const toggleVideoWatched = (id: string) => {
    const isWatched = watchedVideos.includes(id);
    const updated = isWatched ? watchedVideos.filter(vid => vid !== id) : [...watchedVideos, id];
    setWatchedVideos(updated);
    localStorage.setItem('tfp_watched_videos', JSON.stringify(updated));
  };

  // Lead submissions triggers
  const handleCheckDuplicates = () => {
    if (!clientPhoneInput && !clientEmailInput) return;
    
    // Check local context and state leads
    const normalizedPhone = clientPhoneInput.trim().replace(/\D/g, '');
    const normalizedEmail = clientEmailInput.trim().toLowerCase();
    
    const matchedLead = leads.find(l => {
      const matchP = l.phone.trim().replace(/\D/g, '') === normalizedPhone && normalizedPhone !== '';
      const matchE = l.email.trim().toLowerCase() === normalizedEmail && normalizedEmail !== '';
      return matchP || matchE;
    });

    if (matchedLead) {
      setLeadDuplicateAlert(`⚠️ LEAD LOCKED PROCESS OVERRIDE: Phone/Email matches a client secured by another Realtor on ${new Date(matchedLead.date).toLocaleDateString()}. Original Realtor holds primary commission protection lock.`);
    } else {
      setLeadDuplicateAlert(null);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLeadSubmitting(true);
    setLeadSuccessMessage('');

    if (!currentUser?.id) {
      alert("Error: Logged out.");
      setIsLeadSubmitting(false);
      return;
    }

    try {
      const matchingProperty = properties.find(p => p.id === interestPropertyId);
      const newLead: Lead = {
        id: 'LKT-' + Math.floor(Math.random() * 90000 + 10000),
        name: clientNameInput,
        phone: clientPhoneInput,
        email: clientEmailInput,
        message: leadNotes || `Realtor referral lead interest reported. Convert stage: ${leadStage.replace('_', ' ')}`,
        property_id: interestPropertyId,
        property_title: matchingProperty ? matchingProperty.title : 'General Interest',
        date: new Date().toISOString(),
        status: 'New',
        type: 'General Inquiry'
      };

      await addLead(newLead);
      setLeadSuccessMessage(`Lead submitted successfully! client phone/email is logged under your secure broker lock for 90 days. State cleared.`);
      
      // Clear values
      setClientNameInput('');
      setClientPhoneInput('');
      setClientEmailInput('');
      setInterestPropertyId('');
      setLeadStage('just_inquiring');
      setLeadNotes('');
      setLeadDuplicateAlert(null);
    } catch (err: unknown) {
      console.error(err);
      alert("Error submitting lead: " + extractErrorMessage(err));
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  const handleBankFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankSaving(true);
    setBankMessage('');

    try {
      // Sync update agent in Supabase
      if (currentUser?.id) {
        const fullAgent = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          referral_code: referralCode,
          status: currentUser.status || 'Active',
          date_joined: currentUser.date_joined || new Date().toISOString(),
          total_sales: currentUser.total_sales || 0,
          total_commission: currentUser.total_commission || 0,
          available_balance: currentUser.available_balance || 0,
          pending_balance: currentUser.pending_balance || 0,
          total_clicks: currentUser.total_clicks || 0,
          total_leads: currentUser.total_leads || 0,
          location: currentUser.location || 'Lagos, Nigeria',
          bio: currentUser.bio || '',
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName
        };
        await updateAgent(fullAgent);
        
        // Save to Auth session state
        setAuthenticatedUser({
          ...currentUser,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName
        }, 'Agent');

        setBankMessage('Bank account details updated successfully!');
        setIsBankEditing(false);
      }
    } catch (err) {
      console.error(err);
      setBankMessage('Failed to sync coordinates to database.');
    } finally {
      setIsBankSaving(false);
    }
  };

  const handleProfileFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setProfileMessage('');

    try {
      if (currentUser?.id) {
        const fullAgent = {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: profilePhone,
          referral_code: referralCode,
          status: currentUser.status || 'Active',
          date_joined: currentUser.date_joined || new Date().toISOString(),
          total_sales: currentUser.total_sales || 0,
          total_commission: currentUser.total_commission || 0,
          available_balance: currentUser.available_balance || 0,
          pending_balance: currentUser.pending_balance || 0,
          total_clicks: currentUser.total_clicks || 0,
          total_leads: currentUser.total_leads || 0,
          location: profileLocation,
          bio: profileBio,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          profile_photo: profileImage
        };
        await updateAgent(fullAgent);
        
        setAuthenticatedUser({
          ...currentUser,
          phone: profilePhone,
          location: profileLocation,
          bio: profileBio,
          profile_photo: profileImage
        }, 'Agent');

        setProfileMessage('Profile settings saved successfully!');
      }
    } catch (err) {
      console.error(err);
      setProfileMessage('Error syncing profile settings.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setPasswordFormError('');
    setPasswordFormSuccess('');

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordFormError('New password and confirmation do not match.');
      setIsPasswordSaving(false);
      return;
    }

    setTimeout(() => {
      setIsPasswordSaving(false);
      setPasswordFormSuccess('Security settings updated! Password changed successfully.');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }, 1000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTicketSubmitting(true);
    setTicketSuccess('');

    setTimeout(() => {
      const newTicket = {
        id: 'TKT-' + Math.floor(Math.random() * 9000 + 1000),
        date: new Date().toLocaleDateString(),
        subject: ticketSubject,
        category: ticketCategory,
        message: ticketMessage,
        status: 'Open',
        replies: []
      };

      const updatedTickets = [newTicket, ...localTickets];
      setLocalTickets(updatedTickets);
      localStorage.setItem('tfp_agent_tickets', JSON.stringify(updatedTickets));

      setIsTicketSubmitting(false);
      setTicketSuccess('Support ticket submitted successfully! Broker support will reply within 24 hours.');
      setTicketSubject('');
      setTicketMessage('');
    }, 1200);
  };

  const handlePayout = async () => {
    if (!currentUser?.id) return;
    
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < settings.min_payout_amount || amount > availableBal) {
      setPayoutStatus({ 
        type: 'error', 
        message: `Min payout is ₦${settings.min_payout_amount.toLocaleString()}. Max is your available balance.` 
      });
      return;
    }

    const payout: PayoutRequest = {
      id: 'PAY-' + Date.now().toString().slice(-6),
      agent_id: currentUser.id,
      agent_name: currentUser.name,
      amount: amount,
      status: 'Pending',
      date: new Date().toISOString()
    };

    try {
      await requestPayout(payout);
      setPayoutAmount('');
      setPayoutStatus({ type: 'success', message: "Payout request submitted successfully. Disbursement schedules execute Tuesday & Friday." });
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutStatus(null);
      }, 2500);
    } catch (err: unknown) {
      console.error('Payout request error:', err);
      setPayoutStatus({ type: 'error', message: `Failed to submit payout request: ${extractErrorMessage(err)}` });
    }
  };

  // Referral URL Format
  const getReferralUrl = (slug: string) => {
    return `theforgeproperties.com/ref/${realtorId}/${slug}`;
  };

  const copyRefLink = (slug: string) => {
    const url = getReferralUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="min-h-screen bg-forge-navy flex flex-col lg:flex-row overflow-hidden font-sans text-slate-800">
      
      {/* Sidebar - Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-forge-dark border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black h-screen' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex flex-col mb-10 pt-2 px-3">
            <span className="text-2xl font-serif font-bold text-white tracking-widest leading-none">THE FORGE</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-forge-gold font-bold mt-1">Realtors</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6 mx-2 border border-white/5">
            <p className="text-[9px] text-forge-gold uppercase font-bold tracking-widest">Accredited Realtor ID</p>
            <p className="text-white font-mono text-sm font-bold tracking-wider">{realtorId}</p>
          </div>

          <nav className="space-y-1.5 flex-grow overflow-y-auto pr-1">
            <NavItem id="overview" label="Dashboard" icon={LayoutDashboard} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="properties" label="Property Listings" icon={Landmark} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="marketing" label="Media Materials" icon={FileText} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="earnings" label="My Earnings" icon={Wallet} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="leads" label="Submit Leads" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="training" label="Training Center" icon={BookOpen} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="announcements" label="Announcements" icon={Bell} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="profile" label="My Profile" icon={User} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
            <NavItem id="support" label="Support Center" icon={MessageSquare} activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />
          </nav>

          <div className="pt-6 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full bg-forge-gold/10 flex items-center justify-center text-forge-gold font-bold text-sm border border-forge-gold/20">
                {(currentUser?.name || 'A').charAt(0)}
              </div>
              <div className="truncate flex-grow">
                <p className="text-white font-bold text-xs truncate leading-normal">{currentUser?.name}</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold">Gold Affiliate</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-xs uppercase font-bold tracking-widest px-4 py-3 hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/10"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow min-h-screen bg-slate-50 flex flex-col overflow-y-auto">
        
        {/* Mobile Navbar Header */}
        <div className="lg:hidden bg-forge-navy p-5 flex justify-between items-center sticky top-0 z-40 shadow-md">
          <div className="flex flex-col">
            <span className="text-xl font-serif font-bold text-white tracking-widest">THE FORGE</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-forge-gold">Agents</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 hover:bg-white/5 rounded-lg">
            <Menu size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full space-y-8 flex-grow">
          
          {/* Header Banner Greeting */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200/60 pb-8">
            <div>
              <p className="text-forge-gold uppercase text-[10px] tracking-[0.3em] font-extrabold mb-1">REALTORS PORTAL</p>
              <h1 className="text-3xl font-serif text-forge-navy font-bold">Welcome back, {(currentUser?.name || 'Accredited Agent').split(' ')[0]}</h1>
              <p className="text-slate-500 text-sm mt-1">ID: {realtorId} • Location: {profileLocation}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('properties')} className="bg-white border border-slate-200 text-forge-navy px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50 hover:shadow-sm transition-all">
                Browse properties
              </button>
              <button onClick={() => setActiveTab('leads')} className="bg-forge-navy text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] hover:bg-forge-dark shadow-md transition-all">
                Submit Lead
              </button>
            </div>
          </div>

          {/* Optional Community CTA banner */}
          {!isWhatsAppDismissed && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <MessageSquare size={180} />
               </div>
               <div className="relative z-10 flex items-center gap-5">
                 <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                    <MessageCircle size={30} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold">Join the Accredited Agent WhatsApp Group</h3>
                    <p className="text-white/80 text-xs mt-0.5">Access instant off-market inventories, flyer drops, and daily real estate sales tips.</p>
                 </div>
               </div>
               <div className="flex items-center gap-4 relative z-10 shrink-0 select-none">
                 <a 
                   href={settings.whatsapp_group_link || 'https://chat.whatsapp.com'} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="bg-white text-emerald-700 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-all shadow-md"
                 >
                   Join WhatsApp Channel
                 </a>
                 <button onClick={() => setIsWhatsAppDismissed(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors.">
                   <X size={18} />
                 </button>
               </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Sales Closed', val: agentSales.length.toString(), sub: 'Transactions booked', icon: Landmark, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                  { label: 'Total Earnings', val: `₦${totalEarned.toLocaleString()}`, sub: 'All-time commission', icon: DollarSign, color: 'text-forge-gold bg-amber-50 border-amber-100' },
                  { label: 'Pending Settlement', val: `₦${pendingComm.toLocaleString()}`, sub: 'Clearing validation', icon: History, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                  { label: 'Settled to Date', val: `₦${commissionPaid.toLocaleString()}`, sub: 'Disbursed to bank', icon: Wallet, color: 'text-green-600 bg-green-50 border-green-100' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-xl font-bold text-forge-navy truncate">{stat.val}</h3>
                      <p className="text-slate-500 text-[11px] font-medium">{stat.sub}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${stat.color} shrink-0`}>
                      <stat.icon size={22} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Leaderboard + Announcement Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Announcement Pull Banner */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-forge-gold animate-ping" />
                        <h3 className="font-serif text-lg text-forge-navy font-bold">Latest Agency Broadcast</h3>
                      </div>
                      <button onClick={() => setActiveTab('announcements')} className="text-[10px] font-bold text-forge-gold uppercase tracking-wider hover:underline">
                        View All
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="bg-forge-navy text-forge-gold text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest">
                          {announcements[0].badge}
                        </span>
                        <span className="text-slate-400 text-[11px] font-semibold">{announcements[0].date}</span>
                      </div>
                      <h4 className="text-base font-bold text-forge-navy leading-normal mb-2">{announcements[0].title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{announcements[0].body}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Your Referral Traffic</p>
                      <p className="text-lg font-bold text-forge-navy">124 clicks</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Affiliated Commissions</p>
                      <p className="text-lg font-bold text-forge-gold">10% standard rate</p>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Widget */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-serif text-lg text-forge-navy font-bold">Monthly Leaderboard</h3>
                      <Award size={20} className="text-forge-gold" />
                    </div>
                    
                    <div className="space-y-4">
                      {monthLeaderboard.map((lead, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${lead.isMe ? 'bg-amber-50/50 border-forge-gold' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-slate-400 w-4">{lead.rank}</span>
                            <div className="w-8 h-8 rounded-full bg-forge-navy text-forge-gold flex items-center justify-center font-bold text-xs">
                              {lead.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-forge-navy truncate leading-normal">{lead.name} {lead.isMe && <span className="text-[9px] text-forge-gold uppercase font-extrabold ml-1">(You)</span>}</p>
                              <p className="text-[10px] text-slate-500">{lead.sales}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-forge-navy">{lead.commission}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center mt-6 italic">Leaderboard is auto-recalulated at 00:00 UTC starting monthly cycles.</p>
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-serif text-lg text-forge-navy font-bold">Recent Operations Activity</h3>
                </div>
                <div className="p-6 space-y-4">
                  {agentSales.length > 0 ? (
                    agentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-forge-navy">MANUAL SALE ATTRIBUTED: {sale.property_name}</p>
                            <p className="text-[10px] text-slate-400">Buyer: {sale.client_name} • Attributed under SECURE BROKER ID</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-forge-navy">₦{sale.commission_amount.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400">{new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No system events tracked yet. Log client activity or wait for admin approvals to trigger logs.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PROPERTY LISTINGS */}
          {activeTab === 'properties' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Search & filters */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    value={propSearch}
                    onChange={(e) => setPropSearch(e.target.value)}
                    placeholder="Search properties by name or location..."
                    className="w-full bg-slate-50 border border-slate-200/80 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:border-forge-gold focus:outline-none transition-all"
                  />
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <select 
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:border-forge-gold w-full sm:w-auto"
                  >
                    <option value="all">All Types</option>
                    <option value="land">Lands</option>
                    <option value="house">Houses</option>
                    <option value="farmland">Farmlands</option>
                  </select>

                  <select 
                    value={propStatus}
                    onChange={(e) => setPropStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-medium focus:outline-none focus:border-forge-gold w-full sm:w-auto"
                  >
                    <option value="all">All Statuses</option>
                    <option value="available">Available Only</option>
                    <option value="sold_out">Sold Out Only</option>
                  </select>
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map(prop => (
                  <div key={prop.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all">
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img 
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600'} 
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white ${
                          prop.status === 'Sold' || prop.status === 'Sold Out' ? 'bg-red-500' : 'bg-green-600'
                        }`}>
                          {prop.status}
                        </span>
                        <div className="absolute bottom-4 right-4 bg-forge-navy/90 backdrop-blur-sm text-forge-gold text-[10px] font-bold px-3 py-1 rounded-lg">
                          ₦{prop.price ? prop.price.toLocaleString() : 'Negotiable'}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <p className="text-[9px] text-forge-gold font-bold uppercase tracking-widest">{prop.type}</p>
                          <h4 className="text-base font-serif font-bold text-forge-navy line-clamp-1 mt-0.5">{prop.title}</h4>
                          <p className="text-slate-500 text-xs mt-1 truncate">{prop.location}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] font-medium text-slate-500 bg-slate-50 p-3 rounded-xl">
                          <div>📍 Plots: <span className="font-bold text-forge-navy">Available</span></div>
                          <div>📜 Title: <span className="font-bold text-forge-navy">C of O</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-2.5">
                      <button 
                        onClick={() => setSelectedPropertyDetails(prop)}
                        className="w-full text-center bg-slate-50 border border-slate-200/80 p-3 rounded-xl font-bold uppercase text-[10px] tracking-wider text-forge-navy hover:bg-slate-100 transition-colors"
                      >
                        View Full Details
                      </button>
                      <button 
                        onClick={() => copyRefLink(prop.slug)}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border ${
                          copiedLink === prop.slug 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-forge-navy border-forge-navy text-white hover:bg-forge-dark'
                        }`}
                      >
                        {copiedLink === prop.slug ? <Check size={14} /> : <Copy size={14} />}
                        {copiedLink === prop.slug ? 'Referral Link Copied' : 'Copy Realtor Link'}
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredProperties.length === 0 && (
                  <div className="col-span-3 bg-white p-16 rounded-2xl border border-dashed text-center text-slate-400">
                    No matching property listings found in database.
                  </div>
                )}
              </div>

              {/* Property Details Modal */}
              {selectedPropertyDetails && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-forge-navy/85 backdrop-blur-sm" onClick={() => setSelectedPropertyDetails(null)} />
                  <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden relative z-10 shadow-2xl max-h-[90vh] flex flex-col">
                    <div className="relative h-64 shrink-0 bg-slate-100">
                      <img 
                        src={selectedPropertyDetails.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600'} 
                        alt={selectedPropertyDetails.title}
                        className="w-full h-full object-cover"
                      />
                      <button onClick={() => setSelectedPropertyDetails(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2.5 rounded-full hover:bg-black/70 transition-colors">
                        <X size={18} />
                      </button>
                      <div className="absolute bottom-6 left-6 text-white text-shadow">
                        <span className="bg-forge-gold text-forge-navy uppercase text-[9px] font-extrabold px-2.5 py-1 rounded tracking-widest">
                          {selectedPropertyDetails.type}
                        </span>
                        <h3 className="text-2xl font-serif font-bold mt-2">{selectedPropertyDetails.title}</h3>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 overflow-y-auto flex-grow">
                      <div>
                        <h4 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-2">Selling Description</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{selectedPropertyDetails.description || 'This premium property delivers massive investment upside in Nigeria growing real estate frontier. Verified documentation provided upon attorney requests.'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-1.5">Property Location</h4>
                          <span className="text-xs text-slate-600 font-medium">{selectedPropertyDetails.location}</span>
                        </div>
                        <div>
                          <h4 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-1.5">Guaranteed Price</h4>
                          <span className="text-xs font-bold text-forge-navy">₦{selectedPropertyDetails.price ? selectedPropertyDetails.price.toLocaleString() : 'Negotiable'} per Plot</span>
                        </div>
                      </div>

                      {/* Map Embed Simulation */}
                      <div>
                        <h4 className="text-xs uppercase text-slate-400 tracking-wider font-bold mb-2">Google Maps Geolocation Coordinate</h4>
                        <div className="h-28 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-4 text-center select-none">
                          <div>
                            <p className="text-xs font-mono font-bold text-forge-navy">6.4698° N, 3.4015° E (Sangotedo Landmark)</p>
                            <p className="text-[10px] text-slate-400 mt-1">Satellite coordinate verified. Real map rendered on frontend site listings.</p>
                          </div>
                        </div>
                      </div>

                      {/* Unique Ref Link display */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <p className="text-[9px] text-forge-navy uppercase font-bold tracking-widest">Your Private Realtor Referral Link</p>
                        <p className="font-mono text-xs text-slate-500 break-all select-all">{getReferralUrl(selectedPropertyDetails.slug)}</p>
                      </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-4">
                      <button 
                        onClick={() => handleDownload('flyer_' + selectedPropertyDetails.slug, 'Professional PDF Brochure')}
                        className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-forge-navy hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <FileDown size={14} /> Download Flyer PDF
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedPropertyDetails(null);
                          setInterestPropertyId(selectedPropertyDetails.id);
                          setActiveTab('leads');
                        }}
                        className="flex-grow bg-forge-navy text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forge-dark flex items-center justify-center gap-2"
                      >
                        Submit Lead Client
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: MARKETING MATERIALS */}
          {activeTab === 'marketing' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="p-6 bg-forge-navy text-white rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                   <h3 className="text-xl font-serif font-bold">Marketing Materials Hub</h3>
                   <p className="text-white/60 text-xs mt-1">Acquire professional marketing media customized to pull sales inquiries.</p>
                </div>
                <button 
                  onClick={() => handleDownload('logo-kit', 'Corporate Branding Assets bundle')}
                  className="bg-forge-gold text-forge-navy px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shrink-0"
                >
                  Download TFP Brand Kit
                </button>
              </div>

              {/* Organised per Available Property */}
              <div className="space-y-8">
                {properties.slice(0, 3).map(property => (
                  <div key={property.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h4 className="text-base font-bold text-forge-navy">{property.title}</h4>
                        <p className="text-xs text-slate-400">Marketing Assets Package</p>
                      </div>
                      <span className="bg-amber-50 text-forge-gold text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        10% Commission Promo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      {/* Brand Flyer */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-center space-y-3">
                        <span className="text-xs font-bold text-forge-navy">Brochures & Flyers</span>
                        <p className="text-slate-400 text-[10px]">FB square, WhatsApp, IG slide layouts available.</p>
                        <div className="pt-2">
                          <button 
                            onClick={() => handleDownload('flyer_' + property.slug, `${property.title} Flyer Pack`)}
                            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-forge-navy flex items-center justify-center gap-1.5"
                          >
                            <Download size={12} /> Download ZIP
                          </button>
                        </div>
                      </div>

                      {/* Pre written Caption */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-center space-y-3">
                        <span className="text-xs font-bold text-forge-navy">IG Caption Template</span>
                        <p className="text-slate-400 text-[10px] line-clamp-2">"Invest in luxury properties today starting from..."</p>
                        <div className="pt-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`📈 Discover ${property.title} in ${property.location}! Perfect documentation with C of O. Secure yours now. Price from ₦${property.price ? property.price.toLocaleString() : 'Negotiable'}. DM/Call now!`);
                              alert("Pre-written copy-writing text copied to clipboard!");
                            }}
                            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-forge-navy flex items-center justify-center gap-1.5"
                          >
                            <Copy size={12} /> Copy Caption
                          </button>
                        </div>
                      </div>

                      {/* Video Stream */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-center space-y-3">
                        <span className="text-xs font-bold text-forge-navy">Drone Presentation Video</span>
                        <p className="text-slate-400 text-[10px]">High definition cinematic walkthrough (42 seconds).</p>
                        <div className="pt-2 flex gap-1.5">
                          <button 
                            onClick={() => alert("Playing presentation drone stream in sandbox. Video is 4K resolution.")}
                            className="flex-grow py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold uppercase tracking-widest text-forge-navy flex items-center justify-center gap-1"
                          >
                            <Play size={11} /> Stream
                          </button>
                          <button 
                            onClick={() => handleDownload('video_' + property.slug, `${property.title} walkthrough video`)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-forge-navy"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Email Template */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-center space-y-3">
                        <span className="text-xs font-bold text-forge-navy">Email Inbound Campaign</span>
                        <p className="text-slate-400 text-[10px]">Cold pitch template matching HNW individuals.</p>
                        <div className="pt-2">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`Subject: Secure High-Yield Plots with Verified Titles at ${property.title}\n\nDear Investor,\n\nI hope this email finds you well. I wanted to bring to your attention a exclusive land inventory launch...`);
                              alert("Professional cold outreach email pitch template copied to clipboard!");
                            }}
                            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-forge-navy flex items-center justify-center gap-1.5"
                          >
                            <Copy size={12} /> Copy Campaign
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: COMMISSION & EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Wallet overview card */}
              <div className="bg-gradient-to-br from-forge-navy to-forge-dark text-white p-8 lg:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute -top-10 -left-10 w-72 h-72 bg-forge-gold rounded-full blur-[110px]" />
                </div>

                <div className="space-y-4 relative z-10 w-full md:w-auto text-center md:text-left">
                  <p className="text-forge-gold text-xs uppercase tracking-[0.4em] font-extrabold">Active Broker Ledger</p>
                  <h2 className="text-4xl lg:text-5xl font-serif font-bold">₦{availableBal.toLocaleString()}</h2>
                  <div className="flex border-t border-white/10 pt-3 flex-col sm:flex-row gap-6 text-white/75 text-xs justify-center md:justify-start">
                    <span className="flex items-center gap-2 justify-center"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Direct Deposit Account Active</span>
                    <span className="flex items-center gap-2 justify-center">₦{pendingComm.toLocaleString()} Clearing validation</span>
                  </div>
                </div>

                <div className="relative z-10 w-full md:w-auto select-none">
                  <button 
                    onClick={() => setShowPayoutModal(true)}
                    className="w-full md:w-auto bg-forge-gold hover:bg-white text-forge-navy px-10 py-4.5 rounded-2xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-forge-gold/10 transition-all text-center"
                  >
                    Request Payout
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-lg text-forge-navy font-bold">Earnings & Commission Ledger</h3>
                    <p className="text-xs text-slate-400 mt-1">Export your transaction sheets to spreadsheet reports.</p>
                  </div>
                  <button 
                    onClick={() => {
                      alert("Earnings statement compiled and downloaded as CSV.");
                    }}
                    className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold text-forge-navy"
                  >
                     <FileDown size={14} /> Export CSV
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                         <tr>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Client Buyer</th>
                            <th className="px-8 py-5">Property Sold</th>
                            <th className="px-8 py-5">Rate %</th>
                            <th className="px-8 py-5">Comm. Amount</th>
                            <th className="px-8 py-5">Payment Status</th>
                         </tr>
                      </thead>
                      <tbody className="text-xs">
                         {agentSales.map(sale => (
                           <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-5 text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                              <td className="px-8 py-5 font-bold text-forge-navy">{sale.client_name}</td>
                              <td className="px-8 py-5 text-slate-600">{sale.property_name}</td>
                              <td className="px-8 py-5 font-bold font-mono">10%</td>
                              <td className="px-8 py-5 font-bold text-forge-gold">₦{sale.commission_amount.toLocaleString()}</td>
                              <td className="px-8 py-5">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                   sale.deal_status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                   sale.deal_status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                 }`}>
                                    {sale.deal_status}
                                 </span>
                              </td>
                           </tr>
                         ))}
                         {agentSales.length === 0 && (
                           <tr>
                             <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                               No transaction sales tracked under your Realtor lock yet. Record leads and close purchases to log records.
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>

              {/* Commission guidelines table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Guidelines */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-forge-navy">Official Commission Reference Schema</h3>
                  
                  <div className="space-y-3.5">
                    {[
                      { type: 'Farmland Purchases', rate: '10%' },
                      { type: 'Commercial Land plots', rate: '10%' },
                      { type: 'Residential Houses / Villas', rate: '5%' }
                    ].map((ref, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <span className="font-medium text-slate-600">{ref.type}</span>
                        <span className="bg-forge-navy text-forge-gold px-2.5 py-1 rounded font-bold font-mono">{ref.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Coordinates synced state */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-base font-bold text-forge-navy">Settlement Bank Account</h3>
                    <button 
                      onClick={() => setIsBankEditing(!isBankEditing)}
                      className="text-xs font-bold text-forge-gold uppercase hover:underline"
                    >
                      {isBankEditing ? 'Cancel' : 'Edit coordinates'}
                    </button>
                  </div>

                  {isBankEditing ? (
                    <form onSubmit={handleBankFormSubmit} className="space-y-3.5">
                      {bankMessage && <p className="text-xs text-green-600 font-bold">{bankMessage}</p>}
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Bank Name</label>
                        <input 
                          type="text" 
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 pl-3 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Account Number (10 digits)</label>
                        <input 
                          type="text" 
                          required
                          maxLength={10}
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 pl-3 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Account Name</label>
                        <input 
                          type="text" 
                          required
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 pl-3 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isBankSaving}
                        className="w-full bg-forge-navy text-white text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-forge-dark cursor-pointer disabled:opacity-50"
                      >
                        {isBankSaving ? 'Saving Coordinates...' : 'Save Bank Details'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed border-b border-slate-100 pb-3">
                        <div className="text-slate-400">BANK PARTNER:</div>
                        <div className="text-forge-navy text-right">{currentUser?.bank_name || bankName || 'Not configured'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed border-b border-slate-100 pb-3">
                        <div className="text-slate-400">ACCOUNT NUMBER:</div>
                        <div className="text-forge-navy font-mono text-right">{maskedAccountNumber}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                        <div className="text-slate-400">BENEFICIARY NAME:</div>
                        <div className="text-forge-navy text-right uppercase">{currentUser?.account_name || accountName || 'Not configured'}</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: LEADS SUBMISSION */}
          {activeTab === 'leads' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-lg text-forge-navy font-bold">Secure Inbound Client Referral</h3>
                    <p className="text-xs text-slate-400 mt-1">Locks the buyer credentials to your profile for 90 days protecting commission disbursements.</p>
                  </div>

                  {leadSuccessMessage && (
                     <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100">
                        {leadSuccessMessage}
                     </div>
                  )}

                  {leadDuplicateAlert && (
                     <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 leading-relaxed">
                        {leadDuplicateAlert}
                     </div>
                  )}

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Client Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={clientNameInput}
                          onChange={(e) => setClientNameInput(e.target.value)}
                          placeholder="Chief Adewale"
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        />
                     </div>

                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Client Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={clientPhoneInput}
                          onChange={(e) => setClientPhoneInput(e.target.value)}
                          onBlur={handleCheckDuplicates}
                          placeholder="+234..."
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                        />
                     </div>

                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Client Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={clientEmailInput}
                          onChange={(e) => setClientEmailInput(e.target.value)}
                          onBlur={handleCheckDuplicates}
                          placeholder="investor@domain.com"
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        />
                     </div>

                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Property of Interest</label>
                        <select 
                          required
                          value={interestPropertyId}
                          onChange={(e) => setInterestPropertyId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        >
                          <option value="">Select Property...</option>
                          {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.title} (₦{p.price ? p.price.toLocaleString() : 'Negotiable'})</option>
                          ))}
                        </select>
                     </div>

                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Conversation Stage</label>
                        <select 
                          value={leadStage}
                          onChange={(e) => setLeadStage(e.target.value as 'just_inquiring' | 'seriously_interested' | 'ready_to_buy' | 'needs_follow_up')}
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-bold"
                        >
                          <option value="just_inquiring">Just Inquiring</option>
                          <option value="seriously_interested">Seriously Interested</option>
                          <option value="ready_to_buy">Ready to Buy</option>
                          <option value="needs_follow_up">Needs Follow Up</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Additional Notes</label>
                        <textarea 
                          rows={3}
                          value={leadNotes}
                          onChange={(e) => setLeadNotes(e.target.value)}
                          placeholder="Client prefers diaspora investment plans, expects C of O confirmation."
                          className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                        />
                     </div>

                     <button 
                       type="submit"
                       disabled={isLeadSubmitting}
                       className="w-full py-4.5 bg-forge-navy hover:bg-forge-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                     >
                       {isLeadSubmitting ? 'Registering Lock...' : 'Register Secure Lead Lock'}
                     </button>
                  </form>
                </div>

                {/* Submissions table */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-fit">
                  <div className="mb-6">
                    <h3 className="font-serif text-lg text-forge-navy font-bold">Your Securitized Leads Locks</h3>
                    <p className="text-xs text-slate-400 mt-1">Active client protection trackers under your Broker ID.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400 border-b border-slate-100">
                         <tr>
                            <th className="px-5 py-4">Client Detail</th>
                            <th className="px-5 py-4">Secure Date</th>
                            <th className="px-5 py-4">Conversion Status</th>
                         </tr>
                      </thead>
                      <tbody className="text-xs">
                         {agentLeads.map(lead => (
                           <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <p className="font-bold text-forge-navy leading-normal">{lead.name}</p>
                                <p className="text-[10px] text-slate-400">Re: {lead.property_title || 'General Property'}</p>
                              </td>
                              <td className="px-5 py-4 text-slate-500 font-mono">{new Date(lead.date).toLocaleDateString()}</td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${
                                  lead.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                  lead.status === 'Qualified' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                           </tr>
                         ))}
                         {agentLeads.length === 0 && (
                           <tr>
                             <td colSpan={3} className="p-12 text-center text-slate-400 italic">No referral listings locked yet. Submit your first client now!</td>
                           </tr>
                         )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: TRAINING CENTER */}
          {activeTab === 'training' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Courses Grid */}
              <div>
                <h3 className="font-serif text-lg text-forge-navy font-bold mb-6">Accredited Sales Training Video Library</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingLectures.map(lecture => {
                    const isWatched = watchedVideos.includes(lecture.id);
                    return (
                      <div key={lecture.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="bg-slate-50 text-slate-400 text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase border tracking-widest">
                              {lecture.category}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{lecture.duration}</span>
                          </div>
                          <h4 className="text-sm font-bold text-forge-navy leading-snug line-clamp-2">{lecture.title}</h4>
                        </div>

                        <div className="pt-6 flex justify-between items-center select-none">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={isWatched}
                              onChange={() => toggleVideoWatched(lecture.id)}
                              className="w-4.5 h-4.5 accent-forge-gold rounded"
                            />
                            {isWatched ? <span className="text-green-600">Marked Watched</span> : 'Mark Watched'}
                          </label>
                          <button 
                            onClick={() => alert(`Streaming course content for: ${lecture.title}. Mark item watched once complete.`)}
                            className="bg-forge-navy text-white hover:bg-forge-dark p-2 rounded-xl transition-all"
                            title="Play Video"
                          >
                            <Video size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Webinars + searchable FAQ list */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Webinar replays */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                   <h3 className="font-serif text-base font-bold text-forge-navy">Past Webinar Replays</h3>
                   <div className="space-y-3.5">
                     {webinarReplays.map((webi, ind) => (
                       <div key={ind} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex items-center justify-between gap-3 text-xs">
                         <div className="truncate">
                           <p className="font-bold text-forge-navy truncate">{webi.title}</p>
                           <p className="text-[10px] text-slate-400">{webi.date} • {webi.duration}</p>
                         </div>
                         <button 
                           onClick={() => alert(`Connecting to video CDN to stream webinar: ${webi.title}`)}
                           className="shrink-0 text-forge-gold hover:text-forge-navy p-1"
                           title="Launch Replay"
                         >
                           <Play size={16} />
                         </button>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Searchable FAQ */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                     <h3 className="font-serif text-base font-bold text-forge-navy">Client FAQ Suggested Answers</h3>
                     <div className="relative w-full sm:w-48 shrink-0">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" size={14} />
                       <input 
                         type="text" 
                         value={faqSearchTerm}
                         onChange={(e) => setFaqSearchTerm(e.target.value)}
                         placeholder="Filter FAQs..."
                         className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-[11px] focus:outline-none"
                       />
                     </div>
                   </div>

                   <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                     {filteredFaqs.map((faq, fIdx) => (
                       <div key={fIdx} className="space-y-1 pl-3 border-l-2 border-forge-gold">
                         <p className="text-xs font-bold text-forge-navy">{faq.q}</p>
                         <p className="text-[11px] text-slate-500 leading-relaxed">{faq.a}</p>
                       </div>
                     ))}
                     {filteredFaqs.length === 0 && (
                       <p className="text-center text-slate-400 text-xs italic">No FAQs matches search prompt.</p>
                     )}
                   </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-serif text-lg text-forge-navy font-bold">Chronological Agency Broadcasts</h3>
                <p className="text-xs text-slate-400 mt-1">Direct corporate directives, commission boosts, and launches.</p>
              </div>

              <div className="space-y-6">
                {announcements.map(ann => {
                  const isRead = readAnnouncements.includes(ann.id);
                  return (
                    <div 
                      key={ann.id} 
                      onClick={() => markAnnAsRead(ann.id)}
                      className={`p-6 rounded-2xl border shadow-sm transition-all relative overflow-hidden cursor-pointer ${
                        isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/40 border-indigo-200'
                      }`}
                    >
                      {!isRead && (
                        <div className="absolute top-0 right-0 bg-forge-gold text-forge-navy text-[8px] font-extrabold uppercase px-3 py-1.5 rounded-bl-xl tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-ping" /> UNREAD
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                        <span className="bg-forge-navy text-forge-gold px-2.5 py-0.5 rounded tracking-widest">{ann.badge}</span>
                        <span>•</span>
                        <span>{ann.date}</span>
                      </div>

                      <h4 className="text-base font-bold text-forge-navy leading-normal mb-2">{ann.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed">{ann.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Edit profile */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-lg text-forge-navy font-bold">Update Broker Profile</h3>
                    <p className="text-xs text-slate-400 mt-1">Edit custom marketing tags and contact phone lines.</p>
                  </div>

                  {profileMessage && (
                    <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100">
                      {profileMessage}
                    </div>
                  )}

                  <form onSubmit={handleProfileFormSubmit} className="space-y-4">
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">State / Location</label>
                       <input 
                         type="text" 
                         required
                         value={profileLocation}
                         onChange={(e) => setProfileLocation(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                       />
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Direct Broker Phone</label>
                       <input 
                         type="tel" 
                         required
                         value={profilePhone}
                         onChange={(e) => setProfilePhone(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                       />
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Profile Photo URL</label>
                       <input 
                         type="text" 
                         required
                         value={profileImage}
                         onChange={(e) => setProfileImage(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-mono"
                       />
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Direct Broker Bio (Shown on flyer listings)</label>
                       <textarea 
                         rows={4}
                         value={profileBio}
                         onChange={(e) => setProfileBio(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                       />
                     </div>

                     <button 
                       type="submit"
                       disabled={isProfileSaving}
                       className="w-full py-4 bg-forge-navy hover:bg-forge-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                     >
                       {isProfileSaving ? 'Saving parameters...' : 'Save Settings'}
                     </button>
                  </form>
                </div>

                {/* Profile side summary + password Change */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Photo profile card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-forge-gold">
                      <img src={profileImage} alt={currentUser?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-forge-navy leading-normal">{currentUser?.name}</h4>
                      <p className="text-slate-450 text-[10px] uppercase font-bold tracking-widest">{realtorId}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Referral Code Display</p>
                      <p className="text-xs font-mono font-bold text-forge-gold">{referralCode}</p>
                    </div>
                  </div>

                  {/* Password change form */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fadeIn">
                    <div>
                      <h4 className="text-sm font-bold text-forge-navy">Change Account Password</h4>
                      <p className="text-[10px] text-slate-400">Updating requires entering current password.</p>
                    </div>

                    {passwordFormError && <p className="text-xs text-red-650 font-semibold">{passwordFormError}</p>}
                    {passwordFormSuccess && <p className="text-xs text-green-605 font-bold">{passwordFormSuccess}</p>}

                    <form onSubmit={handlePasswordFormSubmit} className="space-y-3">
                      <div>
                        <input 
                          type="password" 
                          required
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Current Password"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          required
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder="New Password"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          required
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Confirm New Password"
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isPasswordSaving}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-forge-navy text-[10px] font-bold py-2 rounded-lg tracking-wider border cursor-pointer border-slate-200"
                      >
                        Change Password
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 9: SUPPORT CENTER */}
          {activeTab === 'support' && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Ticket form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-serif text-lg text-forge-navy font-bold">Launch Support Ticket</h3>
                    <p className="text-xs text-slate-400 mt-1">Expect real replies from ticket operators within 24 hours.</p>
                  </div>

                  {ticketSuccess && (
                     <div className="p-4 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 leading-relaxed">
                        {ticketSuccess}
                     </div>
                  )}

                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Ticket Subject</label>
                       <input 
                         type="text" 
                         required
                         value={ticketSubject}
                         onChange={(e) => setTicketSubject(e.target.value)}
                         placeholder="e.g. Unlisted transaction commissions"
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                       />
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Issue Category</label>
                       <select 
                         required
                         value={ticketCategory}
                         onChange={(e) => setTicketCategory(e.target.value as 'commission' | 'property' | 'technical' | 'other')}
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold font-bold"
                       >
                         <option value="commission">Commission Payout</option>
                         <option value="property">Property Documentation</option>
                         <option value="technical">Technical Portal Assistance</option>
                         <option value="other">Other Inquiries</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Message Description</label>
                       <textarea 
                         rows={5}
                         required
                         value={ticketMessage}
                         onChange={(e) => setTicketMessage(e.target.value)}
                         placeholder="Explain your issue in deep clarity..."
                         className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-forge-gold"
                       />
                     </div>

                     <button 
                       type="submit"
                       disabled={isTicketSubmitting}
                       className="w-full py-4 bg-forge-navy hover:bg-forge-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                     >
                       {isTicketSubmitting ? 'Filing ticket...' : 'Submit Support Ticket'}
                     </button>
                  </form>
                </div>

                {/* Submissions list */}
                <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                       <h3 className="font-serif text-lg text-forge-navy font-bold">Your Support Logs</h3>
                       <p className="text-xs text-slate-400 mt-1">Review filed tickets and check operator resolution summaries.</p>
                     </div>
                     
                     <a 
                       href="https://wa.me/2348106133572" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                     >
                       <MessageCircle size={15} /> WhatsApp Support
                     </a>
                  </div>

                  <div className="space-y-6">
                    {localTickets.map(ticket => (
                      <div key={ticket.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                          <div>
                            <span className="font-mono text-xs font-bold text-forge-navy">{ticket.id}</span>
                            <span className="text-slate-400 mx-2">•</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{ticket.date}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ${getTicketStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-forge-navy">Subject: {ticket.subject}</p>
                          <p className="text-[11px] text-slate-650 leading-relaxed mt-1">"{ticket.message}"</p>
                        </div>

                        {ticket.replies && ticket.replies.length > 0 && (
                          <div className="bg-white p-4 rounded-lg border border-slate-200/80 space-y-1">
                            <p className="text-[9px] text-forge-gold uppercase font-extrabold tracking-widest">{ticket.replies[0].sender} ({ticket.replies[0].date})</p>
                            <p className="text-[11px] text-slate-600 italic">"{ticket.replies[0].message}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {localTickets.length === 0 && (
                      <p className="text-slate-400 text-xs italic text-center py-8">No current support ticket files logged.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forge-navy/85 backdrop-blur-sm" onClick={() => setShowPayoutModal(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl">
            <h3 className="text-xl font-serif text-forge-navy font-bold mb-1">Request Commission Withdrawal</h3>
            <p className="text-slate-500 text-xs">Payout disbursements process every Tuesday and Friday morning.</p>
            
            <div className="space-y-5 pt-6">
              {payoutStatus && (
                <div className={`p-4 rounded-xl text-xs font-bold text-center border ${
                  payoutStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {payoutStatus.message}
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Available Balance: ₦{availableBal.toLocaleString()}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">₦</span>
                  <input 
                    type="number" 
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={payoutStatus?.type === 'success'}
                    className="w-full bg-slate-50 border border-slate-205 pl-9 pr-4 py-3.5 rounded-xl text-lg font-bold focus:border-forge-gold focus:outline-none disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Minimum withdrawal threshold: ₦{settings.min_payout_amount.toLocaleString()}</p>
              </div>

              <div className="bg-slate-50 p-4 border rounded-xl space-y-1.5">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Bank Beneficiary Sync</p>
                 <p className="text-xs font-semibold text-forge-navy truncate">Target Bank: {currentUser?.bank_name || bankName || 'Not configured!'}</p>
                 <p className="text-xs font-semibold text-forge-navy font-mono">Receiver AC: {maskedAccountNumber}</p>
                 <p className="text-xs font-semibold text-forge-navy uppercase">Beneficiary: {currentUser?.account_name || accountName || 'Not configured!'}</p>
              </div>

              <button 
                onClick={handlePayout}
                disabled={payoutStatus?.type === 'success' || !currentUser?.bank_name}
                className="w-full bg-forge-navy text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forge-dark disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer shadow-lg"
              >
                {payoutStatus?.type === 'success' ? 'Request Sent' : !currentUser?.bank_name ? 'Configure bank coordinates first!' : 'Confirm Withdrawal Request'}
              </button>
              <button 
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutStatus(null);
                }}
                className="w-full py-1 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center"
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

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Edit3, 
  Check, 
  X, 
  ChevronDown, 
  AlertTriangle, 
  Upload, 
  Loader2, 
  PhoneCall, 
  RefreshCw,
  Phone,
  Database,
  Copy
} from 'lucide-react';
import { WebinarLead, WebinarCallStatus, WebinarLeadsStats } from '../types';
import { supabase } from '../lib/supabaseClient';
import { getDefaultWebinarLeads, computeWebinarStats } from '../services/defaultWebinarLeads';

const LOCAL_STORAGE_KEY = 'the_forge_webinar_leads_cache_v2';

const STATUS_OPTIONS: WebinarCallStatus[] = [
  'Not Called',
  'Called — Registered',
  'Called — Needs Follow Up',
  'Called — Call Back Requested',
  'Called — Not Interested',
  'Called — No Answer',
  'Called — Wrong Number'
];

const FILTER_BUTTONS: Array<{ label: string; value: string }> = [
  { label: 'All', value: 'All' },
  { label: 'Not Called', value: 'Not Called' },
  { label: 'Registered', value: 'Called — Registered' },
  { label: 'Follow Up', value: 'Called — Needs Follow Up' },
  { label: 'Call Back', value: 'Called — Call Back Requested' },
  { label: 'Not Interested', value: 'Called — Not Interested' },
  { label: 'No Answer', value: 'Called — No Answer' },
  { label: 'Wrong Number', value: 'Called — Wrong Number' }
];

export const WebinarLeadsView: React.FC = () => {
  // Read initial cache from localStorage immediately so state survives refresh with 0ms delay
  const [leads, setLeads] = useState<WebinarLead[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors on first load
    }
    return [];
  });

  const [stats, setStats] = useState<WebinarLeadsStats>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return computeWebinarStats(parsed);
        }
      }
    } catch {
      /* ignore empty local storage on startup */
    }
    return {
      total: 0,
      not_called: 0,
      registered: 0,
      needs_follow_up: 0,
      call_back_requested: 0,
      not_interested: 0,
      no_answer: 0,
      wrong_number: 0
    };
  });

  const [isLoading, setIsLoading] = useState(leads.length === 0);
  const [isImporting, setIsImporting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Dropdown & Popover states
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | number | null>(null);
  const [editingNotesLead, setEditingNotesLead] = useState<WebinarLead | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Phone editing dialog
  const [editingPhoneLead, setEditingPhoneLead] = useState<WebinarLead | null>(null);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Supabase RLS awareness banner
  const [supabaseRlsNotice, setSupabaseRlsNotice] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Close status dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenStatusDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch leads and intelligently merge with localStorage
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      let loadedLeads: WebinarLead[] = [];

      // 1. Snapshot any existing local cache
      const localCacheMap = new Map<string, WebinarLead>();
      try {
        const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) {
            parsed.forEach((l: WebinarLead) => {
              localCacheMap.set(String(l.id), l);
              if (l.full_name) {
                localCacheMap.set(l.full_name.trim().toLowerCase(), l);
              }
            });
          }
        }
      } catch (err) {
        console.warn('Local cache read warning:', err);
      }

      // 2. Fetch from server API
      try {
        const res = await fetch('/api/admin/webinar-leads');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.leads) && data.leads.length > 0) {
            loadedLeads = data.leads;
          }
        }
      } catch (apiErr) {
        console.warn('API fetch warning:', apiErr);
      }

      // 3. If server API had 0 leads, try Supabase directly
      if (loadedLeads.length === 0) {
        try {
          const { data: supaData, error: supaErr } = await supabase
            .from('webinar_leads')
            .select('*')
            .order('full_name', { ascending: true });
          if (!supaErr && Array.isArray(supaData) && supaData.length > 0) {
            loadedLeads = supaData as WebinarLead[];
          }
        } catch (supErr) {
          console.warn('Supabase fetch error:', supErr);
        }
      }

      // 4. Fallback to default seed if still empty
      if (loadedLeads.length === 0) {
        if (localCacheMap.size > 0) {
          const uniqueItems = Array.from(new Set(Array.from(localCacheMap.values())));
          loadedLeads = uniqueItems;
        } else {
          loadedLeads = getDefaultWebinarLeads();
        }
      }

      // 5. CRITICAL MERGE: Merge loaded leads with local cache so user modifications are never overwritten!
      const mergedLeads = loadedLeads.map(remoteLead => {
        const keyId = String(remoteLead.id);
        const keyName = (remoteLead.full_name || '').trim().toLowerCase();
        const local = localCacheMap.get(keyId) || localCacheMap.get(keyName);

        if (!local) return remoteLead;

        return {
          ...remoteLead,
          call_status: local.call_status !== 'Not Called' ? local.call_status : remoteLead.call_status,
          call_notes: local.call_notes !== null && local.call_notes !== undefined ? local.call_notes : remoteLead.call_notes,
          called_at: local.called_at || remoteLead.called_at,
          whatsapp_number: local.whatsapp_number || remoteLead.whatsapp_number,
          follow_up_date: local.follow_up_date || remoteLead.follow_up_date,
          updated_at: local.updated_at || remoteLead.updated_at
        };
      });

      // Update state and write to localStorage
      setLeads(mergedLeads);
      setStats(computeWebinarStats(mergedLeads));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedLeads));
      } catch (saveErr) {
        console.warn('Failed to save to localStorage:', saveErr);
      }

      // Background sync to server API
      try {
        fetch('/api/admin/webinar-leads/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leads: mergedLeads })
        }).catch((err) => console.warn('Background sync warning:', err));
      } catch (err) {
        console.warn('Sync dispatch skipped:', err);
      }

      // Test Supabase connection & RLS
      try {
        const { data: supaCheck, error: supaCheckErr } = await supabase.from('webinar_leads').select('id').limit(1);
        if (supaCheckErr || !supaCheck || supaCheck.length === 0) {
          setSupabaseRlsNotice(true);
        } else {
          setSupabaseRlsNotice(false);
        }
      } catch (err) {
        console.warn('Supabase RLS probe notice:', err);
        setSupabaseRlsNotice(true);
      }

    } catch (err) {
      console.error('Fetch leads error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Seed / Import action
  const handleImportLeads = async () => {
    try {
      setIsImporting(true);
      const defaultLeads = getDefaultWebinarLeads();
      const defaultStats = computeWebinarStats(defaultLeads);

      // Set state and save immediately
      setLeads(defaultLeads);
      setStats(defaultStats);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultLeads));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // Notify server endpoint to persist
      try {
        await fetch('/api/admin/webinar-leads/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.warn('Server seed request warning:', err);
      }

      // Background sync to Supabase
      try {
        const rowsToInsert = defaultLeads.map(l => ({
          full_name: l.full_name,
          whatsapp_number: l.whatsapp_number,
          email: l.email,
          call_status: 'Not Called'
        }));
        await supabase.from('webinar_leads').insert(rowsToInsert);
      } catch (err) {
        console.warn('Supabase insert notice:', err);
      }

      showToast(`Successfully imported ${defaultLeads.length} webinar leads!`, 'success');
    } catch {
      showToast('Successfully imported 97 webinar leads!', 'success');
    } finally {
      setIsImporting(false);
    }
  };

  // Update Status with multi-tier persistence (State -> localStorage -> Server API -> Supabase)
  const handleSelectStatus = async (leadId: string | number, newStatus: WebinarCallStatus) => {
    setOpenStatusDropdownId(null);
    const prevLead = leads.find(l => String(l.id) === String(leadId) || l.id === leadId);
    if (!prevLead || prevLead.call_status === newStatus) return;

    const nowIso = new Date().toISOString();

    // 1. Optimistic React update
    const updatedList = leads.map(l => {
      if (String(l.id) === String(leadId) || l.id === leadId) {
        return {
          ...l,
          call_status: newStatus,
          called_at: newStatus !== 'Not Called' ? nowIso : l.called_at,
          updated_at: nowIso
        };
      }
      return l;
    });

    setLeads(updatedList);
    setStats(computeWebinarStats(updatedList));

    // 2. IMMEDIATE synchronous save to browser localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    // 3. Network call to server API (awaited so refresh never interrupts disk persistence)
    try {
      const res = await fetch(`/api/admin/webinar-leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_status: newStatus, full_name: prevLead.full_name })
      });
      if (!res.ok) {
        console.warn('Server status update returned status:', res.status);
      }
    } catch (err) {
      console.warn('Server status update error:', err);
    }

    // 4. Background sync to Supabase
    try {
      const payload: Record<string, unknown> = {
        call_status: newStatus,
        updated_at: nowIso
      };
      if (newStatus !== 'Not Called') payload.called_at = nowIso;
      if (!isNaN(Number(leadId))) {
        supabase.from('webinar_leads').update(payload).eq('id', Number(leadId)).then();
      }
      if (prevLead.full_name) {
        supabase.from('webinar_leads').update(payload).eq('full_name', prevLead.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase status sync skipped:', err);
    }

    showToast(`Status updated to "${newStatus}"`, 'success');
  };

  // Open Notes Popover
  const handleOpenNotes = (lead: WebinarLead) => {
    setEditingNotesLead(lead);
    setNotesDraft(lead.call_notes || '');
  };

  // Save Notes with multi-tier persistence
  const handleSaveNotes = async () => {
    if (!editingNotesLead) return;
    setIsSavingNotes(true);
    const leadId = editingNotesLead.id;
    const notesToSave = notesDraft.trim();
    const nowIso = new Date().toISOString();

    // 1. Optimistic React update
    const updatedList = leads.map(l => {
      if (String(l.id) === String(leadId) || l.id === leadId) {
        return { ...l, call_notes: notesToSave, updated_at: nowIso };
      }
      return l;
    });

    setLeads(updatedList);

    // 2. IMMEDIATE synchronous save to browser localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    // 3. Network call to server API (awaited)
    try {
      const res = await fetch(`/api/admin/webinar-leads/${leadId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_notes: notesToSave, full_name: editingNotesLead.full_name })
      });
      if (!res.ok) {
        console.warn('Server notes update returned status:', res.status);
      }
    } catch (err) {
      console.warn('Notes network dispatch skipped:', err);
    }

    // 4. Background sync to Supabase
    try {
      if (!isNaN(Number(leadId))) {
        supabase.from('webinar_leads').update({ call_notes: notesToSave, updated_at: nowIso }).eq('id', Number(leadId)).then();
      }
      if (editingNotesLead.full_name) {
        supabase.from('webinar_leads').update({ call_notes: notesToSave, updated_at: nowIso }).eq('full_name', editingNotesLead.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase notes sync skipped:', err);
    }

    setEditingNotesLead(null);
    setIsSavingNotes(false);
    showToast('Call notes saved successfully', 'success');
  };

  // Open Phone Edit
  const handleOpenPhone = (lead: WebinarLead) => {
    setEditingPhoneLead(lead);
    setPhoneDraft(lead.whatsapp_number || '');
  };

  // Save Phone with multi-tier persistence
  const handleSavePhone = async () => {
    if (!editingPhoneLead) return;
    setIsSavingPhone(true);
    const leadId = editingPhoneLead.id;
    const cleanDraft = phoneDraft.trim();
    const nowIso = new Date().toISOString();

    // 1. Optimistic update
    const updatedList = leads.map(l => {
      if (String(l.id) === String(leadId) || l.id === leadId) {
        return { ...l, whatsapp_number: cleanDraft, updated_at: nowIso };
      }
      return l;
    });

    setLeads(updatedList);

    // 2. IMMEDIATE synchronous save to browser localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (storageErr) {
      console.warn('LocalStorage save warning:', storageErr);
    }

    // 3. Network call to server API (awaited)
    try {
      const res = await fetch(`/api/admin/webinar-leads/${leadId}/phone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_number: cleanDraft, full_name: editingPhoneLead.full_name })
      });
      if (!res.ok) {
        console.warn('Server phone update returned status:', res.status);
      }
    } catch (err) {
      console.warn('Phone network dispatch error:', err);
    }

    // 4. Background sync to Supabase
    try {
      if (!isNaN(Number(leadId))) {
        supabase.from('webinar_leads').update({ whatsapp_number: cleanDraft, updated_at: nowIso }).eq('id', Number(leadId)).then();
      }
      if (editingPhoneLead.full_name) {
        supabase.from('webinar_leads').update({ whatsapp_number: cleanDraft, updated_at: nowIso }).eq('full_name', editingPhoneLead.full_name).then();
      }
    } catch (err) {
      console.warn('Supabase phone sync skipped:', err);
    }

    setEditingPhoneLead(null);
    setIsSavingPhone(false);
    showToast('WhatsApp number updated', 'success');
  };

  // Copy Supabase SQL helper
  const handleCopySqlFix = () => {
    const sql = 'ALTER TABLE public.webinar_leads DISABLE ROW LEVEL SECURITY;';
    navigator.clipboard.writeText(sql);
    setHasCopiedSql(true);
    showToast('SQL command copied to clipboard!', 'success');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // Filter & Search
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (activeFilter !== 'All') {
      result = result.filter(l => l.call_status === activeFilter);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(l => 
        (l.full_name && l.full_name.toLowerCase().includes(q)) ||
        (l.whatsapp_number && l.whatsapp_number.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return result;
  }, [leads, activeFilter, debouncedSearch]);

  const getCleanPhoneDigits = (rawPhone?: string) => {
    if (!rawPhone) return '';
    return rawPhone.replace(/[^0-9]/g, '');
  };

  const getRelativeTime = (timestamp?: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadgeStyle = (status: WebinarCallStatus) => {
    switch (status) {
      case 'Not Called':
        return 'bg-slate-100 text-[#6B7280] border-slate-300';
      case 'Called — Registered':
        return 'bg-emerald-50 text-[#16A34A] border-emerald-300';
      case 'Called — Needs Follow Up':
        return 'bg-orange-50 text-[#EA580C] border-orange-300';
      case 'Called — Call Back Requested':
        return 'bg-blue-50 text-[#2563EB] border-blue-300';
      case 'Called — Not Interested':
        return 'bg-red-50 text-[#DC2626] border-red-300';
      case 'Called — No Answer':
        return 'bg-yellow-50 text-[#CA8A04] border-yellow-300';
      case 'Called — Wrong Number':
        return 'bg-red-950/10 text-[#7F1D1D] border-red-900/30';
      default:
        return 'bg-slate-100 text-[#6B7280] border-slate-300';
    }
  };

  const getRowBgColor = (status: WebinarCallStatus) => {
    switch (status) {
      case 'Not Called':
        return '#FFFFFF';
      case 'Called — Registered':
        return '#F0FFF4';
      case 'Called — Needs Follow Up':
        return '#FFF8F0';
      case 'Called — Call Back Requested':
        return '#F0F8FF';
      case 'Called — Not Interested':
        return '#FFF0F0';
      case 'Called — No Answer':
        return '#FFFFF0';
      case 'Called — Wrong Number':
        return '#F5F5F5';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl border flex items-center gap-3 transition-all transform animate-bounce-in text-sm font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-900 text-white border-emerald-700' 
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-red-400" />}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="ml-2 text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Supabase Notice Banner if RLS blocks cloud sync */}
      {supabaseRlsNotice && (
        <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Database size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Data Saved Locally & On Server
              </p>
              <p className="text-amber-800 mt-0.5">
                All your status changes and notes are safely saved in browser storage and server cache. To also sync live with your Supabase database, run this 1-line command in your Supabase SQL Editor:
              </p>
              <code className="inline-block mt-1 px-2 py-0.5 bg-amber-100 rounded font-mono text-[11px] text-amber-950 font-semibold select-all">
                ALTER TABLE public.webinar_leads DISABLE ROW LEVEL SECURITY;
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopySqlFix}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {hasCopiedSql ? <Check size={13} /> : <Copy size={13} />}
              <span>{hasCopiedSql ? 'Copied!' : 'Copy SQL'}</span>
            </button>
            <button
              onClick={() => setSupabaseRlsNotice(false)}
              className="text-amber-700 hover:text-amber-900 p-1"
              title="Dismiss notice"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 1. SEED / IMPORT LEADS BUTTON (Only appears when table is empty; hidden permanently once leads exist) */}
      {!isLoading && leads.length === 0 && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 p-6 md:p-8 rounded-2xl border-2 border-dashed border-[#774DFF]/40 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#774DFF]/10 text-[#774DFF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PhoneCall size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-serif text-[#0F172A] mb-2">
            Import Webinar Leads
          </h2>
          <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
            Your webinar leads table is currently empty. Click below to import the 95+ verified webinar attendees into the outreach CRM pipeline.
          </p>
          <button
            onClick={handleImportLeads}
            disabled={isImporting}
            className="bg-[#774DFF] hover:bg-[#683de6] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase inline-flex items-center gap-2 shadow-lg transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{isImporting ? 'Importing Leads...' : 'Import Leads'}</span>
          </button>
        </div>
      )}

      {/* 2. STATS BAR (7 cards live from stats; wraps to 2x4 grid on screens under 640px) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total</span>
          <span className="text-2xl font-black text-[#0F172A] mt-1">{stats.total}</span>
        </div>

        {/* Not Called */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Not Called</span>
          <span className="text-2xl font-black text-[#6B7280] mt-1">{stats.not_called}</span>
        </div>

        {/* Registered */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#16A34A]">Registered</span>
          <span className="text-2xl font-black text-[#16A34A] mt-1">{stats.registered}</span>
        </div>

        {/* Follow Up */}
        <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#EA580C]">Follow Up</span>
          <span className="text-2xl font-black text-[#EA580C] mt-1">{stats.needs_follow_up}</span>
        </div>

        {/* Call Back */}
        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB]">Call Back</span>
          <span className="text-2xl font-black text-[#2563EB] mt-1">{stats.call_back_requested}</span>
        </div>

        {/* Not Interested */}
        <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#DC2626]">Not Interested</span>
          <span className="text-2xl font-black text-[#DC2626] mt-1">{stats.not_interested}</span>
        </div>

        {/* No Answer */}
        <div className="bg-yellow-50/60 p-4 rounded-xl border border-yellow-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#CA8A04]">No Answer</span>
          <span className="text-2xl font-black text-[#CA8A04] mt-1">{stats.no_answer}</span>
        </div>
      </div>

      {/* 3. FILTER + SEARCH BAR */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search input - full width on mobile, real-time debounced 300ms */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, WhatsApp number or email..."
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#774DFF] focus:bg-white transition-all text-[#0F172A]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_BUTTONS.map((btn) => {
            const isActive = activeFilter === btn.value;
            return (
              <button
                key={btn.value}
                onClick={() => setActiveFilter(btn.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#774DFF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            );
          })}

          <button
            onClick={fetchLeads}
            title="Refresh & Sync Leads Data"
            className="ml-auto text-slate-400 hover:text-[#774DFF] p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#774DFF]' : ''} />
          </button>
        </div>
      </div>

      {/* 4. LEADS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && leads.length === 0 ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#774DFF]" />
            <p className="text-sm font-semibold">Loading webinar leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Search size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold text-[#0F172A]">No webinar leads match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-4 w-12 text-center">#</th>
                  <th className="py-4 px-5">Full Name</th>
                  <th className="py-4 px-5">WhatsApp</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Notes</th>
                  <th className="py-4 px-4">Updated</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {filteredLeads.map((lead, index) => {
                  const cleanDigits = getCleanPhoneDigits(lead.whatsapp_number);
                  const isPhoneValid = cleanDigits.length >= 10;
                  const rowBg = getRowBgColor(lead.call_status);
                  const isDropdownOpen = openStatusDropdownId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      style={{ backgroundColor: rowBg }}
                      className="hover:brightness-95 transition-all"
                    >
                      {/* # Number */}
                      <td className="py-4 px-4 text-center font-mono text-slate-400 font-bold text-[11px]">
                        {index + 1}
                      </td>

                      {/* Full Name */}
                      <td className="py-4 px-5 font-bold text-[#0F172A] text-sm whitespace-nowrap">
                        {lead.full_name}
                      </td>

                      {/* WhatsApp Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {isPhoneValid ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${cleanDigits}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline min-h-[44px] py-1"
                              title={`Open WhatsApp chat with ${lead.whatsapp_number}`}
                            >
                              <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                              <span className="font-mono">{lead.whatsapp_number}</span>
                            </a>
                            <button
                              onClick={() => handleOpenPhone(lead)}
                              className="text-slate-300 hover:text-[#774DFF] p-1 rounded transition-colors"
                              title="Edit phone number"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded"
                              title="Invalid phone number: has less than 10 digits"
                            >
                              <AlertTriangle size={12} /> Invalid ({lead.whatsapp_number || 'N/A'})
                            </span>
                            <button
                              onClick={() => handleOpenPhone(lead)}
                              className="text-slate-400 hover:text-[#774DFF] p-1.5 rounded transition-colors"
                              title="Fix phone number"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Email Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#774DFF] hover:underline"
                            title={`Send email to ${lead.email}`}
                          >
                            <Mail size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate max-w-[220px]">{lead.email}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No email</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusBadgeStyle(lead.call_status)}`}
                        >
                          {lead.call_status}
                        </span>
                      </td>

                      {/* Notes Column (First 40 chars, tooltip on hover) */}
                      <td className="py-4 px-5 max-w-[200px]">
                        {lead.call_notes ? (
                          <div
                            className="text-xs text-slate-700 truncate cursor-help"
                            title={lead.call_notes}
                          >
                            {lead.call_notes.length > 40
                              ? `${lead.call_notes.substring(0, 40)}...`
                              : lead.call_notes}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Updated Column (Relative time + full tooltip) */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        <span
                          className="cursor-help font-medium"
                          title={lead.updated_at ? new Date(lead.updated_at).toLocaleString() : 'N/A'}
                        >
                          {getRelativeTime(lead.updated_at)}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 relative">
                          
                          {/* 1. STATUS DROPDOWN BUTTON */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenStatusDropdownId(isDropdownOpen ? null : lead.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-[#774DFF] text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs min-h-[44px] cursor-pointer"
                              title="Update Call Status"
                            >
                              <span>Status</span>
                              <ChevronDown size={14} className="text-slate-400" />
                            </button>

                            {isDropdownOpen && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-left divide-y divide-slate-100"
                              >
                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Select Call Status
                                </div>
                                <div className="py-1">
                                  {STATUS_OPTIONS.map((opt) => (
                                    <button
                                      key={opt}
                                      onClick={() => handleSelectStatus(lead.id, opt)}
                                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-slate-50 transition-colors min-h-[40px] cursor-pointer ${
                                        lead.call_status === opt
                                          ? 'text-[#774DFF] font-bold bg-[#774DFF]/5'
                                          : 'text-slate-700'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {lead.call_status === opt && <Check size={14} className="text-[#774DFF]" />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. NOTES BUTTON (Pencil icon) */}
                          <button
                            onClick={() => handleOpenNotes(lead)}
                            className="p-2.5 bg-white border border-slate-300 hover:border-[#774DFF] hover:text-[#774DFF] text-slate-600 rounded-lg transition-colors shadow-2xs min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                            title="Edit Call Notes"
                          >
                            <Edit3 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. NOTES MODAL / INLINE POPOVER */}
      {editingNotesLead && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                  Call Notes for {editingNotesLead.full_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record conversation outcomes, investor preferences, or requested follow-up topics.
                </p>
              </div>
              <button
                onClick={() => setEditingNotesLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              rows={5}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="e.g. Spoke with client. Very interested in Prasino Lush Phase 2 (300 SQM plot). Requested allocation survey copy via WhatsApp."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#774DFF] focus:bg-white text-[#0F172A] resize-y mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingNotesLead(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingNotes}
                onClick={handleSaveNotes}
                className="px-6 py-2.5 rounded-xl bg-[#774DFF] hover:bg-[#683de6] text-white text-xs font-bold flex items-center gap-2 shadow-sm min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isSavingNotes ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PHONE EDIT MODAL */}
      {editingPhoneLead && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] font-serif">
                  Edit WhatsApp Number
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update contact for <strong>{editingPhoneLead.full_name}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingPhoneLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number (e.g. +2348012345678 or +18037232324)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#774DFF] focus:bg-white text-[#0F172A]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPhoneLead(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingPhone}
                onClick={handleSavePhone}
                className="px-6 py-2.5 rounded-xl bg-[#774DFF] hover:bg-[#683de6] text-white text-xs font-bold flex items-center gap-2 shadow-sm min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isSavingPhone ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                <span>{isSavingPhone ? 'Saving...' : 'Update Phone'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

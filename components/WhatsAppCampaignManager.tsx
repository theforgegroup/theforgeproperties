import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  RotateCw,
  Users,
  ShieldCheck,
  FileText,
  Smartphone,
  Info,
  Search,
  CheckSquare,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// -----------------------------------------------------------------------------
// TYPES & INTERFACES
// -----------------------------------------------------------------------------
export interface WhatsAppContact {
  id: number | string;
  full_name: string;
  whatsapp_number: string;
  email?: string;
  call_status?: string;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_at?: string | null;
  whatsapp_opt_in_source?: string | null;
  whatsapp_opt_out_at?: string | null;
  is_valid_phone: boolean;
  is_opted_out: boolean;
  is_campaign_eligible: boolean;
}

export interface WhatsAppTemplate {
  name: string;
  category: 'MARKETING' | 'UTILITY';
  language: string;
  body_text: string;
  header_text?: string;
  footer_text?: string;
  variable_count: number;
  sample_variables: Record<string, string>;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  template_name: string;
  template_language: string;
  template_variables: Record<string, string>;
  status: 'draft' | 'queued' | 'processing' | 'paused' | 'completed' | 'cancelled' | 'failed';
  created_by: string;
  total_recipients: number;
  queued_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  opted_out_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppCampaignMessage {
  id: string;
  campaign_id: string;
  lead_id?: number | string | null;
  recipient_number: string;
  recipient_name: string;
  template_name: string;
  template_variables: Record<string, string>;
  queue_status: 'pending' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed' | 'opted_out' | 'uncertain_delivery' | 'cancelled' | 'skipped';
  provider_message_id?: string | null;
  attempt_count: number;
  max_attempts: number;
  next_retry_at?: string | null;
  last_error?: string | null;
  queued_at?: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  read_at?: string | null;
  failed_at?: string | null;
  created_at: string;
  updated_at: string;
}

import { WhatsAppStats } from '../types';

const CONSENT_SOURCES = [
  'Webinar Registration Form',
  'Direct WhatsApp Chat Permission',
  'Phone Call Confirmation',
  'Investor Meeting Sign-up',
  'Site Inspection Booking',
  'Newsletter Opt-In'
];

export const WhatsAppCampaignManager: React.FC = () => {
  // Navigation tab inside WhatsApp Manager: 'campaigns' | 'contacts' | 'templates'
  const [managerTab, setManagerTab] = useState<'campaigns' | 'contacts' | 'templates'>('campaigns');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [coexistenceInfo, setCoexistenceInfo] = useState<{
    phone_app_active: boolean;
    coexistence_supported: boolean;
    live_sending_enabled: boolean;
    message: string;
  } | null>(null);

  // Selected contact IDs for bulk actions
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string | number>>(new Set());

  // Modals
  const [showCoexistenceModal, setShowCoexistenceModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState<WhatsAppContact | null>(null);
  const [showBulkConsentModal, setShowBulkConsentModal] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<WhatsAppCampaign | null>(null);
  const [campaignMessages, setCampaignMessages] = useState<WhatsAppCampaignMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageFilter, setMessageFilter] = useState<string>('all');

  // Contact filtering & search
  const [contactSearch, setContactSearch] = useState('');
  const [contactConsentFilter, setContactConsentFilter] = useState<'all' | 'opted_in' | 'pending_consent' | 'opted_out'>('all');

  // New Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState('');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('webinar_followup');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({
    '1': 'Investor',
    '2': 'Prasino Lush Phase 2'
  });
  const [recipientFilterMode, setRecipientFilterMode] = useState<'all_opted_in' | 'selected_only' | 'registered_only'>('all_opted_in');
  const [isSubmittingCampaign, setIsSubmittingCampaign] = useState(false);

  // Consent modal state
  const [consentSourceInput, setConsentSourceInput] = useState(CONSENT_SOURCES[0]);
  const [consentActionIsOptIn, setConsentActionIsOptIn] = useState(true);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // ---------------------------------------------------------------------------
  // AUTHENTICATION HEADERS (Bearer Token from Supabase Session)
  // ---------------------------------------------------------------------------
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.warn('Failed to retrieve Supabase session token:', err);
    }
    return headers;
  }, []);

  // Maintain ref to viewingCampaign so realtime message handlers always access current state
  const viewingCampaignRef = useRef<WhatsAppCampaign | null>(viewingCampaign);
  useEffect(() => {
    viewingCampaignRef.current = viewingCampaign;
  }, [viewingCampaign]);

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();

      // 1. Fetch campaigns
      const campRes = await fetch('/api/admin/whatsapp/campaigns', { headers });
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData.campaigns || []);
      }

      // 2. Fetch stats & coexistence
      const statsRes = await fetch('/api/admin/whatsapp/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        if (statsData.coexistence) {
          setCoexistenceInfo(statsData.coexistence);
        }
      }

      // 3. Fetch templates
      const tplRes = await fetch('/api/admin/whatsapp/templates', { headers });
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplates(tplData.templates || []);
      }

      // 4. Fetch contacts
      const contactsRes = await fetch('/api/admin/whatsapp/contacts?limit=100', { headers });
      if (contactsRes.ok) {
        const cData = await contactsRes.json();
        setContacts(cData.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load WhatsApp data:', err);
      showToast('Failed to load WhatsApp campaign data.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Lightweight stats refresher for realtime events
  const refreshStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const statsRes = await fetch('/api/admin/whatsapp/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch {
      // Ignore background stats refresh error
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch campaign messages when viewing a specific campaign
  const fetchCampaignMessages = useCallback(async (campaignId: string) => {
    setIsLoadingMessages(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/whatsapp/campaigns/${campaignId}/messages`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCampaignMessages(data.messages || []);
        if (data.campaign) {
          setViewingCampaign(data.campaign);
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages for campaign:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [getAuthHeaders]);

  // ---------------------------------------------------------------------------
  // SUPABASE REALTIME SUBSCRIPTIONS
  // Subscribes to both whatsapp_campaigns & whatsapp_campaign_messages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const channelId = `admin-whatsapp-channel-${Date.now()}`;

    const channel = supabase
      .channel(channelId)
      // 1. Listen for campaign events
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_campaigns' },
        (payload) => {
          if (!isMounted) return;
          console.log('[Realtime] Campaign change:', payload.eventType);

          if (payload.eventType === 'INSERT') {
            const newCampaign = payload.new as WhatsAppCampaign;
            if (newCampaign?.id) {
              setCampaigns(prev => {
                if (prev.some(c => c.id === newCampaign.id)) return prev;
                return [newCampaign, ...prev];
              });
            } else {
              fetchAllData();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as WhatsAppCampaign;
            if (updated?.id) {
              setCampaigns(prev => prev.map(c => c.id === updated.id ? updated : c));
              if (viewingCampaignRef.current?.id === updated.id) {
                setViewingCampaign(updated);
              }
            } else {
              fetchAllData();
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRecord = payload.old as { id?: string };
            if (oldRecord?.id) {
              setCampaigns(prev => prev.filter(c => c.id !== oldRecord.id));
              if (viewingCampaignRef.current?.id === oldRecord.id) {
                setViewingCampaign(null);
                setCampaignMessages([]);
              }
            } else {
              fetchAllData();
            }
          }

          refreshStats();
        }
      )
      // 2. Listen for campaign message status changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_campaign_messages' },
        (payload) => {
          if (!isMounted) return;
          console.log('[Realtime] Message change:', payload.eventType);

          const currentViewing = viewingCampaignRef.current;
          const msgPayload = payload.new as WhatsAppCampaignMessage;

          if (msgPayload?.id) {
            if (currentViewing && msgPayload.campaign_id === currentViewing.id) {
              setCampaignMessages(prev => {
                const idx = prev.findIndex(m => m.id === msgPayload.id);
                if (idx !== -1) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...msgPayload };
                  return updated;
                } else if (payload.eventType === 'INSERT') {
                  return [msgPayload, ...prev];
                }
                return prev;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const oldMsg = payload.old as { id?: string };
            if (oldMsg?.id) {
              setCampaignMessages(prev => prev.filter(m => m.id !== oldMsg.id));
            }
          } else {
            // Missing payload fallback
            if (currentViewing) {
              fetchCampaignMessages(currentViewing.id);
            }
          }

          refreshStats();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.warn('[Realtime] Subscription warning:', err);
        }
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Subscribed to whatsapp_campaigns and whatsapp_campaign_messages');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [fetchAllData, fetchCampaignMessages, refreshStats]);

  // ---------------------------------------------------------------------------
  // CAMPAIGN ACTIONS
  // ---------------------------------------------------------------------------
  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      showToast('Please provide a campaign name.', 'error');
      return;
    }

    const tpl = templates.find(t => t.name === selectedTemplateName);
    if (!tpl) {
      showToast('Please select a valid approved template.', 'error');
      return;
    }

    setIsSubmittingCampaign(true);
    try {
      const headers = await getAuthHeaders();

      // 1. Create campaign
      const createRes = await fetch('/api/admin/whatsapp/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newCampaignName.trim(),
          template_name: selectedTemplateName,
          template_variables: templateVariables
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.error || 'Failed to create campaign');
      }

      const { campaign } = await createRes.json();

      // 2. Select eligible recipients based on mode
      let targetContacts = contacts.filter(c => c.is_campaign_eligible);

      if (recipientFilterMode === 'selected_only') {
        targetContacts = targetContacts.filter(c => selectedContactIds.has(c.id));
      } else if (recipientFilterMode === 'registered_only') {
        targetContacts = targetContacts.filter(c => c.call_status === 'Called — Registered');
      }

      if (targetContacts.length === 0) {
        showToast('No eligible opted-in recipients found for this selection.', 'error');
        setIsSubmittingCampaign(false);
        return;
      }

      // 3. Queue campaign
      const queueRes = await fetch(`/api/admin/whatsapp/campaigns/${campaign.id}/queue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contact_ids: targetContacts.map(c => c.id)
        })
      });

      if (!queueRes.ok) {
        const errJson = await queueRes.json();
        throw new Error(errJson.error || 'Failed to queue campaign');
      }

      const queueData = await queueRes.json();
      showToast(`Campaign "${campaign.name}" created and queued ${queueData.enqueuedCount} messages!`, 'success');
      setShowNewCampaignModal(false);
      setNewCampaignName('');
      setSelectedContactIds(new Set());
      await fetchAllData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    } finally {
      setIsSubmittingCampaign(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'pause' | 'resume' | 'cancel' | 'retry-failed') => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/whatsapp/campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || `Failed to ${action} campaign`);
      }

      const resData = await res.json();
      showToast(resData.message || `Campaign ${action} successful!`, 'success');
      await fetchAllData();
      if (viewingCampaign && viewingCampaign.id === campaignId) {
        await fetchCampaignMessages(campaignId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // CONSENT MANAGEMENT ACTIONS
  // ---------------------------------------------------------------------------
  const handleUpdateConsent = async (leadId: string | number, optIn: boolean, source: string) => {
    try {
      const headers = await getAuthHeaders();

      const res = await fetch(`/api/admin/whatsapp/contacts/${leadId}/consent`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ opt_in: optIn, source })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update consent');
      }

      showToast(`Consent updated: ${optIn ? 'Opted In' : 'Opted Out'}`, 'success');
      setShowConsentModal(null);
      await fetchAllData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    }
  };

  const handleBulkConsent = async (optIn: boolean) => {
    if (selectedContactIds.size === 0) {
      showToast('No contacts selected.', 'error');
      return;
    }

    try {
      const headers = await getAuthHeaders();

      const res = await fetch('/api/admin/whatsapp/contacts/bulk-consent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ids: Array.from(selectedContactIds),
          opt_in: optIn,
          source: consentSourceInput
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update bulk consent');
      }

      const resData = await res.json();
      showToast(`Updated consent for ${resData.updatedCount} contacts!`, 'success');
      setShowBulkConsentModal(false);
      setSelectedContactIds(new Set());
      await fetchAllData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // UNCERTAIN DELIVERY RECONCILIATION ACTION
  // ---------------------------------------------------------------------------
  const handleReconcileUncertainMessage = async (
    messageId: string,
    resolution: 'mark_as_sent' | 'requeue_for_send' | 'mark_as_failed',
    providerMessageId?: string,
    notes?: string
  ) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/whatsapp/messages/${messageId}/reconcile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resolution, provider_message_id: providerMessageId, notes })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to reconcile message');
      }

      showToast(`Message successfully reconciled: ${resolution.replace(/_/g, ' ')}`, 'success');
      if (viewingCampaignRef.current) {
        await fetchCampaignMessages(viewingCampaignRef.current.id);
      }
      await fetchAllData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERED CONTACTS & METRICS
  // ---------------------------------------------------------------------------
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Search
      if (contactSearch.trim()) {
        const q = contactSearch.toLowerCase();
        const matchName = c.full_name?.toLowerCase().includes(q);
        const matchPhone = c.whatsapp_number?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      // Consent filter
      if (contactConsentFilter === 'opted_in' && !c.whatsapp_opt_in) return false;
      if (contactConsentFilter === 'pending_consent' && (c.whatsapp_opt_in || c.is_opted_out)) return false;
      if (contactConsentFilter === 'opted_out' && !c.is_opted_out) return false;

      return true;
    });
  }, [contacts, contactSearch, contactConsentFilter]);

  const toggleSelectContact = (id: string | number) => {
    const next = new Set(selectedContactIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedContactIds(next);
  };

  const toggleSelectAllEligible = () => {
    const eligibleInView = filteredContacts.filter(c => c.is_campaign_eligible);
    const allSelected = eligibleInView.length > 0 && eligibleInView.every(c => selectedContactIds.has(c.id));

    const next = new Set(selectedContactIds);
    if (allSelected) {
      eligibleInView.forEach(c => next.delete(c.id));
    } else {
      eligibleInView.forEach(c => next.add(c.id));
    }
    setSelectedContactIds(next);
  };

  // Currently selected template definition
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.name === selectedTemplateName) || templates[0];
  }, [templates, selectedTemplateName]);

  // Live preview text for the selected template with replaced variables
  const renderedMessagePreview = useMemo(() => {
    if (!activeTemplate) return '';
    let text = activeTemplate.body_text;
    Object.entries(templateVariables).forEach(([key, val]) => {
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
    });
    return text;
  }, [activeTemplate, templateVariables]);

  const getStatusBadge = (status: WhatsAppCampaign['status']) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><Check size={12} /> Completed</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200"><RotateCw size={12} className="animate-spin" /> Processing</span>;
      case 'queued':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock size={12} /> Queued</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300"><Pause size={12} /> Paused</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>;
    }
  };

  const getMessageQueueBadge = (status: WhatsAppCampaignMessage['queue_status']) => {
    switch (status) {
      case 'read':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded"><CheckCheck size={13} className="text-sky-600" /> Read</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded"><CheckCheck size={13} className="text-emerald-600" /> Delivered</span>;
      case 'sent':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded"><Check size={13} /> Sent</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded"><RotateCw size={13} className="animate-spin text-blue-600" /> Sending</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded"><AlertCircle size={13} /> Failed</span>;
      case 'uncertain_delivery':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded"><AlertTriangle size={13} className="text-amber-700" /> Quarantined / Uncertain</span>;
      case 'opted_out':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"><UserX size={13} /> Opted Out</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded"><Clock size={13} /> Queued</span>;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl border flex items-center gap-3 text-sm font-bold transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} className="text-emerald-300" /> : <AlertTriangle size={18} className="text-rose-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & COEXISTENCE STATUS BANNER */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-serif">WhatsApp Campaign Manager</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Official Platform
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-tier campaign dispatcher integrated with The Forge Properties webinar leads CRM.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCoexistenceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] cursor-pointer"
            >
              <Smartphone size={16} className="text-emerald-400" />
              <span>App Coexistence: Active</span>
              <Info size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => {
                setShowNewCampaignModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 min-h-[44px] cursor-pointer"
            >
              <Plus size={16} />
              <span>New Campaign</span>
            </button>

            <button
              onClick={fetchAllData}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#774DFF]' : ''} />
            </button>
          </div>
        </div>

        {/* Coexistence & Meta Compliance Notice strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>
              <strong>Safe Coexistence Guarantee:</strong> Your phone’s active WhatsApp Business app remains 100% active. Zero migration risk.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {coexistenceInfo?.live_sending_enabled ? 'Live Meta Cloud API' : 'Safe Test Mode (Simulated WAMID)'}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. STATS SUMMARY CARDS */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Campaigns</p>
          <p className="text-2xl font-black text-[#0F172A] mt-1 font-serif">{stats?.total_campaigns ?? campaigns.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.completed_campaigns ?? 0} completed
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Queued / Sent</p>
          <p className="text-2xl font-black text-[#0F172A] mt-1 font-serif">
            {stats?.total_messages_sent ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.total_messages_queued ?? 0} in queue
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Delivered</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-serif">
            {stats?.total_messages_delivered ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">
            {stats?.delivery_rate ?? 0}% delivery rate
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Read / Opened</p>
          <p className="text-2xl font-black text-sky-700 mt-1 font-serif">
            {stats?.total_messages_read ?? 0}
          </p>
          <p className="text-[11px] text-sky-600 mt-1">
            {stats?.read_rate ?? 0}% read rate
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Failed / Retries</p>
          <p className="text-2xl font-black text-rose-600 mt-1 font-serif">
            {stats?.total_messages_failed ?? 0}
          </p>
          <p className="text-[11px] text-rose-500 mt-1">
            Bounded auto-retry
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Opt-Outs</p>
          <p className="text-2xl font-black text-amber-700 mt-1 font-serif">
            {stats?.total_opt_outs ?? 0}
          </p>
          <p className="text-[11px] text-amber-600 mt-1">
            Strictly excluded
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. MANAGER NAVIGATION TABS */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setManagerTab('campaigns')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            managerTab === 'campaigns'
              ? 'border-[#774DFF] text-[#774DFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={16} />
          <span>Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setManagerTab('contacts')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            managerTab === 'contacts'
              ? 'border-[#774DFF] text-[#774DFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>Contacts & Consent ({contacts.length})</span>
        </button>

        <button
          onClick={() => setManagerTab('templates')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            managerTab === 'templates'
              ? 'border-[#774DFF] text-[#774DFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} />
          <span>Meta Approved Templates ({templates.length})</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: CAMPAIGNS LIST */}
      {/* --------------------------------------------------------------------- */}
      {managerTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#774DFF]/10 text-[#774DFF] flex items-center justify-center mx-auto">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold font-serif text-[#0F172A]">No WhatsApp Campaigns Yet</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Start reaching qualified webinar leads with Meta-approved message templates. Select contacts with explicit consent and dispatch in controlled batches.
              </p>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Your First Campaign</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Campaign Name</th>
                      <th className="py-3.5 px-4">Template</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Recipients</th>
                      <th className="py-3.5 px-4 text-center">Delivered</th>
                      <th className="py-3.5 px-4 text-center">Read</th>
                      <th className="py-3.5 px-4 text-center">Failed</th>
                      <th className="py-3.5 px-4">Created</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map(c => {
                      const total = c.total_recipients || 0;
                      const delivered = (c.delivered_count || 0) + (c.read_count || 0);
                      const rate = total > 0 ? Math.round((delivered / total) * 100) : 0;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{c.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">By {c.created_by}</span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {c.template_name}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            {getStatusBadge(c.status)}
                          </td>

                          <td className="py-4 px-4 text-center font-bold text-slate-700 whitespace-nowrap">
                            {c.total_recipients}
                          </td>

                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="text-emerald-700 font-bold">{delivered}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({rate}%)</span>
                          </td>

                          <td className="py-4 px-4 text-center font-bold text-sky-700 whitespace-nowrap">
                            {c.read_count || 0}
                          </td>

                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            {c.failed_count > 0 ? (
                              <span className="text-rose-600 font-bold">{c.failed_count}</span>
                            ) : (
                              <span className="text-slate-300">0</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>

                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => {
                                  setViewingCampaign(c);
                                  fetchCampaignMessages(c.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                                title="View Delivery Log & Messages"
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>

                              {/* Pause / Resume */}
                              {c.status === 'processing' || c.status === 'queued' ? (
                                <button
                                  onClick={() => handleCampaignAction(c.id, 'pause')}
                                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                                  title="Pause Campaign"
                                >
                                  <Pause size={14} />
                                </button>
                              ) : c.status === 'paused' ? (
                                <button
                                  onClick={() => handleCampaignAction(c.id, 'resume')}
                                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                                  title="Resume Campaign"
                                >
                                  <Play size={14} />
                                </button>
                              ) : null}

                              {/* Cancel */}
                              {c.status === 'queued' || c.status === 'processing' || c.status === 'paused' ? (
                                <button
                                  onClick={() => handleCampaignAction(c.id, 'cancel')}
                                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                                  title="Cancel Campaign"
                                >
                                  <XCircle size={14} />
                                </button>
                              ) : null}

                              {/* Retry Failed */}
                              {c.failed_count > 0 && (
                                <button
                                  onClick={() => handleCampaignAction(c.id, 'retry-failed')}
                                  className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                                  title="Retry Failed Messages"
                                >
                                  <RotateCw size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: CONTACTS & CONSENT */}
      {/* --------------------------------------------------------------------- */}
      {managerTab === 'contacts' && (
        <div className="space-y-4">
          {/* Controls strip */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 flex-grow">
              <div className="relative min-w-[260px] flex-grow max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  placeholder="Search contacts by name, phone or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#774DFF] focus:bg-white text-[#0F172A]"
                />
              </div>

              {/* Consent filter buttons */}
              {(['all', 'opted_in', 'pending_consent', 'opted_out'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setContactConsentFilter(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
                    contactConsentFilter === f
                      ? 'bg-[#774DFF] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' && 'All Contacts'}
                  {f === 'opted_in' && 'Eligible / Opted In'}
                  {f === 'pending_consent' && 'Pending Consent'}
                  {f === 'opted_out' && 'Opted Out'}
                </button>
              ))}
            </div>

            {/* Bulk Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAllEligible}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 min-h-[38px] cursor-pointer"
              >
                <CheckSquare size={14} />
                <span>Select All Eligible</span>
              </button>

              {selectedContactIds.size > 0 && (
                <>
                  <button
                    onClick={() => setShowBulkConsentModal(true)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 min-h-[38px] shadow-xs cursor-pointer"
                  >
                    <UserCheck size={14} />
                    <span>Update Consent ({selectedContactIds.size})</span>
                  </button>

                  <button
                    onClick={() => {
                      setRecipientFilterMode('selected_only');
                      setShowNewCampaignModal(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold flex items-center gap-1.5 min-h-[38px] shadow-xs cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send Campaign ({selectedContactIds.size})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredContacts.length > 0 && filteredContacts.every(c => selectedContactIds.has(c.id))}
                        onChange={toggleSelectAllEligible}
                        className="rounded border-slate-300 text-[#774DFF] focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">WhatsApp Number</th>
                    <th className="py-3 px-4">CRM Status</th>
                    <th className="py-3 px-4">WhatsApp Consent</th>
                    <th className="py-3 px-4">Consent Source & Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map(c => {
                    const isSelected = selectedContactIds.has(c.id);

                    return (
                      <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-purple-50/50' : ''}`}>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectContact(c.id)}
                            className="rounded border-slate-300 text-[#774DFF] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                          <div>{c.full_name}</div>
                          {c.email && <div className="text-[11px] text-slate-400 font-normal">{c.email}</div>}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                          {c.is_valid_phone ? (
                            <span className="text-emerald-700 font-semibold">{c.whatsapp_number}</span>
                          ) : (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1 font-bold">
                              <AlertCircle size={11} /> Invalid ({c.whatsapp_number || 'Empty'})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                            {c.call_status || 'Not Called'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {c.is_opted_out ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <UserX size={12} /> Opted Out
                            </span>
                          ) : c.whatsapp_opt_in ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <UserCheck size={12} /> Consented
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <Clock size={12} /> Pending Consent
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {c.whatsapp_opt_in_source ? (
                            <div>
                              <div className="font-semibold text-slate-700">{c.whatsapp_opt_in_source}</div>
                              <div className="text-[10px] text-slate-400">
                                {c.whatsapp_opt_in_at ? new Date(c.whatsapp_opt_in_at).toLocaleDateString() : 'Recorded'}
                              </div>
                            </div>
                          ) : c.whatsapp_opt_out_at ? (
                            <div className="text-rose-500 font-semibold">
                              Unsubscribed on {new Date(c.whatsapp_opt_out_at).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No formal consent record</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setShowConsentModal(c);
                                setConsentActionIsOptIn(!c.whatsapp_opt_in);
                                setConsentSourceInput(CONSENT_SOURCES[0]);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Update Consent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: APPROVED META TEMPLATES */}
      {/* --------------------------------------------------------------------- */}
      {managerTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(tpl => (
            <div key={tpl.name} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-[#0F172A] font-mono">{tpl.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Approved by Meta
                    </span>
                    <span className="text-xs text-slate-500">Category: {tpl.category}</span>
                    <span className="text-xs text-slate-400 font-mono">({tpl.language})</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplateName(tpl.name);
                    setTemplateVariables(tpl.sample_variables);
                    setShowNewCampaignModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Use Template
                </button>
              </div>

              {/* Realistic WhatsApp Chat Bubble */}
              <div className="bg-[#EFEAE2] p-4 rounded-xl border border-slate-300">
                <div className="bg-white rounded-2xl p-4 shadow-sm max-w-sm space-y-2 relative text-slate-900 border border-slate-100">
                  {tpl.header_text && (
                    <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1.5">
                      {tpl.header_text}
                    </div>
                  )}

                  <p className="text-xs whitespace-pre-wrap leading-relaxed">
                    {tpl.body_text}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{tpl.footer_text || 'The Forge Properties • Reply STOP to unsubscribe'}</span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <span>12:00</span>
                      <CheckCheck size={12} className="text-sky-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Variables specification */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p className="font-bold text-slate-700 mb-1">Configurable Variables ({tpl.variable_count}):</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tpl.sample_variables).map(([key, val]) => (
                    <span key={key} className="px-2 py-0.5 bg-white rounded border border-slate-200 text-[11px] font-mono">
                      {`{{${key}}}`} = &quot;{val}&quot;
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1: NEW CAMPAIGN COMPOSER & PREVIEW */}
      {/* --------------------------------------------------------------------- */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#0F172A]">Create WhatsApp Campaign</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure approved template message, variables, and recipient audience.
                </p>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Form controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={newCampaignName}
                    onChange={e => setNewCampaignName(e.target.value)}
                    placeholder="e.g., Prasino Lush Phase 2 Investor Update"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#774DFF] focus:bg-white text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Meta Approved Template *
                  </label>
                  <select
                    value={selectedTemplateName}
                    onChange={e => {
                      const tName = e.target.value;
                      setSelectedTemplateName(tName);
                      const t = templates.find(item => item.name === tName);
                      if (t) setTemplateVariables(t.sample_variables);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#774DFF] focus:bg-white text-[#0F172A]"
                  >
                    {templates.map(t => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variable fields */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-xs font-bold text-slate-700">Template Variables:</p>
                  {activeTemplate && Object.keys(activeTemplate.sample_variables).map(vKey => (
                    <div key={vKey}>
                      <label className="block text-[11px] font-mono text-slate-600 mb-1">
                        Variable {`{{${vKey}}}`} {vKey === '1' ? '(Recipient Name auto-mapped)' : ''}
                      </label>
                      <input
                        type="text"
                        value={templateVariables[vKey] || ''}
                        onChange={e => setTemplateVariables(prev => ({ ...prev, [vKey]: e.target.value }))}
                        placeholder={activeTemplate.sample_variables[vKey]}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#774DFF]"
                      />
                    </div>
                  ))}
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Recipient Audience *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="recipientFilter"
                        checked={recipientFilterMode === 'all_opted_in'}
                        onChange={() => setRecipientFilterMode('all_opted_in')}
                        className="text-[#774DFF] focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-slate-800">All Opted-In Webinar Leads</span>
                        <p className="text-[11px] text-slate-500">
                          Contacts with explicit opt-in and valid phone numbers ({contacts.filter(c => c.is_campaign_eligible).length} leads).
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="recipientFilter"
                        checked={recipientFilterMode === 'registered_only'}
                        onChange={() => setRecipientFilterMode('registered_only')}
                        className="text-[#774DFF] focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-slate-800">Registered Leads Only</span>
                        <p className="text-[11px] text-slate-500">
                          Webinar leads marked as &quot;Called — Registered&quot; with consent ({contacts.filter(c => c.is_campaign_eligible && c.call_status === 'Called — Registered').length} leads).
                        </p>
                      </div>
                    </label>

                    {selectedContactIds.size > 0 && (
                      <label className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-200 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="recipientFilter"
                          checked={recipientFilterMode === 'selected_only'}
                          onChange={() => setRecipientFilterMode('selected_only')}
                          className="text-[#774DFF] focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-[#774DFF]">
                            Specific Selected Contacts ({selectedContactIds.size})
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Contacts currently checked in the contacts table.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: WhatsApp Interactive Preview */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Interactive Message Preview</span>
                  <span className="text-[10px] text-slate-400 font-normal">WhatsApp Screen Simulator</span>
                </label>

                {/* Simulated Phone Frame */}
                <div className="bg-[#EFEAE2] p-5 rounded-2xl border border-slate-300 flex-grow flex flex-col justify-between shadow-inner">
                  {/* WhatsApp chat header */}
                  <div className="bg-[#075E54] text-white p-3 rounded-xl flex items-center gap-2.5 mb-4 shadow-xs">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      FP
                    </div>
                    <div>
                      <p className="font-bold text-xs leading-none">The Forge Properties</p>
                      <p className="text-[10px] text-emerald-200 mt-0.5">Official Business Account</p>
                    </div>
                  </div>

                  {/* Message bubble */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2 border border-slate-100 text-slate-900 max-w-sm">
                    {activeTemplate?.header_text && (
                      <div className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1.5">
                        {activeTemplate.header_text}
                      </div>
                    )}

                    <p className="text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                      {renderedMessagePreview}
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{activeTemplate?.footer_text || 'The Forge Properties • Reply STOP to unsubscribe'}</span>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck size={12} className="text-sky-500" />
                      </div>
                    </div>
                  </div>

                  {/* Security badge at bottom */}
                  <div className="mt-6 text-center text-[10px] text-slate-500 bg-white/60 py-2 px-3 rounded-lg border border-slate-200">
                    🔒 Messages are sent via Meta WhatsApp Cloud API with end-to-end delivery tracking.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={() => setShowNewCampaignModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmittingCampaign}
                onClick={handleCreateCampaign}
                className="px-6 py-2.5 rounded-xl bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingCampaign ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    <span>Queueing Campaign...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Confirm & Queue Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2: CAMPAIGN DELIVERY INSPECTOR & MESSAGES LOG */}
      {/* --------------------------------------------------------------------- */}
      {viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-slate-200 my-8 animate-in fade-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-serif text-[#0F172A]">{viewingCampaign.name}</h3>
                  {getStatusBadge(viewingCampaign.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Template: <span className="font-mono text-slate-700">{viewingCampaign.template_name}</span> • Created {new Date(viewingCampaign.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCampaignMessages(viewingCampaign.id)}
                  title="Refresh Log"
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  <RefreshCw size={14} className={isLoadingMessages ? 'animate-spin text-[#774DFF]' : ''} />
                </button>
                <button
                  onClick={() => setViewingCampaign(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Progress Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recipients</span>
                <p className="text-xl font-black text-[#0F172A]">{viewingCampaign.total_recipients}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Delivered</span>
                <p className="text-xl font-black text-emerald-700">
                  {(viewingCampaign.delivered_count || 0) + (viewingCampaign.read_count || 0)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase">Read</span>
                <p className="text-xl font-black text-sky-700">{viewingCampaign.read_count || 0}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase">Failed</span>
                <p className="text-xl font-black text-rose-700">{viewingCampaign.failed_count || 0}</p>
              </div>
            </div>

            {/* Filter buttons for messages */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'pending', 'sent', 'delivered', 'read', 'failed', 'uncertain_delivery'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setMessageFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      messageFilter === f
                        ? 'bg-[#774DFF] text-white'
                        : f === 'uncertain_delivery' && campaignMessages.some(m => m.queue_status === 'uncertain_delivery')
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f === 'all'
                      ? 'All Messages'
                      : f === 'uncertain_delivery'
                      ? `Quarantine (${campaignMessages.filter(m => m.queue_status === 'uncertain_delivery').length})`
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* Retry Failed button */}
              {viewingCampaign.failed_count > 0 && (
                <button
                  onClick={() => handleCampaignAction(viewingCampaign.id, 'retry-failed')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw size={13} />
                  <span>Retry All Failed</span>
                </button>
              )}
            </div>

            {/* Individual Messages Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Attempts</th>
                    <th className="py-2.5 px-3">Provider ID / Details</th>
                    <th className="py-2.5 px-3">Timestamp / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaignMessages
                    .filter(m => (messageFilter === 'all' ? true : m.queue_status === messageFilter))
                    .map(msg => (
                      <tr key={msg.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                          {msg.recipient_name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {msg.recipient_number}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getMessageQueueBadge(msg.queue_status)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {msg.attempt_count} / {msg.max_attempts}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] font-mono whitespace-nowrap text-slate-500">
                          {msg.last_error ? (
                            <span className="text-rose-600 font-sans" title={msg.last_error}>
                              ⚠️ {msg.last_error.substring(0, 35)}...
                            </span>
                          ) : msg.provider_message_id ? (
                            <span className="text-slate-600" title={msg.provider_message_id}>
                              {msg.provider_message_id.substring(0, 24)}...
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                          {msg.queue_status === 'uncertain_delivery' ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleReconcileUncertainMessage(msg.id, 'mark_as_sent', undefined, 'Manually confirmed via Meta Suite')}
                                className="px-2 py-0.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded font-bold text-[10px] cursor-pointer"
                                title="Confirm sent via WhatsApp Manager"
                              >
                                Mark Sent
                              </button>
                              <button
                                onClick={() => handleReconcileUncertainMessage(msg.id, 'requeue_for_send', undefined, 'Admin re-queue')}
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded font-bold text-[10px] cursor-pointer"
                                title="Re-queue for delivery"
                              >
                                Re-queue
                              </button>
                              <button
                                onClick={() => handleReconcileUncertainMessage(msg.id, 'mark_as_failed', undefined, 'Marked failed during review')}
                                className="px-2 py-0.5 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded font-bold text-[10px] cursor-pointer"
                                title="Mark as failed"
                              >
                                Fail
                              </button>
                            </div>
                          ) : (
                            msg.delivered_at
                              ? new Date(msg.delivered_at).toLocaleTimeString()
                              : msg.sent_at
                              ? new Date(msg.sent_at).toLocaleTimeString()
                              : new Date(msg.queued_at || msg.created_at).toLocaleTimeString()
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                onClick={() => setViewingCampaign(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 3: SINGLE CONTACT CONSENT UPDATE */}
      {/* --------------------------------------------------------------------- */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#0F172A]">Record WhatsApp Consent</h3>
                <p className="text-xs text-slate-500">{showConsentModal.full_name} ({showConsentModal.whatsapp_number})</p>
              </div>
              <button onClick={() => setShowConsentModal(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Consent Action
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsentActionIsOptIn(true)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      consentActionIsOptIn
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck size={14} /> Grant Opt-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsentActionIsOptIn(false)}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      !consentActionIsOptIn
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserX size={14} /> Mark Opt-Out
                  </button>
                </div>
              </div>

              {consentActionIsOptIn && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Auditable Consent Source *
                  </label>
                  <select
                    value={consentSourceInput}
                    onChange={e => setConsentSourceInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  >
                    {CONSENT_SOURCES.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowConsentModal(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateConsent(showConsentModal.id, consentActionIsOptIn, consentSourceInput)}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs ${
                  consentActionIsOptIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Save Consent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 4: BULK CONSENT UPDATE */}
      {/* --------------------------------------------------------------------- */}
      {showBulkConsentModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#0F172A]">Bulk Consent Record</h3>
                <p className="text-xs text-slate-500">Updating {selectedContactIds.size} selected leads</p>
              </div>
              <button onClick={() => setShowBulkConsentModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Verified Opt-In Source
              </label>
              <select
                value={consentSourceInput}
                onChange={e => setConsentSourceInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                {CONSENT_SOURCES.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowBulkConsentModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkConsent(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs"
              >
                Grant Opt-In for {selectedContactIds.size} Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 5: WHATSAPP BUSINESS APP COEXISTENCE EXPLAINER */}
      {/* --------------------------------------------------------------------- */}
      {showCoexistenceModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#0F172A]">WhatsApp Business App Coexistence</h3>
                  <p className="text-xs text-slate-500">Meta Cloud API & Nigerian Business Number Rules</p>
                </div>
              </div>
              <button onClick={() => setShowCoexistenceModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 space-y-1.5">
                <p className="font-bold flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Your Active Phone App Is Completely Preserved
                </p>
                <p className="text-[11px] text-emerald-800">
                  Under our official Meta WhatsApp Cloud API coexistence architecture, the team&apos;s phone app remains completely functional for personal and one-on-one client chats. Our platform never initiates a phone deregistration or number takeover.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Coexistence Requirements & Nigerian Numbers (+234):</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Official Meta Cloud API Coexistence:</strong> Meta officially supports Cloud API alongside the WhatsApp Business App for supported regions and accounts, allowing outbound campaigns without disrupting inbound customer mobile conversations.
                  </li>
                  <li>
                    <strong>Live Sending Gating:</strong> To guarantee zero downtime or migration surprises, live bulk sending is gated behind explicit environment configuration (<code className="bg-slate-100 px-1 py-0.5 rounded">WHATSAPP_ACCESS_TOKEN</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">WHATSAPP_PHONE_NUMBER_ID</code>).
                  </li>
                  <li>
                    <strong>Safe Test Mode:</strong> Until credentials are supplied, every campaign runs in a high-fidelity test mode that simulates message dispatch with genuine <code className="bg-slate-100 px-1 py-0.5 rounded">sim_wamid_...</code> IDs, webhooks, and delivery receipts without incurring provider charges.
                  </li>
                  <li>
                    <strong>Anti-Spam & Opt-Out:</strong> Recipient phone numbers that send &quot;STOP&quot; or are unchecked by admins are immediately excluded from all future queues.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Onboarding Checklist for Production Live Sending:</p>
                <p className="text-[11px]">1. Meta Business Suite organization verification (Nigeria).</p>
                <p className="text-[11px]">2. Create a WhatsApp Business App in Meta Developers.</p>
                <p className="text-[11px]">3. Register the business number and request Cloud API coexistence.</p>
                <p className="text-[11px]">4. Supply <code className="bg-white px-1 py-0.5 rounded border">WHATSAPP_ACCESS_TOKEN</code> in production environment.</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowCoexistenceModal(false)}
                className="px-4 py-2 rounded-xl bg-[#774DFF] hover:bg-[#663CE6] text-white text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

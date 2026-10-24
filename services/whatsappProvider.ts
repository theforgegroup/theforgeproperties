import crypto from 'crypto';
import { WhatsAppTemplate } from '../types';

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  isSimulated: boolean;
  error?: string;
  errorCode?: string | number;
  retryable?: boolean;
}

export interface CoexistenceStatus {
  isEligible: boolean;
  activeAppOnPhone: boolean;
  phoneNumber: string;
  countryCode: string;
  liveSendingEnabled: boolean;
  provider: string;
  requirements: string[];
  restrictions: string[];
  onboardingSteps: string[];
  message: string;
}

// Approved WhatsApp Message Templates for The Forge Properties
export const APPROVED_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    name: 'webinar_followup',
    language: 'en',
    category: 'MARKETING',
    status: 'APPROVED',
    body_text: 'Hello {{1}}, thank you for attending The Forge Properties webinar on wealth creation through real estate. As promised, here are the exclusive land banking allocations discussed during the session for {{2}}. Reply YES to receive the complete inspection schedule and documentation breakdown.',
    variables: ['Full Name', 'Estate / Allocation Name'],
    example_preview: 'Hello Abubakar Jafaru, thank you for attending The Forge Properties webinar on wealth creation through real estate. As promised, here are the exclusive land banking allocations discussed during the session for Prasino Lush Phase 2. Reply YES to receive the complete inspection schedule and documentation breakdown.'
  },
  {
    name: 'exclusive_land_investment',
    language: 'en',
    category: 'MARKETING',
    status: 'APPROVED',
    body_text: 'Dear {{1}}, a new verified investment opportunity is now available with The Forge Properties. {{2}} offers high-capital appreciation with instant allocation starting from {{3}}. Would you like our corporate advisory team to share the title deed survey and payment plan?',
    variables: ['Full Name', 'Development Name', 'Starting Price / Terms'],
    example_preview: 'Dear Abubakar Jafaru, a new verified investment opportunity is now available with The Forge Properties. Greenwood Reserve Kobape offers high-capital appreciation with instant allocation starting from ₦1.8M. Would you like our corporate advisory team to share the title deed survey and payment plan?'
  },
  {
    name: 'site_inspection_invitation',
    language: 'en',
    category: 'MARKETING',
    status: 'APPROVED',
    body_text: 'Good day {{1}}, you are cordially invited to an exclusive physical site inspection with The Forge Properties this {{2}} at {{3}}. Chauffeur pickup is available from our Ikeja corporate hub. Please reply CONFIRM to reserve your seat.',
    variables: ['Full Name', 'Inspection Date', 'Project Location'],
    example_preview: 'Good day Abubakar Jafaru, you are cordially invited to an exclusive physical site inspection with The Forge Properties this Saturday 10:00 AM at Prasino Lush Phase 2, Epe Corridor. Chauffeur pickup is available from our Ikeja corporate hub. Please reply CONFIRM to reserve your seat.'
  },
  {
    name: 'realtor_network_update',
    language: 'en',
    category: 'UTILITY',
    status: 'APPROVED',
    body_text: 'Hello {{1}}, this is an official update from The Forge Realtors Network regarding your account status and commission payout policy for {{2}}. Tap below or reply to speak with your designated brokerage manager.',
    variables: ['Full Name', 'Quarter / Allocation Period'],
    example_preview: 'Hello Abubakar Jafaru, this is an official update from The Forge Realtors Network regarding your account status and commission payout policy for Q4 2026. Tap below or reply to speak with your designated brokerage manager.'
  }
];

export class WhatsAppProviderService {
  private phoneNumberId: string;
  private accessToken: string;
  private appSecret: string;
  private verifyToken: string;
  private liveSendingEnabled: boolean;

  constructor() {
    // Standardize environment variable resolution with backwards-compatible aliases
    this.phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.appSecret = process.env.META_WHATSAPP_APP_SECRET || process.env.WHATSAPP_APP_SECRET || '';
    this.verifyToken = process.env.META_WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'theforge_webhook_verify_2026';
    
    // Strict enforcement: WHATSAPP_LIVE_SENDING_ENABLED must be explicitly 'true'
    this.liveSendingEnabled = process.env.WHATSAPP_LIVE_SENDING_ENABLED === 'true';

    this.logStartupDiagnostics();
  }

  /**
   * Log startup configuration status without leaking sensitive tokens or secrets
   */
  private logStartupDiagnostics(): void {
    const hasPhoneId = Boolean(this.phoneNumberId && this.phoneNumberId.trim().length > 0);
    const hasToken = Boolean(this.accessToken && this.accessToken.trim().length > 0);
    const hasSecret = Boolean(this.appSecret && this.appSecret.trim().length > 0);
    const maskedToken = hasToken ? `${this.accessToken.substring(0, 6)}... (len: ${this.accessToken.length})` : 'NOT_SET';

    console.log('[WhatsAppProvider] Initialized provider status:', {
      hasPhoneNumberId: hasPhoneId,
      hasAccessToken: hasToken,
      hasAppSecret: hasSecret,
      tokenMasked: maskedToken,
      liveSendingEnabled: this.liveSendingEnabled,
      mode: this.liveSendingEnabled && hasPhoneId && hasToken ? 'LIVE_META_API' : 'SAFE_TEST_SIMULATION'
    });
  }

  /**
   * Get WhatsApp Coexistence Status for The Forge Properties
   * Preserves current mobile WhatsApp Business App and details Meta Cloud API eligibility.
   */
  public getCoexistenceStatus(): CoexistenceStatus {
    const isLiveConfigured = Boolean(
      this.phoneNumberId && 
      this.accessToken && 
      this.liveSendingEnabled
    );

    return {
      isEligible: true, // Meta officially supports coexistence for Nigerian numbers (+234)
      activeAppOnPhone: true,
      phoneNumber: '+234 800 FORGE (Preserved on Android / iOS Phone)',
      countryCode: '+234 (Nigeria)',
      liveSendingEnabled: isLiveConfigured,
      provider: 'Meta WhatsApp Cloud API (Official Business Platform)',
      requirements: [
        'Primary phone running WhatsApp Business App must be powered on and opened at least once every 13-14 days.',
        'Meta Business Manager (WABA) must be verified with corporate business registration (CAC) for The Forge Properties.',
        'A valid corporate payment method must be attached in Meta Business Suite for template messaging billing.',
        'Outbound marketing campaigns must utilize pre-approved message templates.'
      ],
      restrictions: [
        'Enabling coexistence automatically disables native broadcast lists, live location, and disappearing messages in the mobile phone app.',
        'Voice calls remain exclusive to the mobile phone app (not routed via Cloud API).',
        'Direct 1-on-1 chats and replies mirror to the phone app via smb_message_echoes webhooks.'
      ],
      onboardingSteps: [
        'Step 1: Verify The Forge Properties Meta Business Manager (business.facebook.com).',
        'Step 2: Create a WhatsApp Business Account (WABA) inside Meta Business Suite.',
        'Step 3: Register current Nigerian phone number under WABA using Coexistence mode (do not click Deregister in mobile app).',
        'Step 4: Generate a System User Permanent Access Token with whatsapp_business_messaging and whatsapp_business_management permissions.',
        'Step 5: Set META_WHATSAPP_PHONE_NUMBER_ID, META_WHATSAPP_ACCESS_TOKEN, and WHATSAPP_LIVE_SENDING_ENABLED=true in server environment variables.',
        'Step 6: Submit message templates for Meta approval (2-24 hrs turnaround).'
      ],
      message: isLiveConfigured
        ? 'WhatsApp Business Platform Coexistence is ACTIVE in Live Sending Mode.'
        : 'WhatsApp Business App is SAFELY PRESERVED on the mobile device. Live sending is DISABLED; running in Safe Test / Dry-Run Mode. No real messages are sent without explicit credentials.'
    };
  }

  /**
   * List approved WhatsApp templates
   */
  public getTemplates(): WhatsAppTemplate[] {
    return APPROVED_WHATSAPP_TEMPLATES;
  }

  /**
   * Send WhatsApp Template Message
   * Dispatches via official Meta Cloud API if live sending is enabled;
   * otherwise executes safely in Test Mode with deterministic, simulated delivery.
   */
  public async sendTemplateMessage(
    recipientNumber: string,
    templateName: string,
    variables: Record<string, string> = {},
    language: string = 'en'
  ): Promise<WhatsAppSendResult> {
    const cleanNumber = recipientNumber.replace(/[^0-9]/g, '');

    // Validate phone number length (Nigeria: 11-13 digits, US/UK: 10-12 digits)
    if (cleanNumber.length < 10) {
      return {
        success: false,
        isSimulated: false,
        error: `Invalid phone number: ${recipientNumber} has fewer than 10 digits`,
        errorCode: 'INVALID_PHONE_NUMBER',
        retryable: false
      };
    }

    const template = APPROVED_WHATSAPP_TEMPLATES.find(t => t.name === templateName);
    if (!template) {
      return {
        success: false,
        isSimulated: false,
        error: `Template "${templateName}" is not an approved Meta template`,
        errorCode: 'UNAPPROVED_TEMPLATE',
        retryable: false
      };
    }

    // SAFE TEST / DRY-RUN MODE:
    // If live sending is not explicitly activated, simulate the call safely.
    if (!this.liveSendingEnabled || !this.phoneNumberId || !this.accessToken) {
      const simulatedMessageId = `sim_wamid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log(`[WhatsApp TEST MODE] Simulated send to ${recipientNumber} using template "${templateName}"`, {
        recipientNumber,
        templateName,
        variables,
        simulatedMessageId
      });

      return {
        success: true,
        providerMessageId: simulatedMessageId,
        isSimulated: true
      };
    }

    // LIVE META CLOUD API CALL:
    try {
      const endpoint = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;

      // Build components payload
      const variableValues = Object.values(variables);
      const components = variableValues.length > 0 ? [
        {
          type: 'body',
          parameters: variableValues.map(val => ({
            type: 'text',
            text: String(val || '')
          }))
        }
      ] : [];

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data?.error || {};
        const isRateLimit = response.status === 429 || errorData.code === 130429;
        const isTransient = response.status >= 500 || isRateLimit;

        return {
          success: false,
          isSimulated: false,
          error: errorData.message || `Meta API returned HTTP ${response.status}`,
          errorCode: errorData.code || response.status,
          retryable: isTransient
        };
      }

      const messageId = data?.messages?.[0]?.id;
      return {
        success: true,
        providerMessageId: messageId,
        isSimulated: false
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        isSimulated: false,
        error: `Network dispatch error: ${msg}`,
        errorCode: 'NETWORK_TIMEOUT',
        retryable: true
      };
    }
  }

  /**
   * Verify Meta Webhook Challenge Token (GET /api/webhooks/whatsapp)
   */
  public verifyWebhookChallenge(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Verify Meta Webhook Payload Signature (POST /api/webhooks/whatsapp)
   * Enforces raw-body HMAC SHA256 validation.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    if (!this.appSecret) {
      // In development when secret is not configured, accept with warning
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      return false;
    }

    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    const signature = signatureHeader.substring(7);
    const expectedSignature = crypto
      .createHmac('sha256', this.appSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }
}

export const whatsappProvider = new WhatsAppProviderService();

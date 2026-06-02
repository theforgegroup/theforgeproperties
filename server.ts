import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const devIndexHtmlPath = path.resolve(process.cwd(), 'index.html');

const escapeHtml = (text: string): string => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = 3000;

  const supabaseUrl = 'https://amoqzkmzoclsyhuigazo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb3F6a216b2Nsc3lodWlnYXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNTYxNjUsImV4cCI6MjA4MDYzMjE2NX0.OMocRVGkcm8V0yslfSXUIvx9mMIQ3KLN6_1SGANB3E8';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let vite: ViteDevServer | null = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // Helper to dynamically modify index.html for metadata previews
  const getDynamicHtml = async (originalHtml: string, slug: string, reqUrl: string) => {
    try {
      // Decode URL parameter in case it contains %20 or other encoded characters
      const cleanSlug = decodeURIComponent(slug);
      
      // Fetch post by slug first, with fallback to ID
      const { data: initialPost, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

      let post = initialPost;

      if (error) {
        console.error('Supabase query error (slug):', error);
      }

      if (!post) {
        const { data: fallbackPost, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', cleanSlug)
          .maybeSingle();

        if (fallbackError) {
          console.error('Supabase query error (id):', fallbackError);
        } else if (fallbackPost) {
          post = fallbackPost;
        }
      }

      if (post) {
        const titleVal = escapeHtml(`${post.title} | The Forge Properties`);
        const excerptText = post.meta_description || post.excerpt || 'Reading from The Forge Journal';
        const descriptionVal = escapeHtml(excerptText);
        const imageVal = escapeHtml(post.cover_image || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&h=630&fit=crop');

        let html = originalHtml;
        
        // Replace Document Title
        html = html.replace(/<title>.*?<\/title>/gi, `<title>${titleVal}</title>`);
        
        // Helper to replace or inject a meta tag
        const injectMeta = (htmlContent: string, name: string, value: string, attr: 'name' | 'property' = 'name') => {
          // Remove existing meta tag with that name/property first to prevent duplication
          const regex = new RegExp(`<meta\\s+[^>]*?${attr}=["']${name.replace(/:/g, '\\:')}["'][^>]*?>`, 'gi');
          const cleanContent = htmlContent.replace(regex, '');
          
          const newTag = `<meta ${attr}="${name}" content="${value}" />`;
          // Inject in head before </head>
          return cleanContent.replace('</head>', `  ${newTag}\n</head>`);
        };

        html = injectMeta(html, 'description', descriptionVal);
        html = injectMeta(html, 'og:title', escapeHtml(post.title), 'property');
        html = injectMeta(html, 'og:description', descriptionVal, 'property');
        html = injectMeta(html, 'og:image', imageVal, 'property');
        html = injectMeta(html, 'og:image:secure_url', imageVal, 'property');
        html = injectMeta(html, 'og:type', 'article', 'property');
        html = injectMeta(html, 'og:url', reqUrl, 'property');
        html = injectMeta(html, 'og:site_name', 'The Forge Properties', 'property');
        html = injectMeta(html, 'og:image:width', '1200', 'property');
        html = injectMeta(html, 'og:image:height', '630', 'property');
        html = injectMeta(html, 'twitter:card', 'summary_large_image');
        html = injectMeta(html, 'twitter:title', escapeHtml(post.title));
        html = injectMeta(html, 'twitter:description', descriptionVal);
        html = injectMeta(html, 'twitter:image', imageVal);

        return html;
      }
    } catch (err) {
      console.error('Failed to inject metadata for preview:', err);
    }
    return originalHtml;
  };

  // API Routes or other server-side triggers go here
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/ai/chat', express.json(), async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
      if (!apiKey || apiKey === "undefined") {
        return res.json({
          response: "I'm currently undergoing a brief update. Please reach out directly to theforgeproperties@gmail.com or call +234 810 613 3572 for immediate support!"
        });
      }

      // Initialize GoogleGenAI with the recommended User-Agent for modern @google/genai calls
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Fetch dynamic active listings context to make the AI extremely smart about actual products!
      let inventoryStr = "We have luxury properties & premium plots available in Lagos (such as Sangotedo, Ajah, Lekki, and Ibeju-Lekki).";
      try {
        const { data: properties, error: dbError } = await supabase
          .from('properties')
          .select('*')
          .limit(6);
        
        if (dbError) {
          console.error("Supabase properties query error for chat:", dbError);
        } else if (properties && properties.length > 0) {
          inventoryStr = properties.map(p => 
            `- **${p.title}**: Located in ${p.location}, price: ₦${Number(p.price).toLocaleString()}, Type: ${p.type}, Status: ${p.status}`
          ).join('\n');
        }
      } catch (dbErr) {
        console.error("Failed to fetch properties from Supabase for AI context:", dbErr);
      }

      const systemInstruction = `You are "The Forge AI Land Enquiry Assistant" — an elite real estate documentation, land titles, and property investment expert for "The Forge Properties" in Nigeria.
      
      Your goal is to provide sophisticated, authoritative, and helpful answers to visitors looking to invest in properties, buy land, or understand titles in Nigeria (e.g., C of O, Governor's Consent, Gazette, Excision, Deed of Assignment, Survey Plan, Governor's Consent resale rules, and land verification).

      Tone Guidelines:
      - Sophisticated, highly professional, warm, yet elite.
      - Use clear Nigerian real estate terminology, but keep it accessible.
      - Never sound desperate or robotic. Be objective and reassuring.

      Inventory Content (Only mention these if the user is interested in properties or ready to invest):
      ${inventoryStr}

      Nigerian Documentation Cheat Sheet:
      1. C of O (Certificate of Occupancy): Highest document certifying 99 years of ownership from the State Government.
      2. Governor's Consent: Needed whenever a land with an existing C of O is resold. Validates the transfer legally.
      3. Excision: The portion of general land officially released by state governments to rural communities, rendering it excision-secure for private buyers.
      4. Gazette: Official gazetted book publishing excision. Legally superb.
      5. Free from Acquisition: Land that has been surveyed and found not to be earmarked for future government infrastructure.

      Response Rules:
      - Provide useful answers using clear markdown list points and bolding where appropriate.
      - Do not overwhelm; keep replies engaging and elegant (typically under 120 words).
      - If they need physical viewing, land inspection, surveyor verification, or custom callback, warmly encourage them of their option to submit a Consultation Request directly in this assistant widget anytime.`;

      // Build chat contents from history
      const formattedContents = [];
      
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }
      
      // Append current user message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      // Gemini strictly requires:
      // 1. First turn must be 'user'
      // 2. Roles must alternate strictly between 'user' and 'model'
      const sanitizedContents: { role: string; parts: { text: string }[] }[] = [];
      for (const turn of formattedContents) {
        if (sanitizedContents.length === 0) {
          if (turn.role === 'user') {
            sanitizedContents.push(turn);
          }
        } else {
          const lastTurn = sanitizedContents[sanitizedContents.length - 1];
          if (lastTurn.role !== turn.role) {
            sanitizedContents.push(turn);
          } else {
            // Merge same-role adjacent messages to ensure no content is dropped
            lastTurn.parts.push(...turn.parts);
          }
        }
      }

      // Fallback guarantees at least the current query is sent if history is empty or filtered
      if (sanitizedContents.length === 0) {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: sanitizedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "I'm here to support your real estate questions. Could you please rephrase?";
      res.json({ response: reply });

    } catch (err) {
      console.error('AI Chat Assistant Error:', err);
      res.status(500).json({ error: 'Failed to process assistant request' });
    }
  });

  app.post('/api/ai/concierge', express.json(), async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
      if (!apiKey || apiKey === "undefined") {
        return res.json({
          response: "Our concierge brokers are live at +234 810 613 3572 to provide direct advice immediately."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Fetch dynamic active listings context safely
      let inventoryStr = "We have luxury properties & premium plots available in Lagos (such as Sangotedo, Ajah, Lekki, and Ibeju-Lekki).";
      try {
        const { data: properties, error: dbError } = await supabase
          .from('properties')
          .select('*')
          .limit(8);
        
        if (dbError) {
          console.error("Supabase properties query error for concierge:", dbError);
        } else if (properties && properties.length > 0) {
          inventoryStr = properties.map(p => 
            `- **${p.title}**: Located in ${p.location}, price: ₦${Number(p.price).toLocaleString()}, Type: ${p.type}, Status: ${p.status}`
          ).join('\n');
        }
      } catch (dbErr) {
        console.error("Failed to fetch properties for concierge:", dbErr);
      }

      const systemInstruction = `You are 'The Forge AI', the elite digital concierge for 'The Forge Properties' Nigeria.
      
      Your goal is to provide sophisticated, helpful, and exclusive service. Assist clients with searching for luxury real estate, villas, land acquisitions, and premium homes.
      
      Tone: Sophisticated, highly professional, elite, and exclusive.
      
      Available Properties Context:
      ${inventoryStr}

      Response Rules:
      - If a matching property exists in context, highlight its features elegantly.
      - If no match, warmly refer them to theforgeproperties@gmail.com or recommend contacting our senior brokers directly at +234 810 613 3572.
      - Keep responses under 75 words.`;

      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          formattedContents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }]
          });
        }
      }

      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const sanitizedContents: { role: string; parts: { text: string }[] }[] = [];
      for (const turn of formattedContents) {
        if (sanitizedContents.length === 0) {
          if (turn.role === 'user') {
            sanitizedContents.push(turn);
          }
        } else {
          const lastTurn = sanitizedContents[sanitizedContents.length - 1];
          if (lastTurn.role !== turn.role) {
            sanitizedContents.push(turn);
          } else {
            lastTurn.parts.push(...turn.parts);
          }
        }
      }

      if (sanitizedContents.length === 0) {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: sanitizedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text || "I'm here to support your real estate questions. Could you please rephrase?";
      res.json({ response: reply });

    } catch (err) {
      console.error('Concierge Assistant Error:', err);
      res.status(500).json({ error: 'Failed to process concierge request' });
    }
  });

  app.post('/api/ai/leads', express.json(), async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || (!email && !phone)) {
        return res.status(400).json({ error: 'Name and either email or phone is required' });
      }

      const cleanLead = {
        id: crypto.randomUUID(),
        name,
        email: email || '',
        phone: phone || '',
        message: message || 'AI Assistant callback consultation request',
        date: new Date().toISOString(),
        status: 'New',
        type: 'General Inquiry'
      };

      const { data, error } = await supabase.from('leads').insert([cleanLead]).select();
      if (error) {
        console.error('Supabase lead insert error:', error);
        throw error;
      }

      res.json({ success: true, lead: data?.[0] });
    } catch (err) {
      console.error('AI Lead Submission Error:', err);
      res.status(500).json({ error: 'Failed to submit high-intent lead' });
    }
  });

  // Intercept the /blog/:slug routes specifically for dynamic content injection
  app.get('/blog/:slug', async (req, res, next) => {
    try {
      const slug = req.params.slug;
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      if (process.env.NODE_ENV !== 'production' && vite) {
        const template = fs.readFileSync(devIndexHtmlPath, 'utf-8');
        // Apply Vite HTML transforms if in development
        const transformedTemplate = await vite.transformIndexHtml(req.originalUrl, template);
        const dynamicHtml = await getDynamicHtml(transformedTemplate, slug, fullUrl);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(dynamicHtml);
      } else {
        const distIndex = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distIndex)) {
          const template = fs.readFileSync(distIndex, 'utf-8');
          const dynamicHtml = await getDynamicHtml(template, slug, fullUrl);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(dynamicHtml);
        }
      }
    } catch (e) {
      console.error('Error serving dynamic blog route:', e);
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production' && vite) {
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html globally for SPA routing
    app.get('*', async (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

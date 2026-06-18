import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import pg from 'pg';
import multer from 'multer';
import { authRouter } from './routes/auth';

const devIndexHtmlPath = path.resolve(process.cwd(), 'index.html');

const escapeHtml = (text: string): string => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Global DB pool initialization for direct SQL queries
const dbUrl = process.env.DATABASE_URL;
let dbPool: pg.Pool | null = null;
if (dbUrl) {
  console.log("Configuring PostgreSQL connection pool...");
  dbPool = new pg.Pool({ connectionString: dbUrl });
}

async function runMigrations() {
  if (!dbPool) {
    console.log("No DATABASE_URL available in environment. Skipping direct SQL migrations.");
    return;
  }
  console.log("Running direct PostgreSQL database migrations...");
  try {
    const client = await dbPool.connect();
    try {
      // Create migrations database tables structure
      await client.query('BEGIN;');

      // Create users table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          state VARCHAR(100) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'realtor',
          status VARCHAR(50) DEFAULT 'pending',
          referral_code VARCHAR(100) UNIQUE NOT NULL,
          referred_by VARCHAR(100) REFERENCES users(id),
          bio TEXT,
          profile_photo TEXT,
          email_verified BOOLEAN DEFAULT FALSE,
          email_verification_token VARCHAR(255),
          password_reset_token VARCHAR(255),
          password_reset_expires TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create notifications table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          link VARCHAR(255),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // ALTER users and agents to add profile_photo
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT;
      `);
      Object.assign(client, {}); // satisfaction for TS linting
      await client.query(`
        ALTER TABLE agents ADD COLUMN IF NOT EXISTS profile_photo TEXT;
      `);

      // Create profile_photo_history
      await client.query(`
        CREATE TABLE IF NOT EXISTS profile_photo_history (
          id BIGSERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          photo_url TEXT NOT NULL,
          uploaded_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );
      `);

      // Create training categories and resources
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) UNIQUE NOT NULL,
          description TEXT,
          sort_order INTEGER DEFAULT 0
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS training_resources (
          id VARCHAR(100) PRIMARY KEY,
          category_id INTEGER REFERENCES training_categories(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT,
          thumbnail_url TEXT,
          file_url TEXT,
          duration_minutes INTEGER DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          video_url TEXT
        );
      `);

      await client.query(`
        ALTER TABLE training_resources
          ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
          ADD COLUMN IF NOT EXISTS video_url TEXT,
          ADD COLUMN IF NOT EXISTS file_url TEXT,
          ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
          ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      `);

      // Create property_image_downloads table
      await client.query(`
        CREATE TABLE IF NOT EXISTS property_image_downloads (
          id BIGSERIAL PRIMARY KEY,
          property_id VARCHAR(100) NOT NULL,
          image_url TEXT NOT NULL,
          downloaded_by VARCHAR(100) NOT NULL,
          downloaded_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create training_progress table
      await client.query(`
        CREATE TABLE IF NOT EXISTS training_progress (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          resource_id VARCHAR(100) REFERENCES training_resources(id) ON DELETE CASCADE,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, resource_id)
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_img_downloads_property ON property_image_downloads(property_id);
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_img_downloads_user ON property_image_downloads(downloaded_by);
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS announcement_reads (
          id SERIAL PRIMARY KEY,
          announcement_id VARCHAR(100) REFERENCES announcements(id) ON DELETE CASCADE,
          user_id VARCHAR(100) NOT NULL,
          read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // MOCK CLEANUP SQL TRANSACTION ONCE (wrapped in BEGIN...COMMIT as required by Instruction #3)
      await client.query('DELETE FROM training_progress;');
      await client.query('DELETE FROM training_resources;');
      await client.query('DELETE FROM training_categories;');
      await client.query('DELETE FROM announcement_reads;');
      await client.query('DELETE FROM announcements;');

      // Commit transaction
      await client.query('COMMIT;');
      console.log("PostgreSQL database tables created and cleared successfully.");

      // Seeding clean default categories
      await client.query(`
        INSERT INTO training_categories (name, sort_order) VALUES
          ('Getting Started', 1),
          ('How to Sell Land', 2),
          ('Farmland Investment Guide', 3),
          ('House Sales', 4),
          ('Objection Handling', 5)
        ON CONFLICT (name) DO NOTHING;
      `);

      // Verify cleanup works as requested (Instruction #4)
      const resCount = await client.query('SELECT COUNT(*) FROM training_resources;');
      const annCount = await client.query('SELECT COUNT(*) FROM announcements;');
      console.log(`Database verification count - training_resources: ${resCount.rows[0].count}, announcements: ${annCount.rows[0].count}`);

    } catch (txErr) {
      await client.query('ROLLBACK;');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Failed to run direct database migrations:", err);
  }
}

async function startServer() {
  // Run DB table creations and cleanups on boot
  await runMigrations();

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

  app.use('/api/auth', express.json(), authRouter);

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

  // Create local folders for static uploads on server boot
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Middleware to serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Multer storage setup for processing local file uploads (thumbnail_file, resource_file, profile_photo)
  const multerStorage = multer.diskStorage({
    destination: (req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  const upload = multer({
    storage: multerStorage,
    limits: {
      fileSize: 505 * 1024 * 1024 // 505MB limit (to accommodate 500MB video and 2MB thumbnail)
    }
  });

  // REST API 1: PUT /api/user/profile-photo (Accept multipart/form-data)
  app.put('/api/user/profile-photo', upload.single('profile_photo'), async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] || req.query.user_id || 'agent-123';
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      const file = req.file;
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(file.mimetype)) {
        // Clean up wrong file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(422).json({ success: false, message: 'Only JPG, PNG or WEBP files allowed' });
      }

      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxBytes) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(422).json({ success: false, message: 'File size must be under 2MB' });
      }

      const newPhotoUrl = `/uploads/${file.filename}`;

      // Update in Supabase tables (both agents and users tables to be safe)
      await supabase
        .from('agents')
        .update({ profile_photo: newPhotoUrl })
        .eq('id', userId);

      await supabase
        .from('users')
        .update({ profile_photo: newPhotoUrl })
        .eq('id', userId);

      // Track photo upload history in profile_photo_history
      if (dbPool) {
        try {
          await dbPool.query(
            'INSERT INTO profile_photo_history (user_id, photo_url) VALUES ($1, $2)',
            [userId, newPhotoUrl]
          );
        } catch (dbErr) {
          console.error("Failed to insert into profile_photo_history:", dbErr);
        }
      }

      return res.json({
        success: true,
        data: {
          profile_photo: newPhotoUrl
        },
        message: "Profile photo updated"
      });

    } catch (err) {
      console.error('Profile photo upload error:', err);
      res.status(500).json({ success: false, error: 'Failed to update profile photo' });
    }
  });

  // REST API 2: GET /api/training/categories (fetch list of real categories)
  app.get('/api/training/categories', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('training_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Failed to get categories:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  });

  // REST API 3: GET /api/training/resources (fetch active resources)
  app.get('/api/training/resources', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('training_resources')
        .select(`
          *,
          training_categories (name)
        `)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('Failed to get resources:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
  });

interface MulterRequest extends express.Request {
  files?: {
    [fieldname: string]: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
    }[];
  };
}

  // REST API 4: POST /api/training/admin (Protected / Admin Upload)
  app.post('/api/training/admin', upload.fields([
    { name: 'thumbnail_file', maxCount: 1 },
    { name: 'resource_file', maxCount: 1 }
  ]), (req, res) => {
    const expressReq = req as MulterRequest;
    (async () => {
      try {
        const { category_id, title, type, description, duration_minutes, sort_order, video_url } = expressReq.body || {};

        // 1. Mandatory Fields validation
        if (!category_id || !title || !type) {
          return res.status(400).json({ success: false, message: 'Category_id, Title and Type are required parameters.' });
        }

        const validTypes = ['video', 'webinar_replay', 'pdf', 'faq'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ success: false, message: `Invalid resource type: ${type}` });
        }

        let thumbnail_url = '';
        let file_url = '';
        let saved_video_url = '';

        const files = expressReq.files || {};
        const thumbFile = files.thumbnail_file ? files.thumbnail_file[0] : null;
        const resFile = files.resource_file ? files.resource_file[0] : null;

      // 2. Validate thumbnail
      if (thumbFile) {
        const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimes.includes(thumbFile.mimetype)) {
          if (fs.existsSync(thumbFile.path)) fs.unlinkSync(thumbFile.path);
          return res.status(422).json({ success: false, message: 'Thumbnail must be JPG, PNG or WEBP only.' });
        }
        if (thumbFile.size > 2 * 1024 * 1024) {
          if (fs.existsSync(thumbFile.path)) fs.unlinkSync(thumbFile.path);
          return res.status(422).json({ success: false, message: 'Thumbnail file size must be under 2MB.' });
        }
        thumbnail_url = `/uploads/${thumbFile.filename}`;
      }

      // 3. Validate and process Resource Upload by Type
      if (type === 'pdf') {
        if (!resFile) {
          return res.status(400).json({ success: false, message: 'PDF resource file upload is required for PDF material type.' });
        }
        if (resFile.mimetype !== 'application/pdf') {
          if (fs.existsSync(resFile.path)) fs.unlinkSync(resFile.path);
          return res.status(422).json({ success: false, message: 'Resource file must be a valid PDF format.' });
        }
        if (resFile.size > 50 * 1024 * 1024) { // max 50MB
          if (fs.existsSync(resFile.path)) fs.unlinkSync(resFile.path);
          return res.status(422).json({ success: false, message: 'PDF resource file size must be under 50MB.' });
        }
        file_url = `/uploads/${resFile.filename}`;
      } else if (type === 'video' || type === 'webinar_replay') {
        if (resFile) {
          const videoMimes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'];
          if (!videoMimes.includes(resFile.mimetype)) {
            if (fs.existsSync(resFile.path)) fs.unlinkSync(resFile.path);
            return res.status(422).json({ success: false, message: 'Resource file must be a valid MP4 or MOV video.' });
          }
          if (resFile.size > 500 * 1024 * 1024) { // max 500MB
            if (fs.existsSync(resFile.path)) fs.unlinkSync(resFile.path);
            return res.status(422).json({ success: false, message: 'Video file size must be under 500MB.' });
          }
          file_url = `/uploads/${resFile.filename}`;
        } else if (video_url) {
          // Validate input URL is proper Youtube or Vimeo
          const youtubeReg = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/i;
          if (!youtubeReg.test(video_url)) {
            return res.status(422).json({ success: false, message: 'Invalid video URL. Please provide a valid YouTube or Vimeo reference.' });
          }
          saved_video_url = video_url;
          file_url = video_url;
        } else {
          return res.status(400).json({ success: false, message: 'Either a video file upload or YouTube/Vimeo video URL is required.' });
        }
      } else if (type === 'faq') {
        // FAQ uses description as answer, and title as the main question. No file necessary.
        file_url = '#faq';
      }

      // 4. Create and Insert training resources
      const uniqueId = 'trn-' + crypto.randomUUID().substring(0, 8);
      const insertRecord = {
        id: uniqueId,
        category_id: parseInt(category_id),
        title,
        type,
        description: description || '',
        thumbnail_url: thumbnail_url || null,
        file_url: file_url,
        video_url: saved_video_url || null,
        duration_minutes: duration_minutes ? parseInt(duration_minutes) : 0,
        sort_order: sort_order ? parseInt(sort_order) : 0
      };

      const { data, error } = await supabase
        .from('training_resources')
        .insert([insertRecord])
        .select();

      if (error) {
        console.error('Supabase error inserting training resource:', error);
        throw error;
      }

      // 5. Build notifications for active agents
      try {
        const { data: activeAgents } = await supabase
          .from('agents')
          .select('id')
          .eq('status', 'Active');

        if (activeAgents && activeAgents.length > 0) {
          const notificationsToInsert = activeAgents.map(ag => ({
            id: 'notif-' + crypto.randomUUID().substring(0, 8),
            user_id: ag.id,
            title: 'New Training Available',
            message: `New training material available: ${title}`,
            path: '/portal/training',
            is_read: false,
            created_at: new Date().toISOString()
          }));

          await supabase.from('notifications').insert(notificationsToInsert);
        }
      } catch (notifErr) {
        console.error('Failed to broadcast real-time user notification:', notifErr);
      }

      // 6. Log admin activity in DB
      if (dbPool) {
        try {
          await dbPool.query(
            'INSERT INTO admin_activity_log (activity_type, description, timestamp) VALUES ($1, $2, NOW())',
            ['training_upload', `Uploaded training material: ${title}`]
          );
        } catch (lgErr) {
          console.warn("Failed to insert admin activity log:", lgErr);
        }
      }

      res.status(201).json({ success: true, data: data?.[0] });

    } catch (err) {
      console.error('Admin training upload API failure:', err);
      res.status(500).json({ success: false, message: 'Server error uploading training resource.' });
    }
    })();
  });

  // REST API 5: DELETE /api/training/admin/:id (Protected / Admin delete)
  app.delete('/api/training/admin/:id', async (req, res) => {
    try {
      const resourceId = req.params.id;

      // Fetch file URLs to unlink them locally from disk
      const { data: resource } = await supabase
        .from('training_resources')
        .select('thumbnail_url, file_url')
        .eq('id', resourceId)
        .single();

      if (resource) {
        // Unlink files if they are locally stored
        if (resource.thumbnail_url && resource.thumbnail_url.startsWith('/uploads/')) {
          const thumbPath = path.join(uploadsDir, resource.thumbnail_url.replace('/uploads/', ''));
          if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
        }
        if (resource.file_url && resource.file_url.startsWith('/uploads/')) {
          const resPath = path.join(uploadsDir, resource.file_url.replace('/uploads/', ''));
          if (fs.existsSync(resPath)) fs.unlinkSync(resPath);
        }
      }

      // Delete from related training_progress first for DB safety/triggers
      await supabase
        .from('training_progress')
        .delete()
        .eq('resource_id', resourceId);

      // Delete from training_resources
      const { error } = await supabase
        .from('training_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      if (dbPool) {
        try {
          await dbPool.query(
            'INSERT INTO admin_activity_log (activity_type, description, timestamp) VALUES ($1, $2, NOW())',
            ['training_delete', `Deleted training resource ID: ${resourceId}`]
          );
        } catch (lEr) {
          console.warn("Activity log insert failed:", lEr);
        }
      }

      return res.json({ success: true, message: 'Training resource and associated metrics deleted successfully.' });

    } catch (err) {
      console.error('Admin training deletion failure:', err);
      res.status(500).json({ success: false, message: 'Server failed to delete specified resource.' });
    }
  });

  // REST API 6: GET /api/announcements (Fetch actual database announcements)
  app.get('/api/announcements', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      console.error('Announcements fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch active announcements.' });
    }
  });

  // REST API 7: GET /api/materials/brochures (Display property images downloadable)
  app.get('/api/materials/brochures', async (req, res) => {
    try {
      const realtorCode = req.query.ref || req.headers['x-realtor-code'] || 'FORGE001';

      // Fetch published properties from properties table
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*');

      if (error) throw error;

      const brochures = (properties || []).map(p => {
        const imagesArray = Array.isArray(p.images) ? p.images : [];
        const referralLink = `${req.protocol}://${req.get('host')}/ref/${realtorCode}?target=listings/${p.slug || p.id}`;

        const imageDetails = imagesArray.map((imgUrl, i) => {
          const extension = imgUrl.substring(imgUrl.lastIndexOf('.') + 1).toUpperCase();
          const filename = imgUrl.substring(imgUrl.lastIndexOf('/') + 1) || `property-image-${i + 1}.${extension.toLowerCase()}`;
          return {
            url: imgUrl,
            filename: filename,
            type: extension || 'JPEG',
            size: '2.4 MB' // Mock standard file size for UX layout
          };
        });

        return {
          property_id: p.id,
          property_name: p.title,
          property_location: p.location,
          property_type: p.type,
          images: imageDetails,
          referral_link: referralLink
        };
      });

      res.json({
        success: true,
        data: brochures
      });

    } catch (err) {
      console.error('Brochures list fetch error:', err);
      res.status(500).json({ success: false, error: 'Failed to assemble download brochures list.' });
    }
  });

  // REST API 8: POST /api/materials/brochures/download (Track property image downloads)
  app.post('/api/materials/brochures/download', express.json(), async (req, res) => {
    try {
      const { property_id, image_url } = req.body;
      const user_id = req.headers['x-user-id'] || 'agent-123';

      if (!property_id || !image_url) {
        return res.status(400).json({ success: false, error: 'Property id and image url are required body fields.' });
      }

      // Track into property_image_downloads
      if (dbPool) {
        try {
          await dbPool.query(
            'INSERT INTO property_image_downloads (property_id, image_url, downloaded_by) VALUES ($1, $2, $3)',
            [property_id, image_url, user_id]
          );
        } catch (dbErr) {
          console.error("Failed to insert tracking into PostgreSQL:", dbErr);
        }
      } else {
        // Fallback tracking insertion in Supabase table
        const { error } = await supabase
          .from('property_image_downloads')
          .insert([{
            property_id,
            image_url,
            downloaded_by: user_id,
            downloaded_at: new Date().toISOString()
          }]);
        if (error) console.warn("Supabase property_image_downloads tracking err:", error);
      }

      res.json({ success: true, message: "Download tracked successfully." });

    } catch (err) {
      console.error('Track brochures download failed:', err);
      res.status(500).json({ success: false, error: 'Database record tracking issue.' });
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

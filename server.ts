import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const getDynamicHtml = async (originalHtml: string, slug: string) => {
    try {
      // Decode URL parameter in case it contains %20 or other encoded characters
      const cleanSlug = decodeURIComponent(slug);
      
      // Fetch post by slug or ID
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .or(`slug.eq."${cleanSlug}",id.eq."${cleanSlug}"`)
        .maybeSingle();

      if (error) {
        console.error('Supabase query error:', error);
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
        html = injectMeta(html, 'og:url', `https://theforgeproperties.com/blog/${slug}`, 'property');
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

  // Intercept the /blog/:slug routes specifically for dynamic content injection
  app.get('/blog/:slug', async (req, res, next) => {
    try {
      const slug = req.params.slug;
      if (process.env.NODE_ENV !== 'production' && vite) {
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        // Apply Vite HTML transforms if in development
        const transformedTemplate = await vite.transformIndexHtml(req.originalUrl, template);
        const dynamicHtml = await getDynamicHtml(transformedTemplate, slug);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(dynamicHtml);
      } else {
        const distIndex = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distIndex)) {
          const template = fs.readFileSync(distIndex, 'utf-8');
          const dynamicHtml = await getDynamicHtml(template, slug);
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

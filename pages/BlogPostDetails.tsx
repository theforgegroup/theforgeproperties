
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { User, ArrowLeft, Share2, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BlogLandAssistant } from '../components/BlogLandAssistant';

export const BlogPostDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getPost, isLoading } = useProperties();
  
  const post = slug ? (getPostBySlug(slug) || getPost(slug)) : undefined;

  useEffect(() => {
    // If we found a post but via its ID instead of its clean slug,
    // redirect to the clean URL for SEO purposes.
    if (post && slug === post.id && post.slug && post.slug !== post.id) {
      window.history.replaceState(null, '', `/blog/${post.slug}`);
    }
    window.scrollTo(0, 0);
  }, [slug, post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forge-navy pt-20">
        <SEO title="Loading..." />
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-forge-gold border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium text-sm tracking-widest uppercase animate-pulse">
            Loading Journal...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <SEO title="Article Not Found" />
        <div className="text-center p-8 bg-white shadow-xl rounded-sm max-w-md mx-4">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Article Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">We couldn't locate the journal entry you're looking for.</p>
          <Link to="/blog" className="inline-block bg-forge-gold text-forge-navy px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-forge-navy hover:text-white transition-all">
            Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <SEO 
        title={post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.keyphrase}
        image={post.cover_image}
        type="article"
        url={`/blog/${post.slug || post.id}`}
      />

      <div className="container mx-auto px-6 pt-12 md:pt-24 max-w-4xl">
         <div className="flex flex-wrap items-center justify-center gap-3 text-forge-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-6">
            <span className="bg-forge-gold/10 px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-slate-300 opacity-50">•</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.date).toLocaleDateString()}</span>
         </div>
         <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-forge-navy mb-8 leading-tight text-center">
           {post.title}
         </h1>
         <div className="flex items-center justify-center gap-3 text-slate-500 text-sm md:text-base mb-12 font-medium">
           <div className="w-8 h-8 rounded-full bg-forge-navy flex items-center justify-center text-forge-gold">
             <User size={16} />
           </div>
           <span>By {post.author}</span>
         </div>
      </div>

      {post.cover_image && (
        <div className="container mx-auto px-6 max-w-6xl mb-12 md:mb-16">
          <div className="rounded-2xl md:rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/60 bg-slate-50 border border-slate-100/50">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-auto block object-contain mx-auto" 
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row gap-12 lg:gap-24 max-w-7xl">
         {/* Share sidebar */}
         <div className="lg:w-24 order-2 lg:order-1 border-t lg:border-t-0 border-slate-100 pt-8 lg:pt-0">
            <div className="lg:sticky lg:top-32 flex flex-col items-center gap-6">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hidden lg:block vertical-text mb-4">Share Story</span>
               <button 
                title="Share this article"
                className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-forge-navy hover:bg-forge-gold hover:text-white transition-all shadow-xl shadow-slate-200/50 group" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // Using a more subtle notification would be better, but keeping it simple
                  const toast = document.createElement('div');
                  toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-forge-navy text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest z-[200] shadow-2xl animate-bounce';
                  toast.innerText = 'Link Copied to Clipboard';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 3000);
                }}
               >
                 <Share2 size={20} className="group-hover:scale-110 transition-transform" />
               </button>
            </div>
         </div>

         <div className="lg:w-3/4 max-w-3xl order-1 lg:order-2">
            <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-700 leading-relaxed article-content font-medium"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-20 pt-10 border-t border-slate-100">
              <Link to="/blog" className="inline-flex items-center gap-3 text-forge-navy hover:text-forge-gold transition-all font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] group bg-slate-50 px-6 py-4 rounded-2xl">
                <ArrowLeft size={18} className="transform group-hover:-translate-x-2 transition-transform" /> Back to The Journal
              </Link>
            </div>
         </div>
      </div>
      
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
        @media (max-width: 1024px) {
          .vertical-text { display: none; }
        }
      `}</style>
      <BlogLandAssistant />
    </div>
  );
};

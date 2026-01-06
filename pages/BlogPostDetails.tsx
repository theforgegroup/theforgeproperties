
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { User, ArrowLeft, Share2, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';

export const BlogPostDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getPost } = useProperties();
  
  const post = slug ? (getPostBySlug(slug) || getPost(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

      <div className="container mx-auto px-6 pt-12 md:pt-16 max-w-4xl">
         <div className="flex flex-wrap items-center justify-center gap-2 text-forge-gold text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
            <span>{post.category}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
         </div>
         <h1 className="text-2xl md:text-5xl lg:text-6xl font-serif font-bold text-forge-navy mb-8 leading-tight text-center">
           {post.title}
         </h1>
         <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-10">
           <User size={16} className="text-forge-gold" /> <span>By {post.author}</span>
         </div>
      </div>

      {post.cover_image && (
        <div className="w-full h-[35vh] md:h-[60vh] overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col lg:flex-row gap-10 lg:gap-24 max-w-7xl">
         {/* Share sidebar - now hides on mobile to save space, or moves to bottom */}
         <div className="lg:w-24 order-2 lg:order-1">
            <div className="lg:sticky lg:top-32 flex flex-row lg:flex-col gap-6 justify-center lg:items-center">
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hidden lg:block vertical-text mb-4">Share</span>
               <button 
                title="Share this article"
                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-forge-navy hover:border-forge-gold transition-all group" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard");
                }}
               >
                 <Share2 size={18} className="group-hover:scale-110 transition-transform" />
               </button>
            </div>
         </div>

         <div className="lg:w-3/4 max-w-3xl order-1 lg:order-2">
            <div className="prose prose-slate prose-lg max-w-none font-serif text-slate-700 leading-relaxed article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-16 pt-8 border-t border-slate-100">
              <Link to="/blog" className="inline-flex items-center gap-2 text-forge-navy hover:text-forge-gold transition-colors font-bold uppercase text-[10px] md:text-xs tracking-widest group">
                <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" /> Back to The Journal
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
    </div>
  );
};

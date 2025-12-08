import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost } = useProperties();
  const post = id ? getPost(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Article Not Found</h2>
          <Link to="/blog" className="text-forge-gold underline">Return to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Image */}
      {post.image && (
        <div className="w-full h-[50vh] relative">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/30"></div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-forge-navy text-xs font-bold uppercase tracking-widest mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Journal
          </Link>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-forge-navy mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-8">
            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-forge-gold" /> {new Date(post.date).toLocaleDateString()}</span>
              {post.author && <span className="flex items-center gap-2"><User size={16} className="text-forge-gold" /> {post.author}</span>}
            </div>
            <button className="text-slate-400 hover:text-forge-gold transition-colors">
              <Share2 size={20} />
            </button>
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg prose-slate max-w-none font-serif leading-loose"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <Link to="/contact" className="block bg-forge-navy text-white text-center py-8 hover:bg-forge-dark transition-colors">
              <span className="text-forge-gold text-xs uppercase tracking-[0.3em] font-bold block mb-2">Interested in Luxury Real Estate?</span>
              <span className="text-2xl font-serif">Schedule a Consultation Today</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
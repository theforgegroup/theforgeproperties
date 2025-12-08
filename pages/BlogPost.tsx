import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost } = useProperties();
  const post = id ? getPost(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Article Not Found</h2>
          <Link to="/blog" className="text-forge-gold underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  // Calculate read time roughly
  const readTime = Math.ceil(post.content.split(' ').length / 200);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Article Header */}
      <div className="relative h-[50vh] bg-slate-900">
        {post.image && (
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
             <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-forge-gold transition-colors mb-6 text-xs uppercase tracking-widest font-bold">
               <ArrowLeft size={14} /> Back to Journal
             </Link>
             <h1 className="text-3xl md:text-5xl font-serif text-white font-bold leading-tight mb-6">
               {post.title}
             </h1>
             <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-medium">
               <span className="flex items-center gap-2"><Calendar size={16} className="text-forge-gold" /> {new Date(post.date).toLocaleDateString()}</span>
               <span className="flex items-center gap-2"><User size={16} className="text-forge-gold" /> {post.author}</span>
               <span className="flex items-center gap-2"><Clock size={16} className="text-forge-gold" /> {readTime} min read</span>
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-16 shadow-sm border border-slate-100 rounded-sm">
            {/* Content Render */}
            <div 
              className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:text-forge-navy prose-a:text-forge-gold hover:prose-a:text-forge-navy prose-img:rounded-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Share Footer */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center">
               <div>
                 <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Share this article</p>
                 <div className="flex gap-4">
                   <button className="text-slate-600 hover:text-forge-gold transition-colors"><Share2 size={20} /></button>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Author</p>
                  <p className="font-serif text-forge-navy text-lg">{post.author}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
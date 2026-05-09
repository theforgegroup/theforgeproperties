
import React from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { ArrowRight } from 'lucide-react';

export const Blog: React.FC = () => {
  const { posts } = useProperties();
  const publishedPosts = posts
    .filter(p => p.status === 'Published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-white">
      <div className="relative pt-32 md:pt-40 pb-16 md:pb-24 bg-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-forge-navy opacity-50 transform skew-x-[-12deg] translate-x-20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
           <span className="text-forge-gold text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-4 block">The Forge Journal</span>
           <h1 className="text-3xl md:text-7xl font-bold mb-6 leading-tight">Insights & Perspective</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-xl font-medium leading-relaxed"> News, market trends, and curated lifestyle content. </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-24">
         {publishedPosts.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
             {publishedPosts.map(post => {
               const postUrl = `/blog/${post.slug}`;
               return (
                 <article key={post.id} className="flex flex-col group">
                   <Link to={postUrl} className="block overflow-hidden mb-6 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50">
                     {post.cover_image ? (
                        <div className="aspect-[3/2] overflow-hidden flex items-center justify-center bg-slate-50">
                          <img src={post.cover_image} alt={post.title} className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        </div>
                     ) : (
                       <div className="aspect-[3/2] bg-slate-100 flex items-center justify-center text-slate-300"><span className="text-[10px] uppercase tracking-widest font-bold">No Image</span></div>
                     )}
                   </Link>
                   <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em] mb-4 font-bold">
                     <span className="text-forge-gold">{post.category}</span>
                     <span className="opacity-30">•</span>
                     <span>{new Date(post.date).toLocaleDateString()}</span>
                   </div>
                   <Link to={postUrl} className="mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-forge-navy leading-tight group-hover:text-forge-gold transition-colors">
                      {post.title}
                    </h2>
                   </Link>
                   <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3 flex-grow font-medium text-sm md:text-base">{post.excerpt}</p>
                   <Link to={postUrl} className="flex items-center gap-3 text-forge-navy font-bold uppercase tracking-[0.2em] text-[10px] hover:text-forge-gold transition-all self-start group/btn">
                    Read Article <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                   </Link>
                 </article>
               );
             })}
           </div>
         ) : (
           <div className="text-center py-24 md:py-32 border border-dashed border-slate-200 bg-slate-50 rounded-3xl">
             <h3 className="text-xl md:text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">Coming Soon</h3>
             <p className="text-slate-500 font-medium">Our editorial team is curating new content.</p>
           </div>
         )}
      </div>
    </div>
  );
};

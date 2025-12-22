
import React from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { ArrowRight } from 'lucide-react';

export const Blog: React.FC = () => {
  const { posts } = useProperties();
  const publishedPosts = posts
    .filter(p => p.status === 'Published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayPosts = publishedPosts.length > 0 ? publishedPosts : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative pt-32 pb-20 bg-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-forge-navy opacity-50 transform skew-x-[-12deg] translate-x-20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
           <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block animate-fade-in-up">The Forge Journal</span>
           <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Insights & Perspective</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed"> News, market trends, and curated lifestyle content for the discerning individual. </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24">
         {displayPosts.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
             {displayPosts.map(post => (
               <article key={post.id} className="flex flex-col group">
                 <Link to={`/blog/${post.slug}`} className="block overflow-hidden mb-6 rounded-sm">
                   {post.coverImage ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                      </div>
                   ) : (
                     <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300"><span className="font-serif italic">No Image</span></div>
                   )}
                 </Link>
                 <div className="flex items-center gap-4 text-xs text-slate-400 uppercase tracking-widest mb-3">
                   <span className="text-forge-gold font-bold">{post.category}</span>
                   <span>•</span>
                   <span>{new Date(post.date).toLocaleDateString()}</span>
                 </div>
                 <Link to={`/blog/${post.slug}`} className="mb-3"><h2 className="text-2xl font-serif text-forge-navy font-bold leading-tight group-hover:text-forge-gold transition-colors">{post.title}</h2></Link>
                 <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                 <Link to={`/blog/${post.slug}`} className="flex items-center gap-2 text-forge-navy font-bold uppercase tracking-widest text-xs hover:text-forge-gold transition-colors self-start">Read Article <ArrowRight size={16} /></Link>
               </article>
             ))}
           </div>
         ) : (
           <div className="text-center py-20 border border-dashed border-slate-200 bg-slate-50">
             <h3 className="text-2xl font-serif text-slate-400 mb-2">Coming Soon</h3>
             <p className="text-slate-500">Our editorial team is curating new content.</p>
           </div>
         )}
      </div>
    </div>
  );
};

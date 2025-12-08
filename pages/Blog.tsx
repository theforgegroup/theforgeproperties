import React from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { Calendar, User, ArrowRight } from 'lucide-react';

export const Blog: React.FC = () => {
  const { posts } = useProperties();
  const publishedPosts = posts.filter(p => p.status === 'Published').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Architecture"
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
           <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block animate-fade-in-up">News & Insights</span>
           <h1 className="text-4xl md:text-6xl font-serif text-white font-bold mb-6">The Forge Journal</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">Expert perspectives on luxury real estate, market trends, and design.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24">
        {publishedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map((post) => (
              <article key={post.id} className="bg-white group hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
                <Link to={`/blog/${post.id}`} className="block relative h-64 overflow-hidden">
                   {post.image ? (
                     <img 
                       src={post.image} 
                       alt={post.title} 
                       className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                     />
                   ) : (
                     <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                       <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                     </div>
                   )}
                   <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                     {post.categories && post.categories.map(cat => (
                       <span key={cat} className="bg-forge-navy text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                         {cat}
                       </span>
                     ))}
                   </div>
                </Link>
                
                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex items-center text-slate-400 text-xs mb-4 gap-4">
                     <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><User size={12} /> {post.author || 'The Forge'}</span>
                   </div>
                   
                   <Link to={`/blog/${post.id}`} className="block mb-4">
                     <h2 className="text-xl font-serif text-forge-navy group-hover:text-forge-gold transition-colors font-bold leading-tight">
                       {post.title}
                     </h2>
                   </Link>
                   
                   <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                     {post.excerpt}
                   </p>
                   
                   <div className="mt-auto">
                     <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-forge-navy hover:text-forge-gold transition-colors">
                       Read Article <ArrowRight size={14} />
                     </Link>
                   </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-300">
             <h3 className="text-xl font-serif text-slate-400 mb-2">No articles published yet</h3>
             <p className="text-slate-500 text-sm">Check back soon for the latest news.</p>
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Clock, Loader2 } from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const Blog: React.FC = () => {
  const { posts, isLoading } = useProperties();

  // Sort posts by date descending
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-forge-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-slate-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Architecture"
        />
        <div className="relative z-10 container mx-auto px-6 text-center">
           <span className="text-forge-gold text-xs uppercase tracking-[0.4em] font-bold mb-4 block animate-fade-in-up">The Forge Journal</span>
           <h1 className="text-4xl md:text-6xl font-serif text-white font-bold mb-6">Insights & Elegance</h1>
           <p className="text-slate-400 max-w-2xl mx-auto text-lg">
             Expert analysis, market trends, and lifestyle curation from the world of luxury real estate.
           </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 md:py-24">
        {sortedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {sortedPosts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group flex flex-col h-full bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="relative h-64 overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <span className="text-xs uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-0 left-0 bg-forge-gold text-forge-navy text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                    News
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
                    {post.author && <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>}
                  </div>
                  
                  <h3 className="text-2xl font-serif text-forge-navy group-hover:text-forge-gold transition-colors mb-4 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3 text-sm flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 text-forge-navy font-bold uppercase tracking-widest text-xs group-hover:translate-x-2 transition-transform">
                    Read Article <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-sm">
            <h3 className="text-xl font-serif text-slate-400 mb-2">No Articles Published Yet</h3>
            <p className="text-slate-500 text-sm">Our journal is being curated. Please check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
};
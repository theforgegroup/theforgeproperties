import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px]">
        {post.image ? (
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="container mx-auto">
                <Link to="/blog" className="inline-flex items-center text-slate-300 hover:text-white mb-6 text-xs uppercase tracking-widest font-bold transition-colors">
                  <ArrowLeft size={14} className="mr-2" /> Back to Journal
                </Link>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories && post.categories.map(cat => (
                    <span key={cat} className="bg-forge-gold text-forge-navy text-xs font-bold px-3 py-1 uppercase tracking-widest">
                      {cat}
                    </span>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6 max-w-4xl">
                  {post.title}
                </h1>
                
                <div className="flex items-center text-slate-300 text-sm gap-6">
                    <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="flex items-center gap-2"><User size={16} /> By {post.author || 'The Forge'}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:py-20 flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="lg:w-3/4">
            <div 
              className="prose prose-lg prose-slate max-w-none font-serif prose-headings:font-serif prose-headings:text-forge-navy prose-a:text-forge-gold hover:prose-a:text-forge-navy"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>
        </div>

        {/* Sidebar / Share */}
        <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-8">
                <div className="bg-white p-6 shadow-sm border border-slate-200">
                    <h3 className="font-serif text-lg text-forge-navy mb-4 flex items-center gap-2">
                        <Share2 size={18} /> Share this article
                    </h3>
                    <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 rounded flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <Facebook size={18} />
                        </button>
                        <button className="flex-1 bg-sky-500 text-white py-2 rounded flex items-center justify-center hover:bg-sky-600 transition-colors">
                            <Twitter size={18} />
                        </button>
                        <button className="flex-1 bg-blue-700 text-white py-2 rounded flex items-center justify-center hover:bg-blue-800 transition-colors">
                            <Linkedin size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-forge-navy text-white p-8 text-center">
                    <h3 className="font-serif text-xl mb-4">Looking for your dream home?</h3>
                    <p className="text-slate-400 text-sm mb-6">Explore our exclusive portfolio of luxury properties.</p>
                    <Link to="/listings" className="inline-block w-full bg-forge-gold text-forge-navy font-bold uppercase text-xs tracking-widest py-3 hover:bg-white transition-colors">
                        View Listings
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
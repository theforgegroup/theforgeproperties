
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { User, ArrowLeft, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export const BlogPostDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getPost } = useProperties();
  
  // Try finding by slug first, then fallback to ID
  const post = slug ? (getPostBySlug(slug) || getPost(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-sm max-w-md">
          <h2 className="text-2xl font-serif text-forge-navy mb-4">Article Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">We couldn't locate the journal entry you're looking for.</p>
          <Link to="/blog" className="inline-block bg-forge-gold text-forge-navy px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-forge-navy hover:text-white transition-all">
            Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  const blogSchema = {
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
    "author": { "@type": "Organization", "name": "The Forge Properties" },
    "publisher": { "@type": "Organization", "name": "The Forge Properties" },
    "datePublished": post.date,
    "mainEntityOfPage": { "@type": "WebPage", "@id": window.location.href }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <SEO 
        title={post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.keyphrase}
        image={post.coverImage}
        type="article"
        url={`/blog/${post.slug || post.id}`}
        schema={blogSchema}
      />

      <div className="container mx-auto px-6 py-12 max-w-4xl text-center">
         <div className="flex items-center justify-center gap-2 text-forge-gold text-xs font-bold uppercase tracking-widest mb-4">
            <span>{post.category}</span>
            <span className="text-slate-300">•</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
         </div>
         <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-forge-navy mb-8 leading-tight">
           {post.title}
         </h1>
         <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
           <User size={16} /> <span>By {post.author}</span>
         </div>
      </div>

      {post.coverImage && (
        <div className="w-full h-[40vh] md:h-[60vh] overflow-hidden">
          <img src={post.coverImage} alt={`Featured image for: ${post.title}`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-6 py-12 md:py-16 flex flex-col lg:flex-row gap-12 lg:gap-24">
         <div className="lg:w-1/6 order-2 lg:order-1">
            <div className="sticky top-32 flex flex-row lg:flex-col gap-6 justify-center lg:justify-start">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400 hidden lg:block">Share</span>
               <button className="text-slate-400 hover:text-[#1877F2] transition-colors" aria-label="Share on Facebook"><Facebook size={20} /></button>
               <button className="text-slate-400 hover:text-[#1DA1F2] transition-colors" aria-label="Share on Twitter"><Twitter size={20} /></button>
               <button className="text-slate-400 hover:text-[#0A66C2] transition-colors" aria-label="Share on LinkedIn"><Linkedin size={20} /></button>
               <button className="text-slate-400 hover:text-forge-navy transition-colors" aria-label="Share via Link"><Share2 size={20} /></button>
            </div>
         </div>

         <div className="lg:w-2/3 order-1 lg:order-2">
            <div className="prose prose-lg max-w-none font-serif text-slate-700 leading-relaxed prose-headings:font-serif prose-headings:text-forge-navy prose-headings:font-bold prose-a:text-forge-gold prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-forge-gold prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic prose-img:rounded-sm prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <hr className="my-12 border-slate-200" />
            <div className="flex justify-between items-center"><Link to="/blog" className="flex items-center gap-2 text-slate-500 hover:text-forge-navy transition-colors font-bold uppercase text-xs tracking-widest"><ArrowLeft size={16} /> Back to Journal</Link></div>
         </div>
      </div>
    </div>
  );
};

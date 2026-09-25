import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { ArrowLeft, Share2, Calendar, Clock, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PropertyEnquiryModal } from '../components/PropertyEnquiryModal';
import { ScrollFade } from '../components/AnimationUtils';

// Simple markdown renderer for headers, lists, paragraphs and bold text
const MarkdownBody: React.FC<{ content: string }> = ({ content }) => {
  // If content is already HTML, render dangerously
  if (content.includes('<p>') || content.includes('<div>') || content.includes('<h')) {
    return <div dangerouslySetInnerHTML={{ __html: content }} className="prose max-w-none text-[#0F172A] leading-relaxed" />;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="my-4 space-y-2 list-disc pl-5 text-slate-700">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-base leading-relaxed">
              {renderFormattedText(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderFormattedText = (text: string) => {
    // Basic bold **text** parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-[#774DFF]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#0F172A] font-display mt-8 mb-3">
          {trimmed.replace('### ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h2 key={index} className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-display mt-10 mb-4 border-b border-[#E5E7EB] pb-2">
          {trimmed.replace('## ', '')}
        </h2>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
    } else if (trimmed === '---') {
      flushList(index);
      elements.push(<hr key={index} className="my-8 border-[#E5E7EB]" />);
    } else if (trimmed.length > 0) {
      flushList(index);
      elements.push(
        <p key={index} className="my-4 text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
          {renderFormattedText(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div className="space-y-2">{elements}</div>;
};

export const BlogPostDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug, getPost, isLoading } = useProperties();
  const [copied, setCopied] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const post = slug ? (getPostBySlug(slug) || getPost(slug)) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-20">
        <div className="w-10 h-10 border-4 border-[#774DFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] px-4 pt-20">
        <div className="text-center p-8 bg-white shadow-xl rounded-[12px] max-w-md w-full border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-3 font-display">Article Not Found</h2>
          <p className="text-slate-600 mb-6 text-sm">We couldn't locate the guide you're looking for.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 bg-[#774DFF] hover:bg-[#683de6] text-white px-6 py-3 font-extrabold text-sm rounded-[8px] transition-all shadow-md"
          >
            <ArrowLeft size={16} />
            <span>Return to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 text-[#0F172A]">
      <SEO 
        title={`${post.title} | The Forge Properties Blog`}
        description={post.excerpt}
        image={post.cover_image}
        url={`/blog/${post.slug || post.id}`}
      />

      {/* Header Container */}
      <section className="bg-[#0F172A] text-white py-16 px-4 sm:px-6 relative overflow-hidden border-b border-[#774DFF]/30">
        <div className="container mx-auto max-w-4xl relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <Link to="/" className="hover:text-[#774DFF] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#774DFF]" />
            <Link to="/blog" className="hover:text-[#774DFF] transition-colors">
              Blog
            </Link>
            <ChevronRight size={14} className="text-[#774DFF]" />
            <span className="text-[#774DFF] truncate max-w-[200px] sm:max-w-none">{post.title}</span>
          </nav>

          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[1.5px] text-[#774DFF] mb-4">
            <span className="bg-[#1E293B] text-[#774DFF] px-3 py-1 rounded-[4px] border border-[#774DFF]/30">
              {post.category || 'Guide'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar size={13} /> {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Clock size={13} /> {post.read_time || '5 min read'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Hero Image */}
      {post.cover_image && (
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl -mt-6 sm:-mt-10 relative z-20">
          <div className="rounded-[16px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 max-h-[460px]">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        <ScrollFade>
          <div className="flex items-center justify-between py-4 mb-8 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Published by</span>
              <span className="text-[#774DFF] font-bold">The Forge Properties Advisory Team</span>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#774DFF] hover:text-[#683de6] transition-colors py-1.5 px-3 rounded-[6px] bg-[#F3F4F6] min-h-[36px]"
            >
              <Share2 size={14} />
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>

          <MarkdownBody content={post.content} />
        </ScrollFade>

        {/* Call to Action Box inside Article */}
        <ScrollFade delay={0.1}>
          <div className="mt-14 p-8 rounded-[16px] bg-[#F3F4F6] border border-[#E5E7EB] text-center">
            <div className="w-12 h-12 rounded-full bg-[#0F172A] text-[#774DFF] flex items-center justify-center mx-auto mb-3 border border-[#774DFF]/30">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A] font-display mb-2">
              Ready to Own Verified Titled Land?
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Take advantage of flexible 3 to 12-month installment spreads at Prasino Lush Phase 2 in Kobape, Ogun State starting from ₦900,000.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setIsEnquiryOpen(true)}
                className="bg-[#774DFF] hover:bg-[#683de6] text-white font-extrabold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] inline-flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Enquire About Prasino Lush</span>
                <ArrowRight size={16} />
              </button>
              <Link
                to="/properties"
                className="bg-transparent border border-[#774DFF] text-[#774DFF] hover:bg-[#774DFF] hover:text-white font-bold text-sm px-6 py-3.5 rounded-[8px] min-h-[44px] inline-flex items-center justify-center transition-all"
              >
                View All Properties
              </Link>
            </div>
          </div>
        </ScrollFade>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-[#E5E7EB]">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] text-[#774DFF] hover:text-[#683de6] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to All Articles</span>
          </Link>
        </div>
      </article>

      {/* ENQUIRY MODAL */}
      <PropertyEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </div>
  );
};

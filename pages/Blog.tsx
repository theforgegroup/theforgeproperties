import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Clock, 
  Mail, 
  ChevronRight,
  CheckCircle2 
} from 'lucide-react';
import { useProperties } from '../context/PropertyContext';

export const Blog: React.FC = () => {
  const { posts, addSubscriber, settings } = useProperties();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const publishedPosts = (posts || [])
    .filter(p => p.status === 'Published')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setLoading(true);
    try {
      await addSubscriber(newsletterEmail);
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      console.error(err);
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pt-20">
      {/* HERO SECTION */}
      <section className="bg-[#0057FF] text-white py-16 sm:py-20 px-4 sm:px-6 relative overflow-hidden border-b-2 border-[#C8FF00]/30">
        {settings?.blog_hero_image && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img 
              src={settings.blog_hero_image} 
              alt="The Forge Knowledge Base" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#0057FF]/85" />
          </div>
        )}

        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C8FF00]/15 blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-100 mb-6">
            <Link to="/" className="hover:text-[#C8FF00] transition-colors">
              Home
            </Link>
            <ChevronRight size={14} className="text-[#C8FF00]" />
            <span className="text-[#C8FF00]">Blog</span>
          </nav>

          <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
            The Forge Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Land Ownership Guides & Market Insights
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Transparent legal breakdowns, corridor trends, and smart strategies for young Nigerians and diaspora investors.
          </p>
        </div>
      </section>

      {/* BLOG POSTS GRID */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
            {publishedPosts.map((post) => {
              const postUrl = `/blog/${post.slug}`;

              return (
                <article 
                  key={post.id}
                  className="bg-white rounded-[12px] border border-[#E0E4FF] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-[#0057FF]"
                >
                  <div>
                    {/* Post Image */}
                    <Link to={postUrl} className="block relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#0057FF] text-[#C8FF00] font-bold text-xs px-3 py-1 rounded-[6px] shadow-sm uppercase tracking-wider">
                          {post.category || 'Guide'}
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-[#0057FF]" />
                          {post.read_time || '5 min read'}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      <Link to={postUrl} className="block group-hover:text-[#0057FF] transition-colors">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#0057FF] font-display leading-tight mb-3">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer: Read More */}
                  <div className="px-6 sm:px-8 pb-6 pt-0 border-t border-[#E0E4FF] mt-2">
                    <Link
                      to={postUrl}
                      className="pt-4 inline-flex items-center gap-2 text-sm font-bold text-[#0057FF] hover:text-[#0047d4] transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <span>Read More</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SIGNUP BANNER AT BOTTOM */}
      <section className="bg-[#0057FF] text-white py-16 px-4 sm:px-6 border-t-2 border-[#C8FF00]/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-12 h-12 rounded-[8px] bg-[#0047d4] border border-[#C8FF00]/30 text-[#C8FF00] flex items-center justify-center mx-auto mb-4">
            <Mail size={22} />
          </div>

          <span className="text-xs font-bold uppercase tracking-[2px] text-[#C8FF00] block mb-2">
            The Forge Newsletter
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3">
            Get Land Ownership Guides & Off-Market Alerts
          </h2>
          <p className="text-sm text-blue-100 max-w-lg mx-auto mb-8">
            Join young Nigerian builders at home and abroad receiving verified property intelligence every Tuesday.
          </p>

          {subscribed ? (
            <div className="p-4 bg-white/10 rounded-[8px] border border-[#C8FF00] text-white text-sm font-semibold max-w-md mx-auto flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-[#C8FF00] shrink-0" />
              <span>You are subscribed! Watch your inbox for our latest diaspora investment report.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-4 py-3 text-sm bg-white text-[#0A0A0A] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#C8FF00] min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#C8FF00] hover:bg-[#b5e600] text-[#0A0A0A] font-extrabold text-sm px-6 py-3 rounded-[8px] transition-all min-h-[44px] shrink-0 disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              <p className="text-[11px] text-blue-200">
                No spam. Just value. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

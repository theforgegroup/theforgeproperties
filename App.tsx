
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { Blog } from './pages/Blog';
import { BlogPostDetails } from './pages/BlogPostDetails';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { AdminPropertyForm } from './pages/AdminPropertyForm';
import { AdminCRM } from './pages/AdminCRM';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminSettings } from './pages/AdminSettings';
import { AdminBlog } from './pages/AdminBlog';
import { AdminPostForm } from './pages/AdminPostForm';
import { AIConcierge } from './components/AIConcierge';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider, useProperties } from './context/PropertyContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AdminEntry: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Admin /> : <AdminLogin />;
};

const AppLayout: React.FC = () => {
  const { settings } = useProperties();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (settings?.listingAgent?.image) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.listingAgent.image;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.listingAgent.image;
        document.head.appendChild(newLink);
      }
    }
  }, [settings?.listingAgent?.image]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-forge-gold selection:text-forge-navy">
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetails />} />
          <Route path="/contact" element={<Contact />} />
          
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/crm" element={<ProtectedRoute><AdminCRM /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/properties/new" element={<ProtectedRoute><AdminPropertyForm /></ProtectedRoute>} />
          <Route path="/admin/properties/edit/:id" element={<ProtectedRoute><AdminPropertyForm /></ProtectedRoute>} />
          
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <AIConcierge />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PropertyProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AuthProvider>
    </PropertyProvider>
  );
};

export default App;

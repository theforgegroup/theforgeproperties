
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
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
import { AdminAgents } from './pages/AdminAgents';
import { AdminPayouts } from './pages/AdminPayouts';
import { AgentPortal } from './pages/AgentPortal';
import { AgentDashboard } from './pages/AgentDashboard';
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

// Handle Referral Redirects
const ReferralRedirect = () => {
  const { code } = useParams();
  useEffect(() => {
    // Logic to log click in Supabase 'agent_clicks' table would go here
    console.log(`Referral clicked for code: ${code}`);
  }, [code]);
  return <Navigate to="/listings" replace />;
};

const AdminEntry: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  return (isAuthenticated && userRole === 'Admin') ? <Admin /> : <AdminLogin />;
};

const AppLayout: React.FC = () => {
  const { settings } = useProperties();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAgentDashboardRoute = location.pathname.startsWith('/agent/dashboard');

  useEffect(() => {
    const agentImage = settings?.listing_agent?.image;
    if (agentImage) {
      const links = document.querySelectorAll("link[rel*='icon']");
      links.forEach(link => {
        (link as HTMLLinkElement).href = agentImage;
      });
    }
  }, [settings?.listing_agent?.image]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-forge-gold selection:text-forge-navy">
      {!isAdminRoute && !isAgentDashboardRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:slug" element={<ListingDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetails />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Agent Portal Routes */}
          <Route path="/agent/portal" element={<AgentPortal />} />
          <Route path="/agent/dashboard" element={<ProtectedRoute role="Agent"><AgentDashboard /></ProtectedRoute>} />
          <Route path="/ref/:code" element={<ReferralRedirect />} />

          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/crm" element={<ProtectedRoute role="Admin"><AdminCRM /></ProtectedRoute>} />
          <Route path="/admin/agents" element={<ProtectedRoute role="Admin"><AdminAgents /></ProtectedRoute>} />
          <Route path="/admin/payouts" element={<ProtectedRoute role="Admin"><AdminPayouts /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="Admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="Admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute role="Admin"><AdminBlog /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute role="Admin"><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute role="Admin"><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/properties/new" element={<ProtectedRoute role="Admin"><AdminPropertyForm /></ProtectedRoute>} />
          <Route path="/admin/properties/edit/:id" element={<ProtectedRoute role="Admin"><AdminPropertyForm /></ProtectedRoute>} />
          
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAdminRoute && !isAgentDashboardRoute && <Footer />}
      {!isAdminRoute && !isAgentDashboardRoute && <AIConcierge />}
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

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { NewsletterModal } from './components/NewsletterModal';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Properties } from './pages/Properties';
import { TheForgeNation } from './pages/TheForgeNation';
import { JoinRealtors } from './pages/JoinRealtors';
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
import { AdminTraining } from './pages/AdminTraining';
import { AdminPayouts } from './pages/AdminPayouts';
import { AdminNeighborhoods } from './pages/AdminNeighborhoods';
import { AdminTestimonials } from './pages/AdminTestimonials';
import { AgentPortal } from './pages/AgentPortal';
import { AgentDashboard } from './pages/AgentDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider, useProperties } from './context/PropertyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

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
    console.log(`Referral clicked for code: ${code}`);
  }, [code]);
  return <Navigate to="/properties" replace />;
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
    <div className="flex flex-col min-h-screen font-sans bg-white text-[#1A1A1A] selection:bg-[#C9962A] selection:text-[#1A2847]">
      {!isAdminRoute && !isAgentDashboardRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/listings" element={<Properties />} />
          <Route path="/listings/:slug" element={<ListingDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/forge-nation" element={<TheForgeNation />} />
          <Route path="/join-realtors" element={<JoinRealtors />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetails />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Agent Portal Routes */}
          <Route path="/agent/portal" element={<AgentPortal />} />
          <Route path="/agent/dashboard" element={<ProtectedRoute role="Agent"><AgentDashboard /></ProtectedRoute>} />
          <Route path="/ref/:code" element={<ReferralRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/crm" element={<ProtectedRoute role="Admin"><AdminCRM /></ProtectedRoute>} />
          <Route path="/admin/agents" element={<ProtectedRoute role="Admin"><AdminAgents /></ProtectedRoute>} />
          <Route path="/admin/training" element={<ProtectedRoute role="Admin"><AdminTraining /></ProtectedRoute>} />
          <Route path="/admin/payouts" element={<ProtectedRoute role="Admin"><AdminPayouts /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="Admin"><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/neighborhoods" element={<ProtectedRoute role="Admin"><AdminNeighborhoods /></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute role="Admin"><AdminTestimonials /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="Admin"><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute role="Admin"><AdminBlog /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute role="Admin"><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute role="Admin"><AdminPostForm /></ProtectedRoute>} />
          <Route path="/admin/properties/new" element={<ProtectedRoute role="Admin"><AdminPropertyForm /></ProtectedRoute>} />
          <Route path="/admin/properties/edit/:id" element={<ProtectedRoute role="Admin"><AdminPropertyForm /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && !isAgentDashboardRoute && <Footer />}

      {/* Global Elements */}
      {!isAdminRoute && !isAgentDashboardRoute && (
        <>
          <FloatingWhatsApp />
          <NewsletterModal />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <PropertyProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <AppLayout />
          </Router>
        </AuthProvider>
      </PropertyProvider>
    </ErrorBoundary>
  );
};

export default App;

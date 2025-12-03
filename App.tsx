import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { AdminPropertyForm } from './pages/AdminPropertyForm';
import { AdminCRM } from './pages/AdminCRM';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { AdminSettings } from './pages/AdminSettings';
import { AIConcierge } from './components/AIConcierge';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Robust Helper to handle ANY hosting environment (Preview, Vercel, Localhost)
const getBasename = () => {
  const { pathname, hostname } = window.location;
  
  // 1. Production (Vercel) or Localhost -> Root
  if (hostname.includes('vercel.app') || hostname.includes('localhost')) {
    return '/';
  }

  // 2. Preview Environment Check
  // If usage involves subpaths (like AI Studio previews), handle it here.
  // For Vercel, we return '/'
  return '/';
};

// Layout wrapper to conditionally render public UI
const AppLayout: React.FC = () => {
  const location = useLocation();
  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 selection:bg-forge-gold selection:text-forge-navy">
      {/* Only show Public Navbar on non-admin pages */}
      {!isAdminRoute && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/crm" 
            element={
              <ProtectedRoute>
                <AdminCRM />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/properties/new" 
            element={
              <ProtectedRoute>
                <AdminPropertyForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/properties/edit/:id" 
            element={
              <ProtectedRoute>
                <AdminPropertyForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback to Home for unmatched routes */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {/* Only show Public Footer and AI Chat on non-admin pages */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <AIConcierge />}
    </div>
  );
};

const App: React.FC = () => {
  const basename = getBasename();

  return (
    <PropertyProvider>
      <AuthProvider>
        <Router basename={basename}>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AuthProvider>
    </PropertyProvider>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { Blog } from './pages/Blog'; // New Blog Page
import { BlogPost } from './pages/BlogPost'; // New Single Post Page
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
import { AdminPropertyForm } from './pages/AdminPropertyForm';
import { AdminPosts } from './pages/AdminPosts'; // Admin List
import { AdminPostForm } from './pages/AdminPostForm'; // Admin Editor
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
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
          
          {/* Admin Blog Routes */}
          <Route 
            path="/admin/posts" 
            element={
              <ProtectedRoute>
                <AdminPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/posts/new" 
            element={
              <ProtectedRoute>
                <AdminPostForm />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/posts/edit/:id" 
            element={
              <ProtectedRoute>
                <AdminPostForm />
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
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { WishlistProvider } from "@/hooks/use-wishlist";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { useEffect } from "react";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import PremiumBicycles from "@/pages/premium-bicycles";
import KidsBicycles from "@/pages/kids-bicycles";
import SellPage from "@/pages/sell-page";
import BicycleDetailPage from "@/pages/bicycle-detail-page";
import ProfilePage from "@/pages/profile-page";
import BlogPage from "@/pages/blog-page";
import { ProtectedRoute } from "./lib/protected-route";
import { initGA, usePageTracking } from "./lib/analytics";
import AdultBicycles from "./pages/adult-bicycles";
import { UserVerificationForm } from "./pages/user-verification";

function Router() {
  // Track page views
  usePageTracking();
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/premium" component={PremiumBicycles} />
      <Route path="/Kids" component={KidsBicycles} />
      <Route path="/Adult" component={AdultBicycles} />
      <Route path="/blog" component={BlogPage} />
      <ProtectedRoute path="/sell" component={SellPage}/>
      <ProtectedRoute path="/verify-aadhaar" component={UserVerificationForm} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/bicycles/:id" component={BicycleDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    if (import.meta.env.VITE_GA_TRACKING_ID) {
      initGA();
    }
    // Report Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then((webVitals) => {
        webVitals.onCLS(console.log);
        webVitals.onFID(console.log);
        webVitals.onLCP(console.log);
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <Router />
          <Toaster />
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

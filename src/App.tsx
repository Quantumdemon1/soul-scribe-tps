import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { LazyIndex, LazyAuth, LazyAdmin, LazyAssessmentHistory, LazyAssessments, LazyProfile, LazyMentor, LazyNotFound, PageWrapper } from './components/layout/LazyPages';
import { ProductionWrapper } from './components/layout/ProductionWrapper';
import { lazy } from 'react';
import React from 'react';
import '@/utils/debugCleanup'; // Initialize debug cleanup
import { ProductionReadinessChecker } from '@/utils/productionReadinessChecker';
import '@/utils/bundleOptimizer'; // Initialize bundle optimization
import { useScoringOverrides } from './hooks/useScoringOverrides';

const LazyIntegralAssessment = lazy(() => import('./pages/IntegralAssessment'));

const queryClient = new QueryClient();

const AppContent = () => {
  usePerformanceOptimization(); // Initialize performance monitoring

  // Load global scoring overrides (cached in localStorage for sync access)
  useScoringOverrides();
  
  // Initialize production optimizations
  React.useEffect(() => {
    ProductionReadinessChecker.optimizeForProduction();
  }, []);
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
            <Route path="/" element={<PageWrapper><LazyIndex /></PageWrapper>} />
            <Route 
              path="/auth" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <PageWrapper><LazyAuth /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <PageWrapper><LazyProfile /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <PageWrapper><LazyAdmin /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <PageWrapper><LazyAssessmentHistory /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mentor" 
              element={
                <ProtectedRoute>
                  <PageWrapper><LazyMentor /></PageWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/integral" 
              element={
                <PageWrapper><LazyIntegralAssessment /></PageWrapper>
              } 
            />
            <Route 
              path="/assessments" 
              element={
                <PageWrapper><LazyAssessments /></PageWrapper>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<PageWrapper><LazyNotFound /></PageWrapper>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <ProductionWrapper>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </ProductionWrapper>
);

export default App;

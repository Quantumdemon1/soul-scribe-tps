import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';
import { MobileLayoutWrapper } from './MobileLayoutWrapper';

// Lazy load pages for better performance
export const LazyIndex = lazy(() => import('../../pages/Index'));
export const LazyAuth = lazy(() => import('../../pages/Auth'));
export const LazyAdmin = lazy(() => import('../../pages/Admin'));
export const LazyAssessmentHistory = lazy(() => import('../../pages/AssessmentHistory'));
export const LazyAssessments = lazy(() => import('../../pages/Assessments'));
export const LazyProfile = lazy(() => import('../../pages/Profile'));
export const LazyMentor = lazy(() => import('../../pages/Mentor'));
export const LazyNotFound = lazy(() => import('../../pages/NotFound'));

// Page wrapper with loading fallback, error boundaries, and mobile optimization
export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background">
    <ModernHeader />
    <ErrorBoundaryWrapper>
      <MobileLayoutWrapper>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          {children}
        </Suspense>
      </MobileLayoutWrapper>
    </ErrorBoundaryWrapper>
  </div>
);
import React from 'react';
import { TestSessionDashboard } from '@/components/user/TestSessionDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import SEO from '@/components/seo/SEO';

const TestSessions: React.FC = () => {
  return (
    <ProtectedRoute>
      <SEO 
        title="My Test Sessions" 
        description="Manage your active personality tests and view completed assessments" 
        canonicalPath="/sessions" 
      />
      <TestSessionDashboard />
    </ProtectedRoute>
  );
};

export default TestSessions;
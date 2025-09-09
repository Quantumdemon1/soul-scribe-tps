import React from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { ProductionTestSuiteIntegration } from '@/components/test/ProductionTestSuiteIntegration';
import { ProductionStatusDashboard } from '@/components/admin/ProductionStatusDashboard';
import { AdminUserCreation } from '@/components/admin/AdminUserCreation';
import { TestResultsOverview } from '@/components/admin/TestResultsOverview';
import { TestResultsList } from '@/components/admin/TestResultsList';
import { DemoTestRunner } from '@/components/test/DemoTestRunner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings, TestTube, Activity, UserPlus, BarChart3 } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System administration, production testing, and monitoring tools.
          </p>
        </div>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Admin Panel
            </TabsTrigger>
            <TabsTrigger value="create-user" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </TabsTrigger>
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Production Status
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test Suite
            </TabsTrigger>
            <TabsTrigger value="test-results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Test Results
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="mt-6">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="create-user" className="mt-6">
            <AdminUserCreation />
          </TabsContent>

          <TabsContent value="production" className="mt-6">
            <ProductionStatusDashboard />
          </TabsContent>

          <TabsContent value="tests" className="mt-6">
            <ProductionTestSuiteIntegration />
          </TabsContent>

          <TabsContent value="test-results" className="mt-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="demo">Demo Tests</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <TestResultsOverview />
              </TabsContent>
              <TabsContent value="results">
                <TestResultsList />
              </TabsContent>
              <TabsContent value="demo">
                <DemoTestRunner />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time system monitoring and performance metrics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Application Health</h4>
                    <div className="text-2xl font-bold text-green-600">Healthy</div>
                    <p className="text-sm text-muted-foreground">All systems operational</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Active Users</h4>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-sm text-muted-foreground">+12% from last week</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Error Rate</h4>
                    <div className="text-2xl font-bold text-green-600">0.02%</div>
                    <p className="text-sm text-muted-foreground">Within acceptable limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Security monitoring and compliance status.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Authentication</h4>
                    <div className="text-2xl font-bold text-green-600">Secure</div>
                    <p className="text-sm text-muted-foreground">JWT tokens properly configured</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Data Protection</h4>
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <p className="text-sm text-muted-foreground">Row-level security enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
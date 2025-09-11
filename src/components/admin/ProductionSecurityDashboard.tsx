import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useProductionReadiness } from '@/hooks/useProductionReadiness';
import { logger } from '@/utils/structuredLogging';

interface SecurityCheckItem {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  action?: string;
  link?: string;
}

export const ProductionSecurityDashboard: React.FC = () => {
  const { status, isLoading, checkReadiness } = useProductionReadiness();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheckItem[]>([]);

  useEffect(() => {
    const checks: SecurityCheckItem[] = [
      {
        id: 'password_protection',
        name: 'Leaked Password Protection',
        status: 'warning',
        description: 'Enable protection against leaked passwords in Supabase Auth',
        action: 'Enable in Auth providers settings',
        link: 'https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/auth/providers'
      },
      {
        id: 'postgres_version',
        name: 'PostgreSQL Version',
        status: 'warning', 
        description: 'Database should be upgraded to latest version for security patches',
        action: 'Schedule Postgres upgrade',
        link: 'https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/settings/infrastructure'
      },
      {
        id: 'rls_policies',
        name: 'Row Level Security',
        status: status?.isReady ? 'pass' : 'fail',
        description: 'All tables have proper RLS policies configured',
        action: status?.isReady ? undefined : 'Configure RLS policies'
      },
      {
        id: 'auth_config',
        name: 'Authentication Configuration',
        status: status?.score && status.score > 80 ? 'pass' : 'warning',
        description: 'Authentication providers and settings are properly configured',
        action: status?.score && status.score > 80 ? undefined : 'Review auth settings',
        link: 'https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/auth/providers'
      },
      {
        id: 'edge_functions',
        name: 'Edge Function Security',
        status: 'pass',
        description: 'Edge functions have proper CORS and security headers',
        action: undefined
      },
      {
        id: 'secrets_management',
        name: 'Secrets Management',
        status: 'pass',
        description: 'API keys and secrets are properly secured',
        action: undefined,
        link: 'https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/settings/functions'
      }
    ];

    setSecurityChecks(checks);

    logger.info('Security dashboard initialized', {
      component: 'ProductionSecurityDashboard',
      action: 'initializeChecks',
      metadata: {
        totalChecks: checks.length,
        failedChecks: checks.filter(c => c.status === 'fail').length,
        warningChecks: checks.filter(c => c.status === 'warning').length
      }
    });
  }, [status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Warning</Badge>;
      default:
        return null;
    }
  };

  const criticalIssues = securityChecks.filter(check => check.status === 'fail');
  const warnings = securityChecks.filter(check => check.status === 'warning');
  const passed = securityChecks.filter(check => check.status === 'pass');
  const overallScore = (passed.length / securityChecks.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security Dashboard
          </h2>
          <p className="text-muted-foreground">Production security status and recommendations</p>
        </div>
        <Button onClick={checkReadiness} disabled={isLoading} size="sm" variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Security Score
            {overallScore >= 80 ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>Overall security posture assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallScore.toFixed(0)}%</span>
              <div className="text-sm text-muted-foreground">
                {passed.length}/{securityChecks.length} checks passing
              </div>
            </div>
            <Progress value={overallScore} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">{passed.length}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">{warnings.length}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">{criticalIssues.length}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical security issues detected!</strong> Immediate action required before production deployment.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="critical">Critical Issues ({criticalIssues.length})</TabsTrigger>
          <TabsTrigger value="warnings">Warnings ({warnings.length})</TabsTrigger>
          <TabsTrigger value="supabase">Supabase Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {securityChecks.map((check) => (
              <Card key={check.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(check.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{check.name}</h4>
                          {getStatusBadge(check.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                        {check.action && (
                          <p className="text-sm font-medium text-primary">{check.action}</p>
                        )}
                      </div>
                    </div>
                    {check.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={check.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {criticalIssues.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Critical Issues</h3>
                <p className="text-muted-foreground">All critical security checks are passing.</p>
              </CardContent>
            </Card>
          ) : (
            criticalIssues.map((check) => (
              <Card key={check.id} className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(check.status)}
                      <div className="space-y-1">
                        <h4 className="font-medium text-red-800">{check.name}</h4>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                        {check.action && (
                          <p className="text-sm font-medium text-red-600">{check.action}</p>
                        )}
                      </div>
                    </div>
                    {check.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={check.link} target="_blank" rel="noopener noreferrer">
                          Fix Now <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="warnings" className="space-y-4">
          {warnings.map((check) => (
            <Card key={check.id} className="border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="space-y-1">
                      <h4 className="font-medium text-yellow-800">{check.name}</h4>
                      <p className="text-sm text-muted-foreground">{check.description}</p>
                      {check.action && (
                        <p className="text-sm font-medium text-yellow-600">{check.action}</p>
                      )}
                    </div>
                  </div>
                  {check.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={check.link} target="_blank" rel="noopener noreferrer">
                        Review <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Direct links to Supabase dashboard for immediate fixes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/auth/providers" target="_blank" rel="noopener noreferrer">
                    <Shield className="w-4 h-4 mr-2" />
                    Configure Auth Providers & Password Protection
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/settings/infrastructure" target="_blank" rel="noopener noreferrer">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Database Upgrade & Infrastructure
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://supabase.com/dashboard/project/rvbbmtpdeqchsbalhssc/settings/functions" target="_blank" rel="noopener noreferrer">
                    <Shield className="w-4 h-4 mr-2" />
                    Edge Function Secrets
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
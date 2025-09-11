import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Users, Settings, Upload, Download, RotateCcw } from 'lucide-react';
import { UserManagementTable } from './UserManagementTable';
import { BatchUpdateManager } from './BatchUpdateManager';
import { useDebounce } from './DebounceManager';
import { logger } from '@/utils/structuredLogging';
import { 
  updateUserOverride, 
  type UserWithOverrides 
} from '@/services/userManagementService';
import { BatchOperation as BatchUpdateOperation } from './BatchUpdateManager';

export const IntegratedUserOverrideManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('table');
  const [batchOperations, setBatchOperations] = useState<BatchUpdateOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounced batch update function
  const debouncedBatchUpdate = useDebounce(async (operations: BatchUpdateOperation[]) => {
    setIsProcessing(true);
    logger.info('Starting batch override update', {
      component: 'IntegratedUserOverrideManager',
      action: 'debouncedBatchUpdate',
      metadata: { operationCount: operations.length }
    });

    for (const operation of operations) {
      try {
        setBatchOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'processing' }
            : op
        ));

        await updateUserOverride(operation.userId, operation.framework, operation.value);
        
        setBatchOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'success' }
            : op
        ));

        logger.info('Batch operation completed', {
          component: 'IntegratedUserOverrideManager',
          action: 'batchOperationSuccess',
          metadata: { 
            operationId: operation.id,
            framework: operation.framework,
            userId: operation.userId
          }
        });

      } catch (error) {
        setBatchOperations(prev => prev.map(op => 
          op.id === operation.id 
            ? { 
                ...op, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            : op
        ));

        logger.error('Batch operation failed', {
          component: 'IntegratedUserOverrideManager',
          action: 'batchOperationError',
          metadata: { 
            operationId: operation.id,
            framework: operation.framework,
            userId: operation.userId
          }
        }, error as Error);
      }
    }

    setIsProcessing(false);
    
    const completedCount = batchOperations.filter(op => op.status === 'success').length;
    const failedCount = batchOperations.filter(op => op.status === 'error').length;

    toast({
      title: 'Batch Update Complete',
      description: `${completedCount} successful, ${failedCount} failed`,
      variant: failedCount > 0 ? 'destructive' : 'default'
    });
  }, 1000);

  const addBatchOperation = (userId: string, framework: string, value: any, rollbackData?: any) => {
    const operation: BatchUpdateOperation = {
      id: `${userId}_${framework}_${Date.now()}`,
      userId,
      framework,
      value,
      status: 'pending',
      rollbackData
    };

    setBatchOperations(prev => [...prev, operation]);
    
    logger.info('Batch operation added', {
      component: 'IntegratedUserOverrideManager',
      action: 'addBatchOperation',
      metadata: { 
        operationId: operation.id,
        framework,
        userId
      }
    });
  };

  const processBatchOperations = async () => {
    const pendingOperations = batchOperations.filter(op => op.status === 'pending');
    if (pendingOperations.length === 0) {
      toast({
        title: 'No Operations',
        description: 'No pending operations to process',
        variant: 'default'
      });
      return;
    }

    await debouncedBatchUpdate(pendingOperations);
  };

  const rollbackOperation = async (operation: BatchUpdateOperation) => {
    if (!operation.rollbackData) {
      toast({
        title: 'Rollback Failed',
        description: 'No rollback data available for this operation',
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateUserOverride(
        operation.userId, 
        operation.framework, 
        operation.rollbackData
      );

      setBatchOperations(prev => prev.filter(op => op.id !== operation.id));
      
      toast({
        title: 'Rollback Successful',
        description: 'Operation has been rolled back',
        variant: 'default'
      });

      logger.info('Operation rolled back successfully', {
        component: 'IntegratedUserOverrideManager',
        action: 'rollbackOperation',
        metadata: { 
          operationId: operation.id,
          framework: operation.framework,
          userId: operation.userId
        }
      });

    } catch (error) {
      logger.error('Rollback operation failed', {
        component: 'IntegratedUserOverrideManager',
        action: 'rollbackOperation',
        metadata: { 
          operationId: operation.id,
          framework: operation.framework,
          userId: operation.userId
        }
      }, error as Error);

      toast({
        title: 'Rollback Failed',
        description: error instanceof Error ? error.message : 'Failed to rollback operation',
        variant: 'destructive'
      });
    }
  };

  const clearBatchOperations = () => {
    setBatchOperations([]);
    logger.info('Batch operations cleared', {
      component: 'IntegratedUserOverrideManager',
      action: 'clearBatchOperations'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            User Override Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Batch Operations: {batchOperations.length}
              </Badge>
              {isProcessing && (
                <Badge variant="default" className="flex items-center gap-1">
                  Processing...
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {batchOperations.length > 0 && (
                <>
                  <Button 
                    onClick={processBatchOperations}
                    disabled={isProcessing}
                    variant="default"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Process Batch ({batchOperations.filter(op => op.status === 'pending').length})
                  </Button>
                  <Button 
                    onClick={clearBatchOperations}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">User Management</TabsTrigger>
          <TabsTrigger value="batch">
            Batch Operations
            {batchOperations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {batchOperations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <UserManagementTable />
        </TabsContent>

        <TabsContent value="batch" className="mt-6">
          {batchOperations.length > 0 ? (
            <BatchUpdateManager
              operations={batchOperations}
              onOperationUpdate={(operation) => {
                setBatchOperations(prev => prev.map(op => 
                  op.id === operation.id ? operation : op
                ));
              }}
              onBatchComplete={(results) => {
                logger.info('Batch processing completed', {
                  component: 'IntegratedUserOverrideManager',
                  action: 'onBatchComplete',
                  metadata: results
                });
              }}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Batch Operations</h3>
                <p className="text-muted-foreground">
                  Make changes in the User Management tab to queue batch operations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedUserOverrideManager;
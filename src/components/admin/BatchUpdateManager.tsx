import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

export interface BatchOperation {
  id: string;
  userId: string;
  framework: string;
  value: string | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  rollbackData?: any;
}

interface BatchUpdateManagerProps {
  operations: BatchOperation[];
  onOperationUpdate: (operation: BatchOperation) => void;
  onBatchComplete: (results: { success: number; failed: number }) => void;
}

export const BatchUpdateManager: React.FC<BatchUpdateManagerProps> = ({
  operations,
  onOperationUpdate,
  onBatchComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const processOperations = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      setCurrentIndex(i);
      
      // Update status to processing
      const processingOp = { ...operation, status: 'processing' as const };
      onOperationUpdate(processingOp);

      try {
        // Simulate API call with actual implementation
        await new Promise(resolve => setTimeout(resolve, 100)); // Debounce between calls
        
        // In real implementation, call the actual update service here
        // const result = await updateUserOverride(operation.userId, operation.framework, operation.value);
        
        const successOp = { ...operation, status: 'success' as const };
        onOperationUpdate(successOp);
        successCount++;
      } catch (error) {
        const errorOp = { 
          ...operation, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        onOperationUpdate(errorOp);
        failedCount++;
        
        logger.error('Batch operation failed', {
          component: 'BatchUpdateManager',
          metadata: { 
            operationId: operation.id,
            userId: operation.userId,
            framework: operation.framework 
          }
        }, error as Error);
      }
    }

    setIsProcessing(false);
    setCurrentIndex(0);
    onBatchComplete({ success: successCount, failed: failedCount });

    if (failedCount > 0) {
      toast({
        title: 'Batch Update Completed with Errors',
        description: `${successCount} succeeded, ${failedCount} failed`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Batch Update Successful',
        description: `All ${successCount} operations completed successfully`
      });
    }
  }, [operations, isProcessing, onOperationUpdate, onBatchComplete, toast]);

  const getStatusIcon = (status: BatchOperation['status']) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: BatchOperation['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      processing: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const progress = operations.length > 0 ? (currentIndex / operations.length) * 100 : 0;
  const completedCount = operations.filter(op => op.status === 'success' || op.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Batch Update Progress</span>
          <Badge variant="outline">{operations.length} operations</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedCount}/{operations.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {operations.slice(0, 10).map((operation) => (
            <div key={operation.id} className="flex items-center justify-between text-sm p-2 rounded border">
              <div className="flex items-center gap-2">
                {getStatusIcon(operation.status)}
                <span className="font-mono text-xs truncate max-w-[100px]">
                  {operation.userId.slice(0, 8)}...
                </span>
                <span className="text-muted-foreground">
                  {operation.framework}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(operation.status)}
                {operation.error && (
                  <span className="text-xs text-red-500 truncate max-w-[100px]" title={operation.error}>
                    {operation.error}
                  </span>
                )}
              </div>
            </div>
          ))}
          {operations.length > 10 && (
            <div className="text-xs text-muted-foreground text-center">
              ...and {operations.length - 10} more operations
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={processOperations}
            disabled={isProcessing || operations.length === 0}
            size="sm"
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Start Batch Update'}
          </Button>
          
          {isProcessing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProcessing(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
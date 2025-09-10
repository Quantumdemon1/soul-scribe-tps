import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Users, RefreshCw, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  fetchUsersWithOverrides, 
  updateUserOverride, 
  FRAMEWORK_OPTIONS,
  type UserWithOverrides,
  type UserManagementFilters 
} from '@/services/userManagementService';
import { BigFiveEditor } from './BigFiveEditor';
import { BulkOperationsPanel } from './BulkOperationsPanel';
import { EnhancedInlineSelect } from './EnhancedInlineSelect';
import { AdvancedFilters } from './AdvancedFilters';
import { AuditTrailExpansion } from './AuditTrailExpansion';
import { ExportImportPanel } from './ExportImportPanel';
import { ConfirmationDialog } from './ConfirmationDialog';
import { MobileUserCard } from './MobileUserCard';
import { useIsMobile } from '@/hooks/use-mobile';

const BigFiveCell: React.FC<{ value: any; onSave: (value: any) => Promise<void> }> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const hasOverride = value !== null;

  const handleSave = async (newValue: any) => {
    await onSave(newValue);
    setIsEditing(false);
  };

  const getDisplayValue = () => {
    if (!value) return null;
    const traits = ['O', 'C', 'E', 'A', 'N'];
    const scores = [
      value.openness || 50,
      value.conscientiousness || 50, 
      value.extraversion || 50,
      value.agreeableness || 50,
      value.neuroticism || 50
    ];
    return traits.map((trait, i) => `${trait}:${scores[i]}`).join(' ');
  };

  return (
    <Popover open={isEditing} onOpenChange={setIsEditing}>
      <PopoverTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors min-h-6 w-full ${
                  hasOverride ? 'bg-primary/10 border border-primary/20' : ''
                }`}
              >
                {value ? (
                  <Badge variant={hasOverride ? "default" : "secondary"} className="text-xs">
                    Big Five
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-48">
                {hasOverride 
                  ? `Big Five scores: ${getDisplayValue()}` 
                  : 'Click to set Big Five scores'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <BigFiveEditor
          value={value}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </PopoverContent>
    </Popover>
  );
};

interface UserManagementTableState {
  users: UserWithOverrides[];
  selectedUsers: Set<string>;
  loading: boolean;
  filters: UserManagementFilters;
  totalCount: number;
  expandedRows: Set<string>;
  confirmDialog: {
    open: boolean;
    title: string;
    description: string;
    action: string;
    variant: 'default' | 'destructive';
    onConfirm: () => void;
  } | null;
}

interface UserRowProps {
  user: UserWithOverrides;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (checked: boolean) => void;
  onToggleExpand: () => void;
  onOverrideUpdate: (framework: string, value: any) => Promise<void>;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onOverrideUpdate
}) => {
  const [cellLoading, setCellLoading] = useState<Set<string>>(new Set());

  const handleCellUpdate = async (framework: string, value: any) => {
    setCellLoading(prev => new Set([...prev, framework]));
    try {
      await onOverrideUpdate(framework, value);
    } finally {
      setCellLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(framework);
        return newSet;
      });
    }
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
            />
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onToggleExpand}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {user.display_name || user.username || 'No Name'}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {user.id.slice(0, 8)}...
            </div>
            {user.verification_level && (
              <Badge variant="outline" className="text-xs">
                {user.verification_level}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="space-y-1">
            <div className="text-sm font-medium">{user.assessment_count}</div>
            {user.last_assessment_date && (
              <div className="text-xs text-muted-foreground">
                {new Date(user.last_assessment_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.mbti_type}
            options={FRAMEWORK_OPTIONS.mbti_type}
            onSave={(value) => handleCellUpdate('mbti_type', value)}
            placeholder="MBTI"
            disabled={cellLoading.has('mbti_type')}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.enneagram_type}
            options={FRAMEWORK_OPTIONS.enneagram_type}
            onSave={(value) => handleCellUpdate('enneagram_type', value)}
            placeholder="Type"
            disabled={cellLoading.has('enneagram_type')}
          />
        </TableCell>
        <TableCell className="text-center">
          <BigFiveCell
            value={user.big_five_scores}
            onSave={(value) => handleCellUpdate('big_five_scores', value)}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.holland_code}
            options={FRAMEWORK_OPTIONS.holland_code}
            onSave={(value) => handleCellUpdate('holland_code', value)}
            placeholder="Code"
            disabled={cellLoading.has('holland_code')}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.alignment}
            options={FRAMEWORK_OPTIONS.alignment}
            onSave={(value) => handleCellUpdate('alignment', value)}
            placeholder="Alignment"
            disabled={cellLoading.has('alignment')}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.socionics_type}
            options={FRAMEWORK_OPTIONS.socionics_type}
            onSave={(value) => handleCellUpdate('socionics_type', value)}
            placeholder="Type"
            disabled={cellLoading.has('socionics_type')}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.integral_level}
            options={FRAMEWORK_OPTIONS.integral_level}
            onSave={(value) => handleCellUpdate('integral_level', value)}
            placeholder="Level"
            disabled={cellLoading.has('integral_level')}
          />
        </TableCell>
        <TableCell className="text-center">
          <EnhancedInlineSelect
            value={user.attachment_style}
            options={FRAMEWORK_OPTIONS.attachment_style}
            onSave={(value) => handleCellUpdate('attachment_style', value)}
            placeholder="Style"
            disabled={cellLoading.has('attachment_style')}
          />
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={11} className="bg-muted/20 p-4">
            <AuditTrailExpansion 
              userId={user.id} 
              onRollback={() => window.location.reload()} 
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export const UserManagementTable: React.FC = () => {
  const isMobile = useIsMobile();
  const [state, setState] = useState<UserManagementTableState>({
    users: [],
    selectedUsers: new Set(),
    loading: true,
    filters: { page: 0, pageSize: 50 },
    totalCount: 0,
    expandedRows: new Set(),
    confirmDialog: null
  });

  const loadUsers = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetchUsersWithOverrides(state.filters);
      setState(prev => ({
        ...prev,
        users: response.users,
        totalCount: response.totalCount,
        loading: false
      }));
    } catch (error) {
      toast({ 
        title: 'Load Failed', 
        description: 'Could not load user data.', 
        variant: 'destructive' 
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadUsers();
  }, [state.filters]);

  const handleUserSelection = (userId: string, checked: boolean) => {
    setState(prev => {
      const newSelection = new Set(prev.selectedUsers);
      if (checked) {
        newSelection.add(userId);
      } else {
        newSelection.delete(userId);
      }
      return { ...prev, selectedUsers: newSelection };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setState(prev => ({
      ...prev,
      selectedUsers: checked ? new Set(prev.users.map(u => u.id)) : new Set()
    }));
  };

  const handleToggleExpand = (userId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedRows);
      if (newExpanded.has(userId)) {
        newExpanded.delete(userId);
      } else {
        newExpanded.add(userId);
      }
      return { ...prev, expandedRows: newExpanded };
    });
  };

  const handleOverrideUpdate = async (userId: string, framework: string, value: any) => {
    // Show confirmation for sensitive changes
    if (framework === 'mbti_type' || framework === 'enneagram_type') {
      setState(prev => ({
        ...prev,
        confirmDialog: {
          open: true,
          title: 'Confirm Override Change',
          description: `Are you sure you want to update ${framework.replace('_', ' ')} for this user? This will override their assessment results.`,
          action: 'Update Override',
          variant: 'default',
          onConfirm: async () => {
            await performOverrideUpdate(userId, framework, value);
            setState(prev => ({ ...prev, confirmDialog: null }));
          }
        }
      }));
      return;
    }
    
    await performOverrideUpdate(userId, framework, value);
  };

  const performOverrideUpdate = async (userId: string, framework: string, value: any) => {
    await updateUserOverride(userId, framework, value);
    
    setState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId 
          ? { ...user, [framework]: value }
          : user
      )
    }));

    toast({
      title: 'Override Updated',
      description: `${framework.replace('_', ' ')} updated successfully.`
    });
  };

  const handleFiltersChange = (newFilters: UserManagementFilters) => {
    setState(prev => ({ ...prev, filters: newFilters }));
  };

  const handleClearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: { page: 0, pageSize: 50 },
      selectedUsers: new Set()
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Management ({state.totalCount} users)
        </h2>
        <div className="flex gap-2">
          <Button onClick={loadUsers} disabled={state.loading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={state.filters}
        onFiltersChange={handleFiltersChange}
        totalCount={state.totalCount}
        onClearFilters={handleClearFilters}
      />

      {/* Export/Import Panel */}
      <ExportImportPanel
        users={state.users}
        onImportComplete={loadUsers}
      />

      {/* Bulk Operations */}
      {state.selectedUsers.size > 0 && (
        <BulkOperationsPanel
          selectedUserIds={Array.from(state.selectedUsers)}
          onComplete={() => {
            setState(prev => ({ ...prev, selectedUsers: new Set() }));
            loadUsers();
          }}
        />
      )}

      {/* Mobile vs Desktop Layout */}
      {isMobile ? (
        /* Mobile Card Layout */
        <div className="space-y-3 px-1">
          {state.loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading users...
              </CardContent>
            </Card>
          ) : state.users.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No users found
              </CardContent>
            </Card>
          ) : (
            state.users.map((user) => (
              <MobileUserCard
                key={user.id}
                user={user}
                isSelected={state.selectedUsers.has(user.id)}
                isExpanded={state.expandedRows.has(user.id)}
                onSelect={(checked) => handleUserSelection(user.id, checked)}
                onToggleExpand={() => handleToggleExpand(user.id)}
                onOverrideUpdate={(framework, value) => handleOverrideUpdate(user.id, framework, value)}
              />
            ))
          )}
        </div>
      ) : (

        /* Desktop Table Layout */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">
                      <Checkbox
                        checked={state.users.length > 0 && state.selectedUsers.size === state.users.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-center">Assessments</TableHead>
                    <TableHead className="text-center">MBTI</TableHead>
                    <TableHead className="text-center">Enneagram</TableHead>
                    <TableHead className="text-center">Big Five</TableHead>
                    <TableHead className="text-center">Holland</TableHead>
                    <TableHead className="text-center">Alignment</TableHead>
                    <TableHead className="text-center">Socionics</TableHead>
                    <TableHead className="text-center">Integral</TableHead>
                    <TableHead className="text-center">Attachment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : state.users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    state.users.map((user) => (
                      <Collapsible key={user.id} open={state.expandedRows.has(user.id)}>
                        <UserRow
                          user={user}
                          isSelected={state.selectedUsers.has(user.id)}
                          isExpanded={state.expandedRows.has(user.id)}
                          onSelect={(checked) => handleUserSelection(user.id, checked)}
                          onToggleExpand={() => handleToggleExpand(user.id)}
                          onOverrideUpdate={(framework, value) => handleOverrideUpdate(user.id, framework, value)}
                        />
                      </Collapsible>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {state.users.length} of {state.totalCount} users
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={state.filters.page === 0}
            onClick={() => setState(prev => ({
              ...prev,
              filters: { ...prev.filters, page: prev.filters.page! - 1 }
            }))}
            aria-label="Go to previous page"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(state.filters.page! + 1) * state.filters.pageSize! >= state.totalCount}
            onClick={() => setState(prev => ({
              ...prev,
              filters: { ...prev.filters, page: prev.filters.page! + 1 }
            }))}
            aria-label="Go to next page"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {state.confirmDialog && (
        <ConfirmationDialog
          open={state.confirmDialog.open}
          onOpenChange={(open) => setState(prev => ({ 
            ...prev, 
            confirmDialog: open ? prev.confirmDialog : null 
          }))}
          title={state.confirmDialog.title}
          description={state.confirmDialog.description}
          action={state.confirmDialog.action}
          variant={state.confirmDialog.variant}
          userCount={state.selectedUsers.size || undefined}
          onConfirm={state.confirmDialog.onConfirm}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
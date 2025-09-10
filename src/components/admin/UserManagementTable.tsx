import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Search, Users, Filter, RefreshCw, Edit3, Mail } from 'lucide-react';
import { 
  fetchUsersWithOverrides, 
  updateUserOverride, 
  FRAMEWORK_OPTIONS,
  type UserWithOverrides,
  type UserManagementFilters 
} from '@/services/userManagementService';
import { BigFiveEditor } from './BigFiveEditor';
import { BulkOperationsPanel } from './BulkOperationsPanel';

interface InlineSelectProps {
  value: string | null;
  options: readonly string[];
  onSave: (value: string | null) => Promise<void>;
  placeholder: string;
}

interface BigFiveCellProps {
  value: any;
  onSave: (value: any) => Promise<void>;
}

const InlineSelect: React.FC<InlineSelectProps> = ({ value, options, onSave, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newValue = currentValue === '' ? null : currentValue;
      await onSave(newValue);
      setIsEditing(false);
    } catch (error) {
      toast({ 
        title: 'Save Failed', 
        description: 'Could not update override.', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Select value={currentValue} onValueChange={setCurrentValue}>
          <SelectTrigger className="h-6 text-xs min-w-24">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 px-1"
          onClick={handleSave}
          disabled={saving}
        >
          ✓
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 px-1"
          onClick={handleCancel}
        >
          ✕
        </Button>
      </div>
    );
  }

  const hasOverride = value !== null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsEditing(true)}
            className={`text-left hover:bg-muted/50 rounded px-1 py-0.5 transition-colors min-h-6 w-full ${
              hasOverride ? 'bg-primary/10 border border-primary/20' : ''
            }`}
          >
            {value ? (
              <Badge variant={hasOverride ? "default" : "secondary"} className="text-xs">
                {value}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {hasOverride ? 'Manual override active' : 'Click to set override'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const BigFiveCell: React.FC<BigFiveCellProps> = ({ value, onSave }) => {
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

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<UserWithOverrides[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserManagementFilters>({
    page: 0,
    pageSize: 50
  });
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsersWithOverrides(filters);
      setUsers(response.users);
      setTotalCount(response.totalCount);
    } catch (error) {
      toast({ 
        title: 'Load Failed', 
        description: 'Could not load user data.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const handleUserSelection = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleOverrideUpdate = async (userId: string, framework: string, value: string | null) => {
    await updateUserOverride(userId, framework, value);
    
    // Update local state
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, [framework]: value }
        : user
    ));

    toast({
      title: 'Override Updated',
      description: `${framework.replace('_', ' ')} updated for user.`
    });
  };

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search, page: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          User Management ({totalCount} users)
        </h2>
        <Button onClick={loadUsers} disabled={loading} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or username..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select 
              value={filters.hasOverrides?.toString() || 'all'} 
              onValueChange={(value) => setFilters({ 
                ...filters, 
                hasOverrides: value === 'all' ? undefined : value === 'true',
                page: 0 
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Override Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="true">Has Overrides</SelectItem>
                <SelectItem value="false">No Overrides</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.hasAssessments?.toString() || 'all'} 
              onValueChange={(value) => setFilters({ 
                ...filters, 
                hasAssessments: value === 'all' ? undefined : value === 'true',
                page: 0 
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assessment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="true">Has Assessments</SelectItem>
                <SelectItem value="false">No Assessments</SelectItem>
              </SelectContent>
            </Select>

            {selectedUsers.size > 0 && (
              <BulkOperationsPanel
                selectedUserIds={Array.from(selectedUsers)}
                onComplete={() => {
                  setSelectedUsers(new Set());
                  loadUsers();
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={users.length > 0 && selectedUsers.size === users.length}
                      onCheckedChange={handleSelectAll}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                        />
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
                        <InlineSelect
                          value={user.mbti_type}
                          options={FRAMEWORK_OPTIONS.mbti_type}
                          onSave={(value) => handleOverrideUpdate(user.id, 'mbti_type', value)}
                          placeholder="MBTI"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.enneagram_type}
                          options={FRAMEWORK_OPTIONS.enneagram_type}
                          onSave={(value) => handleOverrideUpdate(user.id, 'enneagram_type', value)}
                          placeholder="Type"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <BigFiveCell
                          value={user.big_five_scores}
                          onSave={(value) => handleOverrideUpdate(user.id, 'big_five_scores', value)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.holland_code}
                          options={FRAMEWORK_OPTIONS.holland_code}
                          onSave={(value) => handleOverrideUpdate(user.id, 'holland_code', value)}
                          placeholder="Code"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.alignment}
                          options={FRAMEWORK_OPTIONS.alignment}
                          onSave={(value) => handleOverrideUpdate(user.id, 'alignment', value)}
                          placeholder="Alignment"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.socionics_type}
                          options={FRAMEWORK_OPTIONS.socionics_type}
                          onSave={(value) => handleOverrideUpdate(user.id, 'socionics_type', value)}
                          placeholder="Type"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.integral_level}
                          options={FRAMEWORK_OPTIONS.integral_level}
                          onSave={(value) => handleOverrideUpdate(user.id, 'integral_level', value)}
                          placeholder="Level"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <InlineSelect
                          value={user.attachment_style}
                          options={FRAMEWORK_OPTIONS.attachment_style}
                          onSave={(value) => handleOverrideUpdate(user.id, 'attachment_style', value)}
                          placeholder="Style"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {totalCount} users
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 0}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page! + 1) * filters.pageSize! >= totalCount}
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTable;
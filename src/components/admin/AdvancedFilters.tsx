import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { type UserManagementFilters } from '@/services/userManagementService';

interface AdvancedFiltersProps {
  filters: UserManagementFilters;
  onFiltersChange: (filters: UserManagementFilters) => void;
  totalCount: number;
  onClearFilters: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  onClearFilters
}) => {
  const [sortColumn, setSortColumn] = React.useState<string>('created_at');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search, page: 0 });
  };

  const handleFilterChange = (key: keyof UserManagementFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 0 });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      onFiltersChange({ ...filters, sortBy: column, sortDirection: newDirection });
    } else {
      setSortColumn(column);
      setSortDirection('asc');
      onFiltersChange({ ...filters, sortBy: column, sortDirection: 'asc' });
    }
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'page' && key !== 'pageSize' && value !== undefined && value !== ''
  ).length;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or email..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select 
              value={filters.hasOverrides?.toString() || 'all'} 
              onValueChange={(value) => handleFilterChange('hasOverrides', 
                value === 'all' ? undefined : value === 'true'
              )}
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
              onValueChange={(value) => handleFilterChange('hasAssessments',
                value === 'all' ? undefined : value === 'true'
              )}
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

            <Select 
              value={filters.verificationLevel || 'all'} 
              onValueChange={(value) => handleFilterChange('verificationLevel',
                value === 'all' ? undefined : value
              )}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Verification Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            
            {['created_at', 'display_name', 'assessment_count', 'verification_level'].map(column => (
              <Button
                key={column}
                variant={sortColumn === column ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort(column)}
                className="text-xs"
              >
                {column.replace('_', ' ')}
                {sortColumn === column && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="h-3 w-3 ml-1" /> : 
                    <SortDesc className="h-3 w-3 ml-1" />
                )}
              </Button>
            ))}
          </div>

          {/* Active Filters & Clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {totalCount} users
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                </Badge>
              )}
            </div>
            
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
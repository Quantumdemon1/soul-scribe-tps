import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, User, Mail, Calendar, Award } from 'lucide-react';
import { type UserWithOverrides } from '@/services/userManagementService';
import { BigFiveEditor } from './BigFiveEditor';
import { EnhancedInlineSelect } from './EnhancedInlineSelect';
import { FRAMEWORK_OPTIONS } from '@/services/userManagementService';

interface MobileUserCardProps {
  user: UserWithOverrides;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (checked: boolean) => void;
  onToggleExpand: () => void;
  onOverrideUpdate: (framework: string, value: any) => Promise<void>;
}

export const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onOverrideUpdate
}) => {
  return (
    <Card className={`${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="rounded border-gray-300"
              aria-label={`Select user ${user.display_name || user.username}`}
            />
            <div>
              <CardTitle className="text-sm">
                {user.display_name || user.username || 'No Name'}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <User className="h-3 w-3" />
            {user.id.slice(0, 8)}...
          </Badge>
          {user.verification_level && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Award className="h-3 w-3" />
              {user.verification_level}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {user.assessment_count} assessments
          </Badge>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              {/* MBTI */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  MBTI Type
                </label>
                <EnhancedInlineSelect
                  value={user.mbti_type}
                  options={FRAMEWORK_OPTIONS.mbti_type}
                  onSave={(value) => onOverrideUpdate('mbti_type', value)}
                  placeholder="MBTI"
                />
              </div>

              {/* Enneagram */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Enneagram
                </label>
                <EnhancedInlineSelect
                  value={user.enneagram_type}
                  options={FRAMEWORK_OPTIONS.enneagram_type}
                  onSave={(value) => onOverrideUpdate('enneagram_type', value)}
                  placeholder="Type"
                />
              </div>

              {/* Holland Code */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Holland Code
                </label>
                <EnhancedInlineSelect
                  value={user.holland_code}
                  options={FRAMEWORK_OPTIONS.holland_code}
                  onSave={(value) => onOverrideUpdate('holland_code', value)}
                  placeholder="Code"
                />
              </div>

              {/* Alignment */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Alignment
                </label>
                <EnhancedInlineSelect
                  value={user.alignment}
                  options={FRAMEWORK_OPTIONS.alignment}
                  onSave={(value) => onOverrideUpdate('alignment', value)}
                  placeholder="Alignment"
                />
              </div>

              {/* Socionics */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Socionics
                </label>
                <EnhancedInlineSelect
                  value={user.socionics_type}
                  options={FRAMEWORK_OPTIONS.socionics_type}
                  onSave={(value) => onOverrideUpdate('socionics_type', value)}
                  placeholder="Type"
                />
              </div>

              {/* Integral Level */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Integral Level
                </label>
                <EnhancedInlineSelect
                  value={user.integral_level}
                  options={FRAMEWORK_OPTIONS.integral_level}
                  onSave={(value) => onOverrideUpdate('integral_level', value)}
                  placeholder="Level"
                />
              </div>

              {/* Attachment Style */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Attachment
                </label>
                <EnhancedInlineSelect
                  value={user.attachment_style}
                  options={FRAMEWORK_OPTIONS.attachment_style}
                  onSave={(value) => onOverrideUpdate('attachment_style', value)}
                  placeholder="Style"
                />
              </div>

              {/* Big Five - Full Width */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Big Five Scores
                </label>
                <div className="bg-muted/50 rounded p-2">
                  {user.big_five_scores ? (
                    <div className="text-xs">
                      <Badge variant="default" className="text-xs">Big Five Override Set</Badge>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No Big Five override</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
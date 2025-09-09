import { supabase } from '@/integrations/supabase/client';
import { ScoringOverrides, FrameworkType } from './scoringConfigService';
import { logger } from '@/utils/structuredLogging';

export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'rollback';
  target: 'global_config' | 'user_override' | 'trait_mapping';
  targetId?: string;
  framework?: FrameworkType;
  changeDescription: string;
  oldValues?: any;
  newValues?: any;
  impactedUsers?: number;
  rollbackData?: any;
  metadata?: Record<string, any>;
}

export interface ConfigSnapshot {
  id: string;
  timestamp: Date;
  userId: string;
  description: string;
  configData: ScoringOverrides;
  changesSummary: string[];
}

export class AuditTrailService {
  private static readonly TABLE_NAME = 'scoring_audit_log';
  private static readonly SNAPSHOTS_TABLE = 'config_snapshots';

  static async logChange(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // For now, store in browser storage since we don't have the audit table yet
      const existingLogs = this.getLocalAuditLog();
      existingLogs.push(auditEntry);
      
      // Keep only last 1000 entries
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }

      localStorage.setItem('scoring_audit_log', JSON.stringify(existingLogs));
      
      logger.info('Audit log entry created', { 
        component: 'auditTrail'
      });
    } catch (error) {
      logger.error('Failed to create audit log entry', { component: 'auditTrail' }, error as Error);
    }
  }

  static getLocalAuditLog(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem('scoring_audit_log');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static async createSnapshot(
    userId: string,
    description: string,
    configData: ScoringOverrides,
    changesSummary: string[]
  ): Promise<string> {
    const snapshot: ConfigSnapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
      description,
      configData,
      changesSummary
    };

    // Store locally for now
    const existingSnapshots = this.getLocalSnapshots();
    existingSnapshots.push(snapshot);
    
    // Keep only last 50 snapshots
    if (existingSnapshots.length > 50) {
      existingSnapshots.splice(0, existingSnapshots.length - 50);
    }

    localStorage.setItem('config_snapshots', JSON.stringify(existingSnapshots));
    
    await this.logChange({
      userId,
      action: 'create',
      target: 'global_config',
      changeDescription: `Snapshot created: ${description}`,
      metadata: { changeCount: changesSummary.length }
    });

    return snapshot.id;
  }

  static getLocalSnapshots(): ConfigSnapshot[] {
    try {
      const stored = localStorage.getItem('config_snapshots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static async rollbackToSnapshot(snapshotId: string, userId: string): Promise<ScoringOverrides | null> {
    try {
      const snapshots = this.getLocalSnapshots();
      const snapshot = snapshots.find(s => s.id === snapshotId);
      
      if (!snapshot) {
        throw new Error(`Snapshot ${snapshotId} not found`);
      }

      await this.logChange({
        userId,
        action: 'rollback',
        target: 'global_config',
        changeDescription: `Rolled back to snapshot: ${snapshot.description}`,
        metadata: { 
          snapshotTimestamp: snapshot.timestamp.toISOString()
        }
      });

      return snapshot.configData;
    } catch (error) {
      logger.error('Failed to rollback to snapshot', { component: 'auditTrail' }, error as Error);
      return null;
    }
  }

  static async logWeightChange(
    userId: string,
    framework: FrameworkType,
    dimension: string,
    trait: string,
    oldValue: number,
    newValue: number
  ): Promise<void> {
    await this.logChange({
      userId,
      action: 'update',
      target: 'global_config',
      framework,
      changeDescription: `Weight changed: ${framework}.${dimension}.${trait}`,
      oldValues: { [trait]: oldValue },
      newValues: { [trait]: newValue },
      metadata: { dimension, trait }
    });
  }

  static async logMappingChange(
    userId: string,
    trait: string,
    oldQuestions: number[],
    newQuestions: number[]
  ): Promise<void> {
    const added = newQuestions.filter(q => !oldQuestions.includes(q));
    const removed = oldQuestions.filter(q => !newQuestions.includes(q));
    
    await this.logChange({
      userId,
      action: 'update',
      target: 'trait_mapping',
      changeDescription: `Trait mapping changed: ${trait}`,
      oldValues: { questions: oldQuestions },
      newValues: { questions: newQuestions },
      metadata: { 
        trait,
        added,
        removed,
        addedCount: added.length,
        removedCount: removed.length
      }
    });
  }

  static generateChangesSummary(
    oldConfig: ScoringOverrides | null,
    newConfig: ScoringOverrides
  ): string[] {
    const changes: string[] = [];

    if (!oldConfig) {
      changes.push('Initial configuration created');
      return changes;
    }

    // Compare MBTI weights
    if (newConfig.mbti && oldConfig.mbti) {
      Object.entries(newConfig.mbti).forEach(([dim, config]) => {
        const oldDim = oldConfig.mbti?.[dim as keyof typeof oldConfig.mbti];
        if (oldDim) {
          Object.entries(config.traits).forEach(([trait, weight]) => {
            const oldWeight = oldDim.traits[trait];
            if (oldWeight !== undefined && Math.abs(oldWeight - weight) > 0.001) {
              changes.push(`MBTI ${dim}.${trait}: ${oldWeight.toFixed(3)} → ${weight.toFixed(3)}`);
            }
          });
          
          if (oldDim.threshold !== config.threshold) {
            changes.push(`MBTI ${dim} threshold: ${oldDim.threshold} → ${config.threshold}`);
          }
        }
      });
    }

    // Compare trait mappings
    if (newConfig.traitMappings && oldConfig.traitMappings) {
      Object.entries(newConfig.traitMappings).forEach(([trait, questions]) => {
        const oldQuestions = oldConfig.traitMappings?.[trait] || [];
        const added = questions.filter(q => !oldQuestions.includes(q));
        const removed = oldQuestions.filter(q => !questions.includes(q));
        
        if (added.length > 0) {
          changes.push(`${trait}: Added questions ${added.join(', ')}`);
        }
        if (removed.length > 0) {
          changes.push(`${trait}: Removed questions ${removed.join(', ')}`);
        }
      });
    }

    return changes;
  }

  static async getImpactAssessment(configChanges: ScoringOverrides): Promise<{
    estimatedAffectedUsers: number;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
  }> {
    const riskFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Simple risk analysis
    if (configChanges.mbti) {
      riskLevel = 'medium';
      riskFactors.push('MBTI weights modified');
    }

    if (configChanges.traitMappings) {
      const emptyTraits = Object.entries(configChanges.traitMappings)
        .filter(([_, questions]) => questions.length === 0);
      
      if (emptyTraits.length > 0) {
        riskLevel = 'high';
        riskFactors.push(`${emptyTraits.length} traits have no questions mapped`);
      }
    }

    const estimatedAffectedUsers = riskLevel === 'high' ? 10000 : 
                                 riskLevel === 'medium' ? 5000 : 1000;

    return {
      estimatedAffectedUsers,
      riskLevel,
      riskFactors
    };
  }
}

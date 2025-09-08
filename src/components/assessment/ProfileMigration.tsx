import React, { useEffect, useState } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { TPSScoring } from '@/utils/tpsScoring';
import { logger } from '@/utils/structuredLogging';

interface ProfileMigrationProps {
  profile: PersonalityProfile;
  onProfileUpdated: (updatedProfile: PersonalityProfile) => void;
}

export const ProfileMigration: React.FC<ProfileMigrationProps> = ({ 
  profile, 
  onProfileUpdated 
}) => {
  const [migrationStatus, setMigrationStatus] = useState<'checking' | 'migrating' | 'complete' | 'not-needed'>('checking');

  useEffect(() => {
    const checkAndMigrateProfile = () => {
      // Check if this profile needs migration to version 2.1.0 (enhanced mappings)
      const currentVersion = profile.version || '1.0.0';
      const needsEnhancedMigration = parseFloat(currentVersion) < 2.1;
      const needsAlignmentMigration = !profile.version || 
        parseFloat(currentVersion) < 2.0 ||
        profile.mappings.dndAlignment === 'Neutral Neutral';
      
      if (needsEnhancedMigration || needsAlignmentMigration) {
        logger.info('Migrating profile to enhanced mappings version 2.1.0', {
          component: 'ProfileMigration',
          metadata: {
            currentVersion,
            hasEnhancedMappings: !!profile.mappings.mbtiDetail,
            needsEnhancedMigration,
            needsAlignmentMigration
          }
        });
        setMigrationStatus('migrating');
        
        try {
          // Recalculate the profile with the updated logic
          const updatedProfile = TPSScoring.recalculateProfile(profile);
          
          logger.info('Profile migration to v2.1.0 complete', {
            component: 'ProfileMigration',
            metadata: {
              oldAlignment: profile.mappings.dndAlignment,
              newAlignment: updatedProfile.mappings.dndAlignment,
              oldVersion: profile.version,
              newVersion: updatedProfile.version,
              hasEnhancedMappings: !!updatedProfile.mappings.mbtiDetail,
              enhancedFeatures: {
                mbtiDetail: !!updatedProfile.mappings.mbtiDetail,
                attachmentStyle: !!updatedProfile.mappings.attachmentStyle,
                enhancedEnneagram: !!updatedProfile.mappings.enneagramDetail
              }
            }
          });
          
          setMigrationStatus('complete');
          onProfileUpdated(updatedProfile);
        } catch (error) {
          logger.error('Profile migration failed', {
            component: 'ProfileMigration',
            metadata: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
          });
          setMigrationStatus('complete'); // Continue with original profile
        }
      } else {
        logger.info('Profile migration not needed - already v2.1.0+', {
          component: 'ProfileMigration',
          metadata: {
            version: profile.version,
            alignment: profile.mappings.dndAlignment,
            hasEnhancedMappings: !!profile.mappings.mbtiDetail
          }
        });
        setMigrationStatus('not-needed');
      }
    };

    checkAndMigrateProfile();
  }, [profile, onProfileUpdated]);

  // This component doesn't render anything - it's just for migration logic
  return null;
};
import React, { useEffect, useState } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { TPSScoring } from '@/utils/tpsScoring';

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
      // Check if this profile needs migration (no version or version is below 2.0.0)
      const needsMigration = !profile.version || 
        (profile.version && parseFloat(profile.version) < 2.0) ||
        profile.mappings.dndAlignment === 'Neutral Neutral'; // Direct check for old default
      
      if (needsMigration) {
        console.log('Migrating profile with old D&D alignment calculation...', {
          currentVersion: profile.version,
          currentAlignment: profile.mappings.dndAlignment
        });
        setMigrationStatus('migrating');
        
        try {
          // Recalculate the profile with the updated logic
          const updatedProfile = TPSScoring.recalculateProfile(profile);
          
          console.log('Profile migration complete:', {
            oldAlignment: profile.mappings.dndAlignment,
            newAlignment: updatedProfile.mappings.dndAlignment,
            oldVersion: profile.version,
            newVersion: updatedProfile.version
          });
          
          setMigrationStatus('complete');
          onProfileUpdated(updatedProfile);
        } catch (error) {
          console.error('Profile migration failed:', error);
          setMigrationStatus('complete'); // Continue with original profile
        }
      } else {
        console.log('Profile migration not needed:', {
          version: profile.version,
          alignment: profile.mappings.dndAlignment
        });
        setMigrationStatus('not-needed');
      }
    };

    checkAndMigrateProfile();
  }, [profile, onProfileUpdated]);

  // This component doesn't render anything - it's just for migration logic
  return null;
};
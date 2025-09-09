import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/structuredLogging';

interface RateLimitOptions {
  endpoint: string;
  limit: number;
  windowMinutes: number;
}

interface RateLimitResult {
  isAllowed: boolean;
  remainingRequests: number;
  resetTime: Date;
}

export function useRateLimit() {
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  const checkRateLimit = useCallback(async (
    options: RateLimitOptions
  ): Promise<RateLimitResult> => {
    if (!user) {
      // Allow anonymous users with basic limits
      return {
        isAllowed: true,
        remainingRequests: options.limit - 1,
        resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000)
      };
    }

    setIsChecking(true);
    try {
      const windowStart = new Date(Date.now() - options.windowMinutes * 60 * 1000);
      
      // Check existing rate limit records
      const { data: existing, error: fetchError } = await supabase
        .from('rate_limits')
        .select('request_count, window_start')
        .eq('user_id', user.id)
        .eq('endpoint', options.endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('Rate limit check error', { component: 'useRateLimit' }, fetchError as Error);
        // Allow on error
        return {
          isAllowed: true,
          remainingRequests: options.limit - 1,
          resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000)
        };
      }

      if (!existing) {
        // Create new rate limit record
        await supabase
          .from('rate_limits')
          .insert({
            user_id: user.id,
            endpoint: options.endpoint,
            request_count: 1,
            window_start: new Date().toISOString()
          });

        return {
          isAllowed: true,
          remainingRequests: options.limit - 1,
          resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000)
        };
      }

      if (existing.request_count >= options.limit) {
        return {
          isAllowed: false,
          remainingRequests: 0,
          resetTime: new Date(new Date(existing.window_start).getTime() + options.windowMinutes * 60 * 1000)
        };
      }

      // Increment request count
      await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('user_id', user.id)
        .eq('endpoint', options.endpoint)
        .gte('window_start', windowStart.toISOString());

      return {
        isAllowed: true,
        remainingRequests: options.limit - existing.request_count - 1,
        resetTime: new Date(new Date(existing.window_start).getTime() + options.windowMinutes * 60 * 1000)
      };
    } catch (error) {
      logger.error('Rate limit error', { component: 'useRateLimit' }, error as Error);
      // Allow on error
      return {
        isAllowed: true,
        remainingRequests: options.limit - 1,
        resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000)
      };
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  return {
    checkRateLimit,
    isChecking
  };
}
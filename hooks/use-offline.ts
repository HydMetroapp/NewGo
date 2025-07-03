
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import { CACHE_CONFIG } from '@/lib/constants';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

interface UseOfflineReturn {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  addOfflineAction: (type: string, data: any) => void;
  processPendingActions: () => Promise<void>;
  clearPendingActions: () => void;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Set initial status
    updateOnlineStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load pending actions from storage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Process pending actions when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      processPendingActions();
    }
  }, [isOnline]);

  const loadPendingActions = () => {
    const actions = getLocalStorage<OfflineAction[]>(CACHE_CONFIG.offlineQueueKey, []);
    setPendingActions(actions);
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    setLocalStorage(CACHE_CONFIG.offlineQueueKey, actions);
    setPendingActions(actions);
  };

  const addOfflineAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
    };

    const updatedActions = [...pendingActions, action];
    savePendingActions(updatedActions);
  }, [pendingActions]);

  const processPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const processedActions: string[] = [];

    for (const action of pendingActions) {
      try {
        await processOfflineAction(action);
        processedActions.push(action.id);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        // Keep failed actions for retry
      }
    }

    // Remove successfully processed actions
    const remainingActions = pendingActions.filter(
      action => !processedActions.includes(action.id)
    );
    savePendingActions(remainingActions);
  }, [isOnline, pendingActions]);

  const processOfflineAction = async (action: OfflineAction): Promise<void> => {
    switch (action.type) {
      case 'START_JOURNEY':
        // Process offline journey start
        await fetch('/api/journeys/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      case 'END_JOURNEY':
        // Process offline journey end
        await fetch('/api/journeys/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      case 'UPDATE_PROFILE':
        // Process offline profile update
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      default:
        console.warn('Unknown offline action type:', action.type);
    }
  };

  const clearPendingActions = useCallback(() => {
    savePendingActions([]);
  }, []);

  return {
    isOnline,
    pendingActions,
    addOfflineAction,
    processPendingActions,
    clearPendingActions,
  };
}

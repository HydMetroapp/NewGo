
'use client';

import { useState, useEffect } from 'react';
import { PWAInstallPrompt } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
}

export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as any;
      setDeferredPrompt(installEvent);
      setIsInstallable(true);

      // Check if user has previously dismissed the prompt
      const dismissed = getLocalStorage(STORAGE_KEYS.installPrompt, false);
      if (!dismissed && !isInstalled) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        return true;
      } else {
        dismissInstallPrompt();
        return false;
      }
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setLocalStorage(STORAGE_KEYS.installPrompt, true);
  };

  return {
    isInstallable,
    isInstalled,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
  };
}

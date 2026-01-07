import { useState, useEffect, useCallback } from 'react';
import { CURRENT_TC_VERSION, CURRENT_RELEASE_TAG } from '@/data/mockTermsData';

const STORAGE_KEY = 'clms_tc_consent';

interface ConsentState {
  lastAcceptedVersion: string | null;
  acceptedAt: string | null;
}

export const useTermsConsent = () => {
  const [consentState, setConsentState] = useState<ConsentState>({
    lastAcceptedVersion: null,
    acceptedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load consent state from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConsentState(parsed);
      } catch (e) {
        console.error('Failed to parse consent state:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const needsConsent = !isLoading && consentState.lastAcceptedVersion !== CURRENT_TC_VERSION;

  const acceptTerms = useCallback(() => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').replace('Z', '');
    
    const newState: ConsentState = {
      lastAcceptedVersion: CURRENT_TC_VERSION,
      acceptedAt: timestamp,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    setConsentState(newState);
    
    // In a real app, this would also log to the database
    console.log('Consent logged:', {
      policy_version: CURRENT_TC_VERSION,
      release_tag: CURRENT_RELEASE_TAG,
      accepted_at: timestamp,
    });
  }, []);

  const resetConsent = useCallback(() => {
    // For demo purposes - simulate a new major release
    localStorage.removeItem(STORAGE_KEY);
    setConsentState({ lastAcceptedVersion: null, acceptedAt: null });
  }, []);

  return {
    needsConsent,
    isLoading,
    currentVersion: CURRENT_TC_VERSION,
    lastAcceptedVersion: consentState.lastAcceptedVersion,
    acceptedAt: consentState.acceptedAt,
    acceptTerms,
    resetConsent,
  };
};

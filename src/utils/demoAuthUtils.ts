/**
 * Centralized Recruiter / Demo Mode detection & action guard utilities.
 * Allows unrestricted full administrative access across all CMS tabs and admin management components.
 */

export const isDemoSessionActive = (): boolean => {
  return false;
};

export const DEMO_RESTRICTION_MESSAGE = "";

export const checkAndBlockDemoAction = (
  _toastCallback?: (message: string, type: 'success' | 'error') => void
): boolean => {
  return false; // Always allowed - unrestricted write access
};


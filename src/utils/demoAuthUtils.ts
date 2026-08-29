/**
 * Centralized Recruiter / Demo Mode detection & action guard utilities.
 * Ensures strict Read-Only enforcement across all CMS tabs and admin management components.
 */

export const isDemoSessionActive = (): boolean => {
  try {
    const rawUser = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed.isDemo === true) return true;
      if (parsed.isDemo === false) return false;
    }
  } catch (e) {}
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('alex_dev_jwt_token') || sessionStorage.getItem('alex_dev_jwt_token') || '';
  if (token.startsWith('demo_guest_token_')) return true;
  return sessionStorage.getItem('is_demo_session') === 'true';
};

export const DEMO_RESTRICTION_MESSAGE = "You are in Recruiter / Demo mode (Read-Only access). Modifications and saving are disabled. Log in via /admin to make changes.";

export const checkAndBlockDemoAction = (
  toastCallback?: (message: string, type: 'success' | 'error') => void
): boolean => {
  if (isDemoSessionActive()) {
    if (toastCallback) {
      toastCallback(DEMO_RESTRICTION_MESSAGE, 'error');
    }
    return true; // Blocked
  }
  return false; // Allowed
};

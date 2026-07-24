export function notifyCmsUpdate() {
  try {
    localStorage.setItem('cms_update_timestamp', Date.now().toString());
    window.dispatchEvent(new CustomEvent('cms-data-updated'));
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'CMS_DATA_UPDATED' }, '*');
    }
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}


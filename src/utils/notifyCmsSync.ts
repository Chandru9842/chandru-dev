export function notifyCmsUpdate() {
  try {
    localStorage.setItem('cms_update_timestamp', Date.now().toString());
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

function showError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const loading = document.querySelector<HTMLElement>('.ld-msg');
  if (loading) loading.textContent = `无法启动三维场景：${message}`;
  if (parent !== window) parent.postMessage({ channel: 'autumn-lab', event: 'error', message }, location.origin);
}
window.addEventListener('error', event => showError(event.error ?? event.message));
window.addEventListener('unhandledrejection', event => showError(event.reason));
import('./main').catch(showError);

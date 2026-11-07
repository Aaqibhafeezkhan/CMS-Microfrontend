(function () {
  'use strict';
  function ensurePanel() {
    var panel = document.getElementById('cms-recovery-panel');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.id = 'cms-recovery-panel';
    panel.className = 'cms-recovery-panel';
    panel.setAttribute('role', 'alert');
    panel.setAttribute('aria-live', 'assertive');
    panel.hidden = true;
    panel.innerHTML = '<div><strong id="cms-recovery-title">Module unavailable</strong><p id="cms-recovery-message"></p><div class="cms-recovery-actions"><button type="button" id="cms-recovery-retry">Retry module</button><a href="/cms-root-orchestration/">Return to dashboard</a></div></div>';
    var main = document.querySelector('.main-content');
    if (main) main.insertBefore(panel, main.firstChild);
    panel.querySelector('#cms-recovery-retry').addEventListener('click', function () {
      window.dispatchEvent(new CustomEvent('cms:shell:module-retry', { detail: { appName: panel.getAttribute('data-app') } }));
    });
    return panel;
  }
  window.addEventListener('cms:shell:module-error', function (event) {
    var detail = event.detail || {};
    var panel = ensurePanel();
    panel.setAttribute('data-app', detail.appName || '');
    panel.querySelector('#cms-recovery-title').textContent = (detail.appName || 'A CMS module') + ' could not start';
    panel.querySelector('#cms-recovery-message').textContent = detail.message || 'Try again or return to the dashboard.';
    panel.hidden = false;
  });
  window.addEventListener('single-spa:routing-event', function () {
    var panel = document.getElementById('cms-recovery-panel');
    if (panel) panel.hidden = true;
  });
  window.addEventListener('error', function (event) {
    if (event && event.message && /QuotaExceededError|SecurityError/.test(event.message)) {
      window.dispatchEvent(new CustomEvent('cms:storage:error', { detail: { message: 'Browser storage is unavailable or full. Your last change may not have been saved.' } }));
    }
  });
  window.addEventListener('cms:storage:error', function (event) {
    var panel = ensurePanel();
    panel.hidden = false;
    panel.querySelector('#cms-recovery-title').textContent = 'Storage problem';
    panel.querySelector('#cms-recovery-message').textContent = event.detail && event.detail.message || 'The browser could not save this change.';
    panel.querySelector('#cms-recovery-retry').hidden = true;
  });
})();

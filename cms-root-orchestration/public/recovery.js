(function(){
'use strict';
function show(title,message){
 var panel=document.getElementById('cms-recovery-panel');
 if(!panel){
  panel=document.createElement('section');panel.id='cms-recovery-panel';panel.className='cms-recovery-panel';
  panel.setAttribute('role','alert');panel.setAttribute('aria-live','assertive');
  var base=window.location.pathname.startsWith('/cms-root-orchestration')?'/cms-root-orchestration':'';
  panel.innerHTML='<strong id="cms-recovery-title"></strong><p id="cms-recovery-message"></p><div class="cms-recovery-actions"><button type="button" id="cms-recovery-dismiss">Dismiss</button><a href="'+base+'/">Return to dashboard</a></div>';
  var main=document.querySelector('.main-content');if(main)main.insertBefore(panel,main.firstChild);
  panel.querySelector('#cms-recovery-dismiss').addEventListener('click',function(){panel.hidden=true;});
 }
 panel.querySelector('#cms-recovery-title').textContent=title;
 panel.querySelector('#cms-recovery-message').textContent=message;panel.hidden=false;
}
window.addEventListener('cms:shell:module-error',function(event){var d=event.detail||{};show((d.appName||'A module')+' could not start',(d.message||'The module failed to load.')+' Refresh this route to retry or return to the dashboard.');});
window.addEventListener('cms:storage:error',function(event){show('Your change may not have been saved',event.detail&&event.detail.message||'Browser storage is unavailable or full. Existing data has not been intentionally replaced.');});
window.addEventListener('unhandledrejection',function(event){var reason=event&&event.reason;if(reason&&/storage|quota|indexeddb/i.test(String(reason.message||reason)))show('Storage operation failed','The browser could not complete a storage operation. Check available site storage and retry.');});
window.addEventListener('single-spa:routing-event',function(){var panel=document.getElementById('cms-recovery-panel');if(panel)panel.hidden=true;});
})();

(function () {
  'use strict';
  var BASE = '/cms-root-orchestration';
  var KEYS = { articles: 'cms_articles', comments: 'cms_collaboration_comments', activity: 'cms_collaboration_activity', media: 'cms_assets', session: 'cms_session' };
  function parse(key) { try { var value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (_) { return []; } }
  function session() { var platform = window.CMSPlatform; return platform ? platform.getSession() : (function(){try{return JSON.parse(localStorage.getItem(KEYS.session)||'null');}catch(_){return null;}})(); }
  function el(tag, className, text) { var node=document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node; }
  function card(label,value,detail) { var node=el('article','cms-metric-card'); node.appendChild(el('span','cms-metric-label',label)); node.appendChild(el('strong','cms-metric-value',String(value))); node.appendChild(el('small','cms-metric-detail',detail)); return node; }
  function render() {
    var host=document.getElementById('cms-dashboard'); if(!host)return;
    var current=session(); var articles=parse(KEYS.articles), comments=parse(KEYS.comments), activity=parse(KEYS.activity), media=parse(KEYS.media);
    var counts={Draft:0,Review:0,Published:0,Archived:0}; articles.forEach(function(a){var s=String(a.status||'Draft'); if(counts[s]!==undefined)counts[s]++;});
    host.replaceChildren();
    var header=el('div','cms-dashboard-header'); var heading=el('div');
    heading.appendChild(el('p','cms-eyebrow','WORKSPACE OVERVIEW'));
    heading.appendChild(el('h2','cms-dashboard-title','Your CMS at a glance'));
    heading.appendChild(el('p','cms-dashboard-subtitle',current && current.user ? 'Welcome back, '+(current.user.name||current.user.email||'there')+'. Here is what is happening across your workspace.' : 'Sign in to manage content and collaborate with your team.'));
    header.appendChild(heading);
    var actions=el('div','cms-dashboard-actions');
    [['Create article',BASE+'/editorial'],['Open media library',BASE+'/media'],['Collaboration',BASE+'/collab']].forEach(function(item){var a=el('a','cms-dashboard-action',item[0]);a.href=item[1];actions.appendChild(a);});
    header.appendChild(actions); host.appendChild(header);
    var grid=el('div','cms-metric-grid');
    grid.appendChild(card('Total articles',articles.length,'Across all editorial states'));
    grid.appendChild(card('Drafts',counts.Draft,'Ready for more work'));
    grid.appendChild(card('In review',counts.Review,'Awaiting editorial review'));
    grid.appendChild(card('Published',counts.Published,'Live content items'));
    grid.appendChild(card('Comments',comments.length,'Discussion contributions'));
    grid.appendChild(card('Media assets',media.length,'Items in your library'));
    host.appendChild(grid);
    var lower=el('div','cms-dashboard-lower');
    var recent=el('section','cms-dashboard-panel'); recent.appendChild(el('h3','','Recent activity'));
    if(!activity.length) recent.appendChild(el('p','cms-dashboard-empty','Activity will appear here as your team creates, edits, publishes, and discusses content.'));
    activity.slice().sort(function(a,b){return new Date(b.createdAt||b.timestamp||0)-new Date(a.createdAt||a.timestamp||0);}).slice(0,5).forEach(function(item){var row=el('div','cms-activity-row');row.appendChild(el('strong','',item.message||item.title||item.type||'CMS activity'));row.appendChild(el('small','',item.createdAt||item.timestamp||''));recent.appendChild(row);});
    var quick=el('section','cms-dashboard-panel');quick.appendChild(el('h3','','Workspace modules'));
    [['Editorial','Manage drafts, reviews, and publishing.','/editorial'],['Collaboration','Discuss content and follow team activity.','/collab'],['Media library','Upload and organize digital assets.','/media']].forEach(function(item){var row=el('a','cms-module-link');row.href=BASE+item[2];row.appendChild(el('strong','',item[0]));row.appendChild(el('span','',item[1]));quick.appendChild(row);});
    lower.appendChild(recent);lower.appendChild(quick);host.appendChild(lower);
  }
  function mount() {
    var landing=document.getElementById('landing-page'); if(!landing||document.getElementById('cms-dashboard'))return;
    var dashboard=el('section','cms-dashboard');dashboard.id='cms-dashboard';landing.replaceChildren(dashboard);render();
  }
  document.addEventListener('DOMContentLoaded',mount); if(document.readyState!=='loading')mount();
  ['storage','article:created','article:updated','article:status_changed','article:published','article:deleted','comment:created','comment:resolved','media:uploaded','media:deleted','auth:login','auth:logout','cms:auth:login','cms:auth:logout'].forEach(function(name){window.addEventListener(name,render);});
})();

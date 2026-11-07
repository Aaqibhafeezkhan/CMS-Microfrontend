(function () {
  'use strict';
  var BASE='/cms-root-orchestration';
  var KEYS={articles:'cms_articles',comments:'cms_collaboration_comments',activity:'cms_collaboration_activity',media:'cms_assets',session:'cms_session'};
  function parse(key){try{var value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch(_){return[];}}
  function currentSession(){try{return window.CMSPlatform?window.CMSPlatform.getSession():JSON.parse(localStorage.getItem(KEYS.session)||'null');}catch(_){return null;}}
  function node(tag,cls,text){var item=document.createElement(tag);if(cls)item.className=cls;if(text!==undefined)item.textContent=text;return item;}
  function metric(label,value,detail){var item=node('article','cms-metric-card');item.appendChild(node('span','cms-metric-label',label));item.appendChild(node('strong','cms-metric-value',String(value)));item.appendChild(node('small','cms-metric-detail',detail));return item;}
  function render(){
    var host=document.getElementById('cms-dashboard');if(!host)return;
    var articles=parse(KEYS.articles),comments=parse(KEYS.comments),activity=parse(KEYS.activity),media=parse(KEYS.media),session=currentSession();
    var counts={Draft:0,Review:0,Published:0,Archived:0};articles.forEach(function(a){var s=String(a.status||'Draft');if(counts[s]!==undefined)counts[s]++;});
    host.replaceChildren();
    var header=node('div','cms-dashboard-header'),intro=node('div');
    intro.appendChild(node('p','cms-eyebrow','WORKSPACE OVERVIEW'));intro.appendChild(node('h2','cms-dashboard-title','Your CMS at a glance'));
    intro.appendChild(node('p','cms-dashboard-subtitle',session&&session.user?'Welcome back, '+(session.user.name||session.user.email||'there')+'. Here is what is happening across your workspace.':'Sign in to manage content and collaborate with your team.'));
    header.appendChild(intro);var actions=node('div','cms-dashboard-actions');
    [['Create article','/editorial'],['Open media library','/media'],['Collaboration','/collab']].forEach(function(item){var a=node('a','cms-dashboard-action',item[0]);a.href=BASE+item[1];actions.appendChild(a);});
    header.appendChild(actions);host.appendChild(header);
    var grid=node('div','cms-metric-grid');
    grid.appendChild(metric('Total articles',articles.length,'Across all editorial states'));grid.appendChild(metric('Drafts',counts.Draft,'Ready for more work'));
    grid.appendChild(metric('In review',counts.Review,'Awaiting editorial review'));grid.appendChild(metric('Published',counts.Published,'Live content items'));
    grid.appendChild(metric('Comments',comments.length,'Discussion contributions'));grid.appendChild(metric('Media assets',media.length,'Items in your library'));host.appendChild(grid);
    var lower=node('div','cms-dashboard-lower'),recent=node('section','cms-dashboard-panel');recent.appendChild(node('h3','','Recent activity'));
    if(!activity.length)recent.appendChild(node('p','cms-dashboard-empty','Activity will appear here as your team creates, edits, publishes, and discusses content.'));
    activity.slice().sort(function(a,b){return new Date(b.createdAt||b.timestamp||0)-new Date(a.createdAt||a.timestamp||0);}).slice(0,5).forEach(function(item){var row=node('div','cms-activity-row');row.appendChild(node('strong','',item.message||item.title||item.type||'CMS activity'));row.appendChild(node('small','',item.createdAt||item.timestamp||''));recent.appendChild(row);});
    var quick=node('section','cms-dashboard-panel');quick.appendChild(node('h3','','Workspace modules'));
    [['Editorial','Manage drafts, reviews, and publishing.','/editorial'],['Collaboration','Discuss content and follow team activity.','/collab'],['Media library','Upload and organize digital assets.','/media']].forEach(function(item){var a=node('a','cms-module-link');a.href=BASE+item[2];a.appendChild(node('strong','',item[0]));a.appendChild(node('span','',item[1]));quick.appendChild(a);});
    lower.appendChild(recent);lower.appendChild(quick);host.appendChild(lower);
  }
  function mount(){var landing=document.getElementById('landing-page');if(!landing||document.getElementById('cms-dashboard'))return;var dashboard=node('section','cms-dashboard');dashboard.id='cms-dashboard';landing.replaceChildren(dashboard);render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  ['storage','article:created','article:updated','article:status_changed','article:published','article:deleted','comment:created','comment:resolved','media:uploaded','media:updated','media:deleted','auth:login','auth:logout','cms:auth:login','cms:auth:logout'].forEach(function(name){window.addEventListener(name,render);});
})();
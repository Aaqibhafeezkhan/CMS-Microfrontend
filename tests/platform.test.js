const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createPlatform() {
  const listeners = Object.create(null);
  const values = new Map();
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options && options.detail; }
  }
  const window = {
    CustomEvent,
    console,
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); },
      removeItem(key) { values.delete(key); }
    },
    addEventListener(type, handler) { (listeners[type] || (listeners[type] = [])).push(handler); },
    removeEventListener(type, handler) { listeners[type] = (listeners[type] || []).filter(item => item !== handler); },
    dispatchEvent(event) { (listeners[event.type] || []).slice().forEach(handler => handler(event)); return true; }
  };
  vm.runInNewContext(fs.readFileSync('cms-root-orchestration/public/platform.js', 'utf8'), {
    window, CustomEvent, Date, Object, Array, String, Number, JSON
  });
  return { window, values };
}

test('publishes versioned events and rejects invalid payloads', () => {
  const { window } = createPlatform();
  let received;
  window.CMSPlatform.subscribe('article:updated', event => { received = event.detail; });
  assert.equal(window.CMSPlatform.publish('article:updated', { articleId: 'article-1', title: 'Updated' }), true);
  assert.equal(received.version, 2);
  assert.equal(received.articleId, 'article-1');
  assert.equal(window.CMSPlatform.publish('article:updated', { title: 'Missing identifier' }), false);
  assert.equal(window.CMSPlatform.publish('not-a-cms-event', {}), false);
});

test('reads and writes known storage keys without throwing on corrupt JSON', () => {
  const { window, values } = createPlatform();
  assert.equal(window.CMSPlatform.write('cms_articles', [{ id: 'article-1' }]), true);
  assert.equal(window.CMSPlatform.read('cms_articles', [])[0].id, 'article-1');
  values.set('cms_collaboration_comments', '{broken');
  assert.equal(Array.from(window.CMSPlatform.getSnapshot().comments).length, 0);
  assert.equal(window.CMSPlatform.write('unregistered-key', []), false);
});

test('accepts valid sessions and rejects expired or incomplete sessions', () => {
  const { window } = createPlatform();
  window.localStorage.setItem('cms_session', JSON.stringify({ user: { id: 'user-1', role: 'Administrator' }, expiresAt: Date.now() + 60000 }));
  assert.equal(window.CMSPlatform.getSession().user.id, 'user-1');
  window.localStorage.setItem('cms_session', JSON.stringify({ user: { id: 'user-1', role: 'Administrator' }, expiresAt: Date.now() - 1 }));
  assert.equal(window.CMSPlatform.getSession(), null);
  window.localStorage.setItem('cms_session', JSON.stringify({ user: {}, expiresAt: Date.now() + 60000 }));
  assert.equal(window.CMSPlatform.getSession(), null);
  window.localStorage.setItem('cms_session', JSON.stringify({ user: { id: 'user-1', role: 'Unknown' }, expiresAt: Date.now() + 60000 }));
  assert.equal(window.CMSPlatform.getSession(), null);
});


test('requires stable identifiers for every article, comment, and media event', () => {
  const { window } = createPlatform();
  [
    'article:created', 'article:updated', 'article:status_changed', 'article:published', 'article:deleted',
    'comment:created', 'comment:resolved',
    'media:uploaded', 'media:updated', 'media:selected', 'media:deleted'
  ].forEach(name => assert.equal(window.CMSPlatform.validateEvent(name, {}).valid, false, name));
  assert.equal(window.CMSPlatform.validateEvent('article:created', { articleId: 'article-1' }).valid, true);
  assert.equal(window.CMSPlatform.validateEvent('comment:resolved', { commentId: 'comment-1' }).valid, true);
  assert.equal(window.CMSPlatform.validateEvent('media:selected', { assetId: 'asset-1' }).valid, true);
});

test('normalizes directly dispatched MFE events before subscribers consume them', () => {
  const { window } = createPlatform();
  let received;
  window.CMSPlatform.subscribe('media:selected', event => { received = event.detail; });
  const detail = { assetId: 'asset-1', reference: 'media://asset-1' };
  window.dispatchEvent(new CustomEvent('media:selected', { detail }));
  assert.equal(received.version, 2);
  assert.equal(received.source, 'legacy-mfe');
  assert.equal(received.contractValid, true);
  assert.ok(received.occurredAt);
});

test('marks invalid native MFE events without silently accepting the contract', () => {
  const { window } = createPlatform();
  let received;
  window.CMSPlatform.subscribe('article:deleted', event => { received = event.detail; });
  const detail = { title: 'Missing id' };
  window.dispatchEvent(new CustomEvent('article:deleted', { detail }));
  assert.equal(received.contractValid, false);
  assert.match(received.contractError, /articleId|id/);
});

test('bridges legacy authentication events and unsubscribe removes listeners', () => {
  const { window } = createPlatform();
  let loginCount = 0;
  const unsubscribe = window.CMSPlatform.subscribe('auth:login', () => { loginCount += 1; });
  window.dispatchEvent(new CustomEvent('cms:auth:login', {
    detail: { authenticated: true, user: { id: 'user-1', role: 'Editor' } }
  }));
  assert.equal(loginCount, 1);
  unsubscribe();
  window.dispatchEvent(new CustomEvent('auth:login', {
    detail: { user: { id: 'user-2', role: 'Editor' } }
  }));
  assert.equal(loginCount, 1);
});

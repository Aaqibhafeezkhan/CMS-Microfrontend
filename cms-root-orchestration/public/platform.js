(function (root) {
  'use strict';
  if (root.CMSPlatform) return;
  var EVENT_NAMES = [
    'auth:login','auth:logout','article:created','article:updated','article:status_changed',
    'article:published','article:deleted','comment:created','comment:resolved',
    'media:uploaded','media:updated','media:selected','media:deleted'
  ];
  var STORAGE_KEYS = {
    session: 'cms_session',
    users: 'cms_users',
    articles: 'cms_articles',
    comments: 'cms_collaboration_comments',
    activity: 'cms_collaboration_activity',
    media: 'cms_assets',
    schema: 'cms_platform_schema'
  };
  var VERSION = 2;
  var legacyNames = {
    'cms:auth:login': 'auth:login',
    'cms:auth:logout': 'auth:logout',
    'cms:auth:expired': 'auth:logout',
    'cms:auth:unauthorized': 'auth:logout'
  };
  function isRecord(value) { return !!value && typeof value === 'object' && !Array.isArray(value); }
  function hasIdentifier(detail, names) {
    return names.some(function (name) {
      return typeof detail[name] === 'string' && detail[name].trim().length > 0;
    });
  }
  function validateEvent(name, detail) {
    if (EVENT_NAMES.indexOf(name) < 0) return { valid: false, reason: 'Unknown CMS event: ' + name };
    if (!isRecord(detail)) return { valid: false, reason: 'Event detail must be an object.' };
    if (name.indexOf('article:') === 0 && !hasIdentifier(detail, ['articleId', 'id'])) {
      return { valid: false, reason: 'Article events require a non-empty articleId or id.' };
    }
    if (name.indexOf('comment:') === 0 && !hasIdentifier(detail, ['commentId', 'id'])) {
      return { valid: false, reason: 'Comment events require a non-empty commentId or id.' };
    }
    if (name.indexOf('media:') === 0 && !hasIdentifier(detail, ['assetId', 'id'])) {
      return { valid: false, reason: 'Media events require a non-empty assetId or id.' };
    }
    if (name === 'auth:login' && (!isRecord(detail.user) || typeof detail.user.id !== 'string' || !detail.user.id.trim())) {
      return { valid: false, reason: 'Login events require a user with a stable id.' };
    }
    return { valid: true };
  }
  function publish(name, detail) {
    var validation = validateEvent(name, detail || {});
    if (!validation.valid) {
      if (root.console && root.console.warn) root.console.warn('[CMSPlatform] ' + validation.reason);
      return false;
    }
    var payload = Object.assign({ version: VERSION, occurredAt: new Date().toISOString(), source: 'cms-platform' }, detail || {});
    root.dispatchEvent(new root.CustomEvent(name, { detail: payload }));
    return true;
  }
  function safeRead(key, fallback) {
    try {
      var raw = root.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }
  function safeWrite(key, value) {
    try {
      root.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }
  function read(key, fallback) { return safeRead(key, fallback); }
  function write(key, value) {
    if (!Object.keys(STORAGE_KEYS).some(function (name) { return STORAGE_KEYS[name] === key; })) return false;
    return safeWrite(key, value);
  }
  function initializeCollection(key, seed) {
    var current = safeRead(key, null);
    if (current === null) { safeWrite(key, seed); return seed; }
    return Array.isArray(current) ? current : [];
  }
  function getSnapshot() {
    return { session: getSession(), articles: initializeCollection(STORAGE_KEYS.articles, []), comments: initializeCollection(STORAGE_KEYS.comments, []), activity: initializeCollection(STORAGE_KEYS.activity, []), media: initializeCollection(STORAGE_KEYS.media, []) };
  }
  function getSession() {
    var session = read(STORAGE_KEYS.session, null);
    var expiresAt = session && Number(session.expiresAt);
    var validRole = session && session.user && ['Administrator', 'Editor', 'Contributor'].indexOf(session.user.role) >= 0;
    if (!isRecord(session) || !isRecord(session.user) || typeof session.user.id !== 'string' || !session.user.id.trim() || !validRole || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
    return session;
  }
  function normalizeNativeEvent(event) {
    if (!event || EVENT_NAMES.indexOf(event.type) < 0) return;
    var detail = event.detail;
    if (!isRecord(detail)) {
      if (root.console && root.console.warn) root.console.warn('[CMSPlatform] ' + event.type + ' has no object payload.');
      return;
    }
    var validation = validateEvent(event.type, detail);
    try {
      if (typeof detail.version !== 'number') detail.version = VERSION;
      if (typeof detail.occurredAt !== 'string' || !detail.occurredAt) detail.occurredAt = new Date().toISOString();
      if (typeof detail.source !== 'string' || !detail.source) detail.source = 'legacy-mfe';
      detail.contractValid = validation.valid;
      if (!validation.valid) detail.contractError = validation.reason;
    } catch (error) {
      if (root.console && root.console.warn) root.console.warn('[CMSPlatform] Could not annotate ' + event.type + ' payload.');
    }
    if (!validation.valid && root.console && root.console.warn) {
      root.console.warn('[CMSPlatform] ' + event.type + ': ' + validation.reason);
    }
  }
  EVENT_NAMES.forEach(function (name) {
    root.addEventListener(name, normalizeNativeEvent);
  });
  function subscribe(name, handler) {
    root.addEventListener(name, handler);
    return function () { root.removeEventListener(name, handler); };
  }
  Object.keys(legacyNames).forEach(function (legacy) {
    root.addEventListener(legacy, function (event) {
      var detail = event && event.detail ? event.detail : {};
      var user = detail.user || null;
      publish(legacyNames[legacy], { user: user, authenticated: !!detail.authenticated, reason: detail.reason || legacy });
    });
  });
  root.CMSPlatform = Object.freeze({
    version: VERSION,
    events: Object.freeze(EVENT_NAMES.slice()),
    storageKeys: Object.freeze(STORAGE_KEYS),
    validateEvent: validateEvent,
    publish: publish,
    subscribe: subscribe,
    read: read,
    write: write,
    getSession: getSession,
    initializeCollection: initializeCollection,
    getSnapshot: getSnapshot
  });
  safeWrite(STORAGE_KEYS.schema, { version: VERSION, initializedAt: new Date().toISOString() });
})(window);

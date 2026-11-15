const transitions = Object.freeze({
  Draft: Object.freeze(['Review']),
  Review: Object.freeze(['Draft', 'Published']),
  Published: Object.freeze(['Draft', 'Archived']),
  Archived: Object.freeze(['Draft'])
});

function permissionForTarget(target) {
  if (target === 'Review') return 'review';
  if (target === 'Published') return 'publish';
  if (target === 'Archived') return 'archive';
  return 'edit';
}

function roleCanPerform(role, permission) {
  if (role === 'Administrator' || role === 'Editor') return true;
  return role === 'Contributor' && permission === 'edit';
}

function isValidArticleTransition(current, target) {
  return Boolean(transitions[current] && transitions[current].includes(target));
}

function canPerformArticleTransition(role, current, target) {
  return isValidArticleTransition(current, target) && roleCanPerform(role, permissionForTarget(target));
}

exports.isValidArticleTransition = isValidArticleTransition;
exports.canPerformArticleTransition = canPerformArticleTransition;

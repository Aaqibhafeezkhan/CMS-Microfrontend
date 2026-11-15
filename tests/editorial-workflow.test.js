const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canPerformArticleTransition,
  isValidArticleTransition
} = require('../cms-react-editorial/src/article-workflow');

test('allows only the supported editorial lifecycle transitions', () => {
  const valid = [
    ['Draft', 'Review'],
    ['Review', 'Draft'],
    ['Review', 'Published'],
    ['Published', 'Draft'],
    ['Published', 'Archived'],
    ['Archived', 'Draft']
  ];
  valid.forEach(([current, target]) => {
    assert.equal(isValidArticleTransition(current, target), true, current + ' -> ' + target);
  });

  const invalid = [
    ['Draft', 'Published'],
    ['Draft', 'Archived'],
    ['Review', 'Archived'],
    ['Published', 'Review'],
    ['Archived', 'Published'],
    ['Archived', 'Review']
  ];
  invalid.forEach(([current, target]) => {
    assert.equal(isValidArticleTransition(current, target), false, current + ' -> ' + target);
  });
});

test('enforces role permissions independently of the UI', () => {
  const transitions = [
    ['Draft', 'Review'],
    ['Review', 'Draft'],
    ['Review', 'Published'],
    ['Published', 'Draft'],
    ['Published', 'Archived'],
    ['Archived', 'Draft']
  ];
  transitions.forEach(([current, target]) => {
    assert.equal(canPerformArticleTransition('Administrator', current, target), true);
    assert.equal(canPerformArticleTransition('Editor', current, target), true);
  });

  assert.equal(canPerformArticleTransition('Contributor', 'Draft', 'Review'), false);
  assert.equal(canPerformArticleTransition('Contributor', 'Review', 'Published'), false);
  assert.equal(canPerformArticleTransition('Contributor', 'Published', 'Archived'), false);
  assert.equal(canPerformArticleTransition('Contributor', 'Review', 'Draft'), true);
  assert.equal(canPerformArticleTransition('Unknown', 'Review', 'Draft'), false);
  assert.equal(canPerformArticleTransition('Contributor', 'Draft', 'Published'), false);
});

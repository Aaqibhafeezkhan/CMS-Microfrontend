export type ArticleStatus = 'Draft' | 'Review' | 'Published' | 'Archived';
export type CmsRole = 'Administrator' | 'Editor' | 'Contributor';

export function isValidArticleTransition(current: ArticleStatus, target: ArticleStatus): boolean;
export function canPerformArticleTransition(role: CmsRole | string, current: ArticleStatus, target: ArticleStatus): boolean;

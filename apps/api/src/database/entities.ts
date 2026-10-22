import { Article } from '../article/article.entity.js';
import { ArticleTerm } from '../article/article-term.entity.js';
import { RefreshToken } from '../auth/refresh-token.entity.js';
import { Category } from '../category/category.entity.js';
import { Media } from '../media/media.entity.js';
import { Page } from '../page/page.entity.js';
import { Pattern } from '../pattern/pattern.entity.js';
import { Redirect } from '../redirect/redirect.entity.js';
import { ContentRevision } from '../revision/content-revision.entity.js';
import { Settings } from '../settings/settings.entity.js';
import { Tag } from '../tag/tag.entity.js';
import { TemplateLayout } from '../template/template-layout.entity.js';
import { User } from '../user/user.entity.js';

export const entities = [
  User,
  RefreshToken,
  Article,
  ArticleTerm,
  Page,
  ContentRevision,
  Media,
  Category,
  Tag,
  Pattern,
  Settings,
  TemplateLayout,
  Redirect,
];

export {
  Article,
  ArticleTerm,
  Category,
  ContentRevision,
  Media,
  Page,
  Pattern,
  Redirect,
  RefreshToken,
  Settings,
  Tag,
  TemplateLayout,
  User,
};

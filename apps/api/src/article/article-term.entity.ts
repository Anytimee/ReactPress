import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TERM_TYPES, type TermType } from '@reactpress/types';

@Entity('article_terms')
@Index('IDX_article_terms_unique', ['articleId', 'termId', 'termType'], { unique: true })
export class ArticleTerm {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  articleId!: string;

  @Index()
  @Column({ type: 'uuid' })
  termId!: string;

  @Column({ type: 'enum', enum: [...TERM_TYPES] })
  termType!: TermType;
}

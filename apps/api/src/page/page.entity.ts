import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  CONTENT_STATUSES,

  type ContentStatus,
  type SeoMeta,
} from '@reactpress/types';
import { User } from '../user/user.entity.js';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  slug!: string;

  @Column({ type: 'jsonb' })
  content!: any;

  @Column({ type: 'text', default: '' })
  excerpt!: string;

  @Index()
  @Column({ type: 'enum', enum: [...CONTENT_STATUSES], default: 'draft' })
  status!: ContentStatus;

  @Index()
  @Column({ type: 'boolean', default: false })
  isTemplate!: boolean;

  @Column({ type: 'varchar', length: 120, nullable: true })
  templateSlug!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  seo!: SeoMeta | null;

  @Index()
  @Column({ type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => User, (user) => user.pages, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  trashedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

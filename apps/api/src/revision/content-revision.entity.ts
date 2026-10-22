import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CONTENT_TYPES, type BlockDocument, type ContentType } from '@reactpress/types';
import { User } from '../user/user.entity.js';

@Entity('content_revisions')
export class ContentRevision {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'enum', enum: [...CONTENT_TYPES] })
  contentType!: ContentType;

  @Index()
  @Column({ type: 'uuid' })
  contentId!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'jsonb' })
  content!: BlockDocument;

  @Index()
  @Column({ type: 'uuid' })
  authorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

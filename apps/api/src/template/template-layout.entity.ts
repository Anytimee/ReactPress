import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TEMPLATE_SLUGS, type BlockDocument, type TemplateSlug } from '@reactpress/types';

@Entity('template_layouts')
export class TemplateLayout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'enum', enum: [...TEMPLATE_SLUGS] })
  slug!: TemplateSlug;

  @Column({ type: 'varchar', length: 150, default: '' })
  title!: string;

  @Column({ type: 'jsonb' })
  content!: BlockDocument;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

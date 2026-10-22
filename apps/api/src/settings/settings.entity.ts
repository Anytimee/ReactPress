import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  HOMEPAGE_MODES,
  PERMALINK_STRUCTURES,
  type GlobalStyles,
  type HomepageMode,
  type PermalinkStructure,
} from '@reactpress/types';

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  accent: '#111111',
  background: '#fafaf9',
  ink: '#111111',
  muted: '#6b6b6b',
  fontFamily: 'Inter',
  fontSize: 15,
  radius: 8,
  spacing: 4,
  containerWidth: 720,
};

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, default: 'ReactPress' })
  siteName!: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  tagline!: string;

  @Column({ type: 'uuid', nullable: true })
  logoMediaId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  faviconMediaId!: string | null;

  @Column({ type: 'enum', enum: [...PERMALINK_STRUCTURES], default: '/%postname%' })
  permalinkStructure!: PermalinkStructure;

  @Column({ type: 'int', default: 10 })
  postsPerPage!: number;

  @Column({ type: 'enum', enum: [...HOMEPAGE_MODES], default: 'latest' })
  homepageMode!: HomepageMode;

  @Column({ type: 'uuid', nullable: true })
  homepagePageId!: string | null;

  @Column({ type: 'varchar', length: 200, default: '%site% — %title%' })
  seoTitleTemplate!: string;

  @Column({ type: 'text', default: '' })
  seoDefaultDescription!: string;

  @Column({ type: 'uuid', nullable: true })
  seoOgImageMediaId!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  smtpHost!: string | null;

  @Column({ type: 'int', nullable: true })
  smtpPort!: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  smtpUser!: string | null;

  @Column({ type: 'text', nullable: true })
  smtpPassEncrypted!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  smtpFromEmail!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  smtpFromName!: string | null;

  @Column({ type: 'boolean', default: false })
  smtpSecure!: boolean;

  @Column({ type: 'jsonb', default: () => `'{}'::jsonb` })
  globalStyles!: GlobalStyles;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

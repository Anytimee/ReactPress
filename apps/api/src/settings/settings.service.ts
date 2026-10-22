import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { PublicSiteInfo, Settings as SettingsDto } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { decryptValue, encryptValue } from '../common/utils/crypto.js';
import { CacheInvalidationService } from '../cache/cache-invalidation.service.js';
import { Settings as SettingsEntity, DEFAULT_GLOBAL_STYLES } from './settings.entity.js';
import type { UpdateSettingsInput } from './dto/settings.dto.js';
import type { AppConfig } from '../config/configuration.js';

export interface SettingsRecord extends SettingsEntity {
  smtpDecryptedPass: string | null;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity) private readonly repo: Repository<SettingsEntity>,
    private readonly config: ConfigService,
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  private get settingsKey(): string {
    return this.config.getOrThrow<AppConfig['security']>('security').settingsKey;
  }

  /** Settings bersifat singleton — dibuat otomatis bila belum ada. */
  async getSettings(): Promise<SettingsRecord> {
    let entity = await this.repo.findOne({ where: {} });

    if (!entity) {
      entity = this.repo.create({
        siteName: 'ReactPress',
        tagline: 'CMS self-hosted, 100% React',
        permalinkStructure: '/%postname%',
        postsPerPage: 10,
        homepageMode: 'latest',
        seoTitleTemplate: '%site% — %title%',
        seoDefaultDescription: '',
        smtpSecure: false,
        globalStyles: { ...DEFAULT_GLOBAL_STYLES },
      });
      entity = await this.repo.save(entity);
    }

    return {
      ...entity,
      smtpDecryptedPass: entity.smtpPassEncrypted
        ? decryptValue(entity.smtpPassEncrypted, this.settingsKey)
        : null,
    };
  }

  async updateSettings(input: UpdateSettingsInput): Promise<SettingsRecord> {
    const current = await this.getSettings();
    const entity = await this.repo.findOneOrFail({ where: { id: current.id } });

    const {
      smtpPass,
      globalStyles,
      ...scalars
    } = input;

    for (const [key, value] of Object.entries(scalars)) {
      if (value === undefined) continue;
      (entity as unknown as Record<string, unknown>)[key] = value;
    }

    if (smtpPass !== undefined) {
      entity.smtpPassEncrypted = smtpPass ? encryptValue(smtpPass, this.settingsKey) : null;
    }

    if (globalStyles !== undefined) {
      entity.globalStyles = { ...current.globalStyles, ...globalStyles };
    }

    const saved = await this.repo.save(entity);
    await this.cacheInvalidation.invalidateSettings();

    return { ...saved, smtpDecryptedPass: null };
  }

  /** Bentuk yang aman dikirim ke klien (tanpa password SMTP). */
  toDto(record: SettingsRecord): SettingsDto {
    return {
      id: record.id,
      siteName: record.siteName,
      tagline: record.tagline,
      logoMediaId: record.logoMediaId,
      faviconMediaId: record.faviconMediaId,
      permalinkStructure: record.permalinkStructure,
      postsPerPage: record.postsPerPage,
      homepageMode: record.homepageMode,
      homepagePageId: record.homepagePageId,
      seoTitleTemplate: record.seoTitleTemplate,
      seoDefaultDescription: record.seoDefaultDescription,
      seoOgImageMediaId: record.seoOgImageMediaId,
      smtpHost: record.smtpHost,
      smtpPort: record.smtpPort,
      smtpUser: record.smtpUser,
      smtpFromEmail: record.smtpFromEmail,
      smtpFromName: record.smtpFromName,
      smtpSecure: record.smtpSecure,
      smtpPassSet: Boolean(record.smtpPassEncrypted),
      globalStyles: record.globalStyles ?? { ...DEFAULT_GLOBAL_STYLES },
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async getPublicSite(mediaUrl: (mediaId: string | null) => Promise<string | null>): Promise<PublicSiteInfo> {
    const record = await this.getSettings();
    const [logoUrl, faviconUrl, ogImageUrl] = await Promise.all([
      mediaUrl(record.logoMediaId),
      mediaUrl(record.faviconMediaId),
      mediaUrl(record.seoOgImageMediaId),
    ]);

    return {
      siteName: record.siteName,
      tagline: record.tagline,
      logoUrl,
      faviconUrl,
      permalinkStructure: record.permalinkStructure,
      postsPerPage: record.postsPerPage,
      homepageMode: record.homepageMode,
      homepagePageId: record.homepagePageId,
      seoTitleTemplate: record.seoTitleTemplate,
      seoDefaultDescription: record.seoDefaultDescription,
      ogImageUrl,
      globalStyles: record.globalStyles ?? { ...DEFAULT_GLOBAL_STYLES },
    };
  }

  async requireSettings(): Promise<SettingsRecord> {
    const settings = await this.getSettings();
    if (!settings) {
      throw apiError('Settings tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return settings;
  }
}

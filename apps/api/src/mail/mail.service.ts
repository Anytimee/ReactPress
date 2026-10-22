import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../config/configuration.js';
import { SettingsService } from '../settings/settings.service.js';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string | null;
  pass: string | null;
  fromEmail: string;
  fromName: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private transporterKey = '';

  constructor(
    private readonly config: ConfigService,
    private readonly settings: SettingsService,
  ) {}

  async resolveConfig(): Promise<MailConfig | null> {
    const settings = await this.settings.getSettings();
    const env = this.config.getOrThrow<AppConfig['mail']>('mail');

    const host = settings.smtpHost ?? env.host;
    const port = settings.smtpPort ?? env.port;

    if (!host) {
      return null;
    }

    return {
      host,
      port,
      secure: settings.smtpSecure ?? env.secure,
      user: settings.smtpUser ?? env.user,
      pass: settings.smtpDecryptedPass ?? env.pass,
      fromEmail: settings.smtpFromEmail ?? env.fromEmail,
      fromName: settings.smtpFromName ?? env.fromName,
    };
  }

  private async getTransporter(): Promise<Transporter | null> {
    const mail = await this.resolveConfig();
    if (!mail) return null;

    const key = `${mail.host}:${mail.port}:${mail.secure}:${mail.user ?? ''}`;
    if (this.transporter && this.transporterKey === key) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.pass ?? '' } : undefined,
    });
    this.transporterKey = key;
    return this.transporter;
  }

  async send(message: MailMessage): Promise<boolean> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      this.logger.warn('SMTP belum dikonfigurasi — email tidak dikirim');
      return false;
    }

    const mail = await this.resolveConfig();
    await transporter.sendMail({
      from: {
        name: mail?.fromName ?? 'ReactPress',
        address: mail?.fromEmail ?? 'no-reply@localhost',
      },
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return true;
  }

  /** Kirim email percobaan — dipakai tombol "Kirim email tes" di Settings > SMTP. */
  async sendTest(to: string): Promise<{ sent: boolean; error?: string }> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      return { sent: false, error: 'SMTP belum dikonfigurasi' };
    }

    try {
      const mail = await this.resolveConfig();
      await transporter.sendMail({
        from: {
          name: mail?.fromName ?? 'ReactPress',
          address: mail?.fromEmail ?? 'no-reply@localhost',
        },
        to,
        subject: 'ReactPress — email percobaan',
        text: 'Ini email percobaan dari ReactPress. Jika Anda menerimanya, konfigurasi SMTP sudah benar.',
        html: '<p>Ini email percobaan dari <strong>ReactPress</strong>.</p><p>Jika Anda menerimanya, konfigurasi SMTP sudah benar.</p>',
      });
      return { sent: true };
    } catch (error) {
      return { sent: false, error: (error as Error).message };
    }
  }
}

import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { MailService } from '../mail/mail.service.js';
import {
  smtpTestSchema,
  updateSettingsSchema,
  type UpdateSettingsInput,
} from './dto/settings.dto.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
@Roles('admin', 'super_admin')
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly mail: MailService,
  ) {}

  @Get()
  async get() {
    const record = await this.settings.getSettings();
    return this.settings.toDto(record);
  }

  @Patch()
  async update(@Body(new ZodValidationPipe(updateSettingsSchema)) body: UpdateSettingsInput) {
    const record = await this.settings.updateSettings(body);
    return this.settings.toDto(record);
  }

  @Post('smtp-test')
  async smtpTest(@Body(new ZodValidationPipe(smtpTestSchema)) body: { to: string }) {
    const result = await this.mail.sendTest(body.to);
    return result;
  }
}

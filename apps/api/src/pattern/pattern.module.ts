import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pattern } from './pattern.entity.js';
import { PatternController } from './pattern.controller.js';
import { PatternService } from './pattern.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pattern])],
  controllers: [PatternController],
  providers: [PatternService],
  exports: [PatternService],
})
export class PatternModule {}

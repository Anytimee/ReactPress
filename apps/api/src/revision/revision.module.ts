import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentRevision } from './content-revision.entity.js';
import { RevisionService } from './revision.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ContentRevision])],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}

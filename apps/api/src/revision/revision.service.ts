import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ContentRevision, ContentType, RevisionDiff, User } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { ContentRevision as RevisionEntity } from './content-revision.entity.js';

function countBlocks(content: RevisionEntity['content']): number {
  return Array.isArray(content?.blocks) ? content.blocks.length : 0;
}

function collectTypes(content: RevisionEntity['content']): string[] {
  const types = new Set<string>();
  const walk = (nodes: RevisionEntity['content']['blocks']): void => {
    for (const node of nodes) {
      types.add(node.type);
      if (node.innerBlocks?.length) walk(node.innerBlocks);
    }
  };
  if (content?.blocks) walk(content.blocks);
  return [...types].sort();
}

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(RevisionEntity) private readonly revisions: Repository<RevisionEntity>,
  ) {}

  async snapshot(params: {
    contentType: ContentType;
    contentId: string;
    title: string;
    content: RevisionEntity['content'];
    authorId: string;
  }): Promise<RevisionEntity> {
    const revision = this.revisions.create({
      contentType: params.contentType,
      contentId: params.contentId,
      title: params.title,
      content: params.content,
      authorId: params.authorId,
    });
    return this.revisions.save(revision);
  }

  async list(contentType: ContentType, contentId: string): Promise<ContentRevision[]> {
    const rows = await this.revisions.find({
      where: { contentType, contentId },
      order: { createdAt: 'DESC' },
      take: 50,
      relations: { author: true },
    });

    return rows.map((row) => this.toDto(row));
  }
  async findOne(id: string): Promise<RevisionEntity> {
    const revision = await this.revisions.findOne({
      where: { id },
      relations: { author: true },
    });
    if (!revision) {
      throw apiError('Revisi tidak ditemukan', 404);
    }
    return revision;
  }

  toDto(row: RevisionEntity): ContentRevision {
    return {
      id: row.id,
      contentType: row.contentType,
      contentId: row.contentId,
      title: row.title,
      content: row.content,
      authorId: row.authorId,
      author: row.author
        ? {
            id: row.author.id,
            email: row.author.email,
            name: row.author.name,
            role: row.author.role,
            createdAt: row.author.createdAt.toISOString(),
            updatedAt: row.author.updatedAt.toISOString(),
          }
        : undefined,
      createdAt: row.createdAt.toISOString(),
    };
  }

  /** Diff sederhana: judul berubah? jumlah blok berubah? tipe blok apa yang berubah? */
  diff(
    revision: RevisionEntity,
    current: { title: string; content: RevisionEntity['content'] },
  ): RevisionDiff {
    const before = collectTypes(revision.content);
    const after = collectTypes(current.content);
    const changedBlockTypes = before.filter((type) => !after.includes(type));

    return {
      changed: revision.title !== current.title || countBlocks(revision.content) !== countBlocks(current.content),
      titleChanged: revision.title !== current.title,
      titleBefore: revision.title,
      titleAfter: current.title,
      contentChanged: countBlocks(revision.content) !== countBlocks(current.content),
      blockCountBefore: countBlocks(revision.content),
      blockCountAfter: countBlocks(current.content),
      changedBlockTypes,
    };
  }

  async toUser(entity: User): Promise<User> {
    return entity;
  }
}

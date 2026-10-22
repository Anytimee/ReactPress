import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792597134667 implements MigrationInterface {
    name = 'InitialSchema1792597134667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published', 'scheduled', 'trash')`);
        await queryRunner.query(`CREATE TABLE "pages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(300) NOT NULL, "slug" character varying(200) NOT NULL, "content" jsonb NOT NULL, "excerpt" text NOT NULL DEFAULT '', "status" "public"."pages_status_enum" NOT NULL DEFAULT 'draft', "isTemplate" boolean NOT NULL DEFAULT false, "templateSlug" character varying(120), "seo" jsonb, "authorId" uuid NOT NULL, "scheduledAt" TIMESTAMP WITH TIME ZONE, "publishedAt" TIMESTAMP WITH TIME ZONE, "trashedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe66ca6a86dc94233e5d778953" ON "pages" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_aba05a4338b83bab7a04e0865f" ON "pages" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_e999a41233da59f46f6d13fcfe" ON "pages" ("isTemplate") `);
        await queryRunner.query(`CREATE INDEX "IDX_d2e423882ed3b21d37f9cb1ca7" ON "pages" ("authorId") `);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying(128) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "userAgent" character varying(512), "ipAddress" character varying(64), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c25bc63d248ca90e8dcc1d92d0" ON "refresh_tokens" ("tokenHash") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'editor', 'author')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "name" character varying(120) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'author', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."articles_status_enum" AS ENUM('draft', 'published', 'scheduled', 'trash')`);
        await queryRunner.query(`CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(300) NOT NULL, "slug" character varying(200) NOT NULL, "content" jsonb NOT NULL, "excerpt" text NOT NULL DEFAULT '', "status" "public"."articles_status_enum" NOT NULL DEFAULT 'draft', "seo" jsonb, "authorId" uuid NOT NULL, "templateSlug" character varying(120), "scheduledAt" TIMESTAMP WITH TIME ZONE, "publishedAt" TIMESTAMP WITH TIME ZONE, "trashedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1123ff6815c5b8fec0ba9fec37" ON "articles" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f0a73d2e1cc0db5557ae257d1" ON "articles" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_65d9ccc1b02f4d904e90bd76a3" ON "articles" ("authorId") `);
        await queryRunner.query(`CREATE TYPE "public"."article_terms_termtype_enum" AS ENUM('category', 'tag')`);
        await queryRunner.query(`CREATE TABLE "article_terms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "articleId" uuid NOT NULL, "termId" uuid NOT NULL, "termType" "public"."article_terms_termtype_enum" NOT NULL, CONSTRAINT "PK_96ac1ad9a8c3076d1a234f07f8f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7b565dca2c20fd580d1da2962c" ON "article_terms" ("articleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_07fc259c9c910c5be6edfe5270" ON "article_terms" ("termId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_article_terms_unique" ON "article_terms" ("articleId", "termId", "termType") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "slug" character varying(150) NOT NULL, "description" text, "parentId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_9a6f051e66982b5f0318981bca" ON "categories" ("parentId") `);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying(255) NOT NULL, "originalName" character varying(255) NOT NULL, "mime" character varying(120) NOT NULL, "size" bigint NOT NULL DEFAULT '0', "width" integer, "height" integer, "url" character varying(500) NOT NULL, "thumbnailUrl" character varying(500), "alt" character varying(500), "caption" text, "title" character varying(300), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patterns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "slug" character varying(180) NOT NULL, "category" character varying(100), "content" jsonb NOT NULL, "thumbnailUrl" character varying(500), "authorId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_afb8e3087247ebfc0f30a682a9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bb01ee5493fe3ab4793b9d494f" ON "patterns" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_797819676bdab35c9900bd8101" ON "patterns" ("authorId") `);
        await queryRunner.query(`CREATE TABLE "redirects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromPath" character varying(300) NOT NULL, "toPath" character varying(300) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d81f0797728eb0eb92ae3c6eedd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b18ca9ae189aa541ef67a0c919" ON "redirects" ("fromPath") `);
        await queryRunner.query(`CREATE TYPE "public"."content_revisions_contenttype_enum" AS ENUM('article', 'page')`);
        await queryRunner.query(`CREATE TABLE "content_revisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contentType" "public"."content_revisions_contenttype_enum" NOT NULL, "contentId" uuid NOT NULL, "title" character varying(300) NOT NULL, "content" jsonb NOT NULL, "authorId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_750b063aa2aad282d6a5fd2db2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3adae17e1ef4d817422555b211" ON "content_revisions" ("contentType") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0b8d26675407daf3229010320" ON "content_revisions" ("contentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d29f005599ca75f794ea86c7c7" ON "content_revisions" ("authorId") `);
        await queryRunner.query(`CREATE TYPE "public"."settings_permalinkstructure_enum" AS ENUM('/%postname%', '/blog/%postname%', '/%year%/%monthnum%/%postname%')`);
        await queryRunner.query(`CREATE TYPE "public"."settings_homepagemode_enum" AS ENUM('latest', 'static')`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "siteName" character varying(150) NOT NULL DEFAULT 'ReactPress', "tagline" character varying(300) NOT NULL DEFAULT '', "logoMediaId" uuid, "faviconMediaId" uuid, "permalinkStructure" "public"."settings_permalinkstructure_enum" NOT NULL DEFAULT '/%postname%', "postsPerPage" integer NOT NULL DEFAULT '10', "homepageMode" "public"."settings_homepagemode_enum" NOT NULL DEFAULT 'latest', "homepagePageId" uuid, "seoTitleTemplate" character varying(200) NOT NULL DEFAULT '%site% — %title%', "seoDefaultDescription" text NOT NULL DEFAULT '', "seoOgImageMediaId" uuid, "smtpHost" character varying(200), "smtpPort" integer, "smtpUser" character varying(200), "smtpPassEncrypted" text, "smtpFromEmail" character varying(200), "smtpFromName" character varying(200), "smtpSecure" boolean NOT NULL DEFAULT false, "globalStyles" jsonb NOT NULL DEFAULT '{}'::jsonb, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "slug" character varying(150) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b3aa10c29ea4e61a830362bd25" ON "tags" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."template_layouts_slug_enum" AS ENUM('header', 'footer', '404')`);
        await queryRunner.query(`CREATE TABLE "template_layouts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" "public"."template_layouts_slug_enum" NOT NULL, "title" character varying(150) NOT NULL DEFAULT '', "content" jsonb NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7a6ba914dfee4914e903e57ef7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a92bac81c059c711bd5dde4aa9" ON "template_layouts" ("slug") `);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_d2e423882ed3b21d37f9cb1ca7f" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patterns" ADD CONSTRAINT "FK_797819676bdab35c9900bd81014" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "content_revisions" ADD CONSTRAINT "FK_d29f005599ca75f794ea86c7c72" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_revisions" DROP CONSTRAINT "FK_d29f005599ca75f794ea86c7c72"`);
        await queryRunner.query(`ALTER TABLE "patterns" DROP CONSTRAINT "FK_797819676bdab35c9900bd81014"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_d2e423882ed3b21d37f9cb1ca7f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a92bac81c059c711bd5dde4aa9"`);
        await queryRunner.query(`DROP TABLE "template_layouts"`);
        await queryRunner.query(`DROP TYPE "public"."template_layouts_slug_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3aa10c29ea4e61a830362bd25"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TYPE "public"."settings_homepagemode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."settings_permalinkstructure_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d29f005599ca75f794ea86c7c7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0b8d26675407daf3229010320"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3adae17e1ef4d817422555b211"`);
        await queryRunner.query(`DROP TABLE "content_revisions"`);
        await queryRunner.query(`DROP TYPE "public"."content_revisions_contenttype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b18ca9ae189aa541ef67a0c919"`);
        await queryRunner.query(`DROP TABLE "redirects"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_797819676bdab35c9900bd8101"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb01ee5493fe3ab4793b9d494f"`);
        await queryRunner.query(`DROP TABLE "patterns"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a6f051e66982b5f0318981bca"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_article_terms_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_07fc259c9c910c5be6edfe5270"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7b565dca2c20fd580d1da2962c"`);
        await queryRunner.query(`DROP TABLE "article_terms"`);
        await queryRunner.query(`DROP TYPE "public"."article_terms_termtype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65d9ccc1b02f4d904e90bd76a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f0a73d2e1cc0db5557ae257d1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1123ff6815c5b8fec0ba9fec37"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TYPE "public"."articles_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c25bc63d248ca90e8dcc1d92d0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2e423882ed3b21d37f9cb1ca7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e999a41233da59f46f6d13fcfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aba05a4338b83bab7a04e0865f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe66ca6a86dc94233e5d778953"`);
        await queryRunner.query(`DROP TABLE "pages"`);
        await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`);
    }

}

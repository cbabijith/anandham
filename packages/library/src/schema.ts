import { pgTable, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const krithis = pgTable(
  'library_krithis',
  {
    id: text('id').primaryKey(),
    sourceId: integer('source_id').unique(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    transliteration: text('transliteration').notNull(),
    category: text('category').notNull(),
    categoryName: text('category_name').notNull(),
    categoryMalayalam: text('category_malayalam').notNull(),
    body: text('body').notNull(),
    sourceUrl: text('source_url').notNull().default(''),
    sourceHash: text('source_hash').notNull().default(''),
    sourceBody: text('source_body').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    revision: integer('revision').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('library_status_category_idx').on(t.status, t.category)],
);

export const admins = pgTable('library_admins', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const sessions = pgTable('library_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  adminId: text('admin_id')
    .notNull()
    .references(() => admins.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
export const loginLimits = pgTable('library_login_limits', {
  key: text('key').primaryKey(),
  attempts: integer('attempts').notNull(),
  resetsAt: timestamp('resets_at', { withTimezone: true }).notNull(),
});
export const auditLog = pgTable('library_audit_log', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').references(() => admins.id),
  krithiId: text('krithi_id').references(() => krithis.id),
  action: text('action').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export const imports = pgTable('library_imports', {
  id: text('id').primaryKey(),
  sourceUrl: text('source_url').notNull(),
  sourceCount: integer('source_count').notNull(),
  insertedCount: integer('inserted_count').notNull(),
  manifest: jsonb('manifest').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export type Krithi = typeof krithis.$inferSelect;
export type KrithiSummary = Omit<Krithi, 'body' | 'sourceBody'> & {
  excerpt: string;
  characters: number;
};

export type DharmamPassage = { verses: string; explanation: string };
export const dharmamChapters = pgTable(
  'library_dharmam_chapters',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    transliteration: text('transliteration').notNull(),
    passages: jsonb('passages').$type<DharmamPassage[]>().notNull(),
    sourcePassages: jsonb('source_passages').$type<DharmamPassage[]>().notNull().default([]),
    sourceLabel: text('source_label').notNull().default('Library editorial contribution'),
    editorialNote: text('editorial_note').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    status: text('status', { enum: ['draft', 'published', 'archived'] })
      .notNull()
      .default('draft'),
    revision: integer('revision').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('library_dharmam_status_order_idx').on(t.status, t.sortOrder)],
);
export const dharmamAuditLog = pgTable('library_dharmam_audit_log', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').references(() => admins.id),
  chapterId: text('chapter_id')
    .notNull()
    .references(() => dharmamChapters.id),
  action: text('action').notNull(),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
export type DharmamChapter = typeof dharmamChapters.$inferSelect;

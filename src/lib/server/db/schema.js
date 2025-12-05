import { mysqlTable, serial, int, varchar, text, timestamp, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tabulka uživatelů
export const users = mysqlTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// Tabulka nahraných PDF dokumentů
export const documents = mysqlTable('documents', {
	id: serial('id').primaryKey(),
	userId: int('user_id').notNull(),
	fileName: varchar('file_name', { length: 255 }).notNull(),
	originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
	filePath: varchar('file_path', { length: 500 }).notNull(), // Cesta k souboru na serveru
	fileSize: int('file_size'), // Velikost v bytech
	mimeType: varchar('mime_type', { length: 100 }).default('application/pdf'),
	status: varchar('status', { length: 50 }).default('uploaded'), // uploaded, processing, processed, error
	extractedText: text('extracted_text'), // Extrahovaný text z PDF
	pageCount: int('page_count'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// Tabulka generovaných zápisků
export const notes = mysqlTable('notes', {
	id: serial('id').primaryKey(),
	documentId: int('document_id').notNull(),
	userId: int('user_id').notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(), // Generovaný obsah zápisku
	summary: text('summary'), // Stručný souhrn
	keyPoints: json('key_points'), // JSON pole s klíčovými body
	pageRange: varchar('page_range', { length: 50}), // Např. "1-10"
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// Tabulka chat sessionů (konverzace s AI)
export const chatSessions = mysqlTable('chat_sessions', {
	id: serial('id').primaryKey(),
	userId: int('user_id').notNull(),
	documentId: int('document_id'), // Volitelné - pokud se chat týká konkrétního dokumentu
	title: varchar('title', { length: 255 }), // Název konverzace (může být generován z první zprávy)
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// Tabulka zpráv v chatu
export const chatMessages = mysqlTable('chat_messages', {
	id: serial('id').primaryKey(),
	sessionId: int('session_id').notNull(),
	role: varchar('role', { length: 20 }).notNull(), // 'user' nebo 'assistant'
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Definice vztahů (relations)
export const usersRelations = relations(users, ({ many }) => ({
	documents: many(documents),
	notes: many(notes),
	chatSessions: many(chatSessions)
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
	notes: many(notes),
	chatSessions: many(chatSessions)
}));

export const notesRelations = relations(notes, ({ one }) => ({
	document: one(documents, {
		fields: [notes.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [notes.userId],
		references: [users.id]
	})
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
	user: one(users, {
		fields: [chatSessions.userId],
		references: [users.id]
	}),
	document: one(documents, {
		fields: [chatSessions.documentId],
		references: [documents.id]
	}),
	messages: many(chatMessages)
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
	session: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id]
	})
}));

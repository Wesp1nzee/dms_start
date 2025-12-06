/**
 * Mock API with simulated delay and IndexedDB persistence
 */

import type {
  Document,
  Template,
  DocumentVersion,
  Comment,
  APIResponse,
  Settings,
  ExpertiseType,
  DocumentType,
} from '../types';
import { StorageAdapter } from '../storage/StorageAdapter';

const API_DELAY = 400; // ms

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Extract {{field}} from template
const extractFields = (content: string): string[] => {
  const regex = /\{\{([^}]+)\}\}/g;
  const fields: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    fields.push(match[1].trim());
  }
  return [...new Set(fields)];
};

// Replace {{field}} with values
const replaceFields = (content: string, fields: Record<string, string>): string => {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, field) => {
    const trimmed = field.trim();
    return fields[trimmed] || match;
  });
};

// Generate UUID (fallback since crypto.randomUUID might not be available)
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const mockApi = {
  // Documents
  async listDocuments(
    filters?: {
      status?: string;
      type?: string;
      search?: string;
      from?: Date;
      to?: Date;
    }
  ): Promise<APIResponse<Document[]>> {
    await delay(API_DELAY);
    try {
      let documents = await StorageAdapter.getAllDocuments();

      // Apply filters
      if (filters) {
        if (filters.status) {
          documents = documents.filter((d) => d.status === filters.status);
        }
        if (filters.type) {
          documents = documents.filter((d) => d.type === filters.type);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          documents = documents.filter(
            (d) =>
              d.title.toLowerCase().includes(searchLower) ||
              d.case_number?.toLowerCase().includes(searchLower) ||
              d.contract_number?.toLowerCase().includes(searchLower) ||
              d.counterparty?.toLowerCase().includes(searchLower) ||
              d.ocrText?.toLowerCase().includes(searchLower) ||
              d.tags.some((t) => t.toLowerCase().includes(searchLower))
          );
        }
        if (filters.from) {
          documents = documents.filter((d) => new Date(d.createdAt) >= filters.from!);
        }
        if (filters.to) {
          documents = documents.filter((d) => new Date(d.createdAt) <= filters.to!);
        }
      }

      return {
        success: true,
        data: documents.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch documents',
      };
    }
  },

  async getDocument(id: string): Promise<APIResponse<Document>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(id);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error: 'Failed to fetch document' };
    }
  },

  async createDocument(
    title: string,
    type: DocumentType,
    data?: Record<string, unknown>
  ): Promise<APIResponse<Document>> {
    await delay(API_DELAY);
    try {
      const now = new Date();
      const document: Document = {
        id: generateId(),
        title,
        type,
        case_number: (data?.case_number as string) || undefined,
        contract_number: (data?.contract_number as string) || undefined,
        counterparty: (data?.counterparty as string) || undefined,
        amount: (data?.amount as number) || undefined,
        expertise_type: (data?.expertise_type as ExpertiseType) || undefined,
        createdAt: now,
        updatedAt: now,
        status: 'draft',
        responsible: (data?.responsible as string) || undefined,
        tags: (data?.tags as string[]) || [],
        versions: [],
        comments: [],
      };

      await StorageAdapter.addDocument(document);
      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: 'Failed to create document' };
    }
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<APIResponse<Document>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(id);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }

      const updated: Document = {
        ...doc,
        ...updates,
        id: doc.id,
        createdAt: doc.createdAt,
        updatedAt: new Date(),
        versions: doc.versions,
        comments: doc.comments,
      };

      await StorageAdapter.updateDocument(updated);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: 'Failed to update document' };
    }
  },

  async deleteDocument(id: string): Promise<APIResponse<void>> {
    await delay(API_DELAY);
    try {
      await StorageAdapter.deleteDocument(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete document' };
    }
  },

  // Versions
  async createVersion(
    documentId: string,
    content: string,
    note: string,
    author?: string
  ): Promise<APIResponse<DocumentVersion>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(documentId);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }

      const versionNumber = (doc.versions?.length || 0) + 1;
      const version: DocumentVersion = {
        id: generateId(),
        versionNumber,
        createdAt: new Date(),
        content,
        snapshot: content.substring(0, 500),
        note,
        author,
      };

      doc.versions.push(version);
      doc.currentContent = content;
      doc.updatedAt = new Date();

      await StorageAdapter.updateDocument(doc);
      return { success: true, data: version };
    } catch (error) {
      return { success: false, error: 'Failed to create version' };
    }
  },

  async revertVersion(documentId: string, versionId: string): Promise<APIResponse<Document>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(documentId);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }

      const version = doc.versions.find((v) => v.id === versionId);
      if (!version) {
        return { success: false, error: 'Version not found' };
      }

      // Create new version from old content
      const newVersion: DocumentVersion = {
        id: generateId(),
        versionNumber: (doc.versions?.length || 0) + 1,
        createdAt: new Date(),
        content: version.content,
        snapshot: version.content.substring(0, 500),
        note: `Reverted to version ${version.versionNumber}`,
      };

      doc.versions.push(newVersion);
      doc.currentContent = version.content;
      doc.updatedAt = new Date();

      await StorageAdapter.updateDocument(doc);
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error: 'Failed to revert version' };
    }
  },

  async getVersions(documentId: string): Promise<APIResponse<DocumentVersion[]>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(documentId);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }
      return { success: true, data: doc.versions || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch versions' };
    }
  },

  // Comments
  async addComment(
    documentId: string,
    text: string,
    author: string,
    versionId?: string
  ): Promise<APIResponse<Comment>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(documentId);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }

      const comment: Comment = {
        id: generateId(),
        text,
        author,
        createdAt: new Date(),
        versionId,
      };

      if (!doc.comments) {
        doc.comments = [];
      }
      doc.comments.push(comment);

      await StorageAdapter.updateDocument(doc);
      return { success: true, data: comment };
    } catch (error) {
      return { success: false, error: 'Failed to add comment' };
    }
  },

  async getComments(documentId: string): Promise<APIResponse<Comment[]>> {
    await delay(API_DELAY);
    try {
      const doc = await StorageAdapter.getDocument(documentId);
      if (!doc) {
        return { success: false, error: 'Document not found' };
      }
      return { success: true, data: doc.comments || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch comments' };
    }
  },

  // Templates
  async listTemplates(): Promise<APIResponse<Template[]>> {
    await delay(API_DELAY);
    try {
      const templates = await StorageAdapter.getAllTemplates();
      return {
        success: true,
        data: templates.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch templates' };
    }
  },

  async getTemplate(id: string): Promise<APIResponse<Template>> {
    await delay(API_DELAY);
    try {
      const template = await StorageAdapter.getTemplate(id);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }
      return { success: true, data: template };
    } catch (error) {
      return { success: false, error: 'Failed to fetch template' };
    }
  },

  async createTemplate(
    name: string,
    description: string,
    content: string
  ): Promise<APIResponse<Template>> {
    await delay(API_DELAY);
    try {
      const now = new Date();
      const template: Template = {
        id: generateId(),
        name,
        description,
        content,
        createdAt: now,
        updatedAt: now,
        fields: extractFields(content),
      };

      await StorageAdapter.addTemplate(template);
      return { success: true, data: template };
    } catch (error) {
      return { success: false, error: 'Failed to create template' };
    }
  },

  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<APIResponse<Template>> {
    await delay(API_DELAY);
    try {
      const template = await StorageAdapter.getTemplate(id);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const updated: Template = {
        ...template,
        ...updates,
        id: template.id,
        createdAt: template.createdAt,
        updatedAt: new Date(),
        fields: updates.content ? extractFields(updates.content) : template.fields,
      };

      await StorageAdapter.updateTemplate(updated);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: 'Failed to update template' };
    }
  },

  async deleteTemplate(id: string): Promise<APIResponse<void>> {
    await delay(API_DELAY);
    try {
      await StorageAdapter.deleteTemplate(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete template' };
    }
  },

  // Generate document from template
  async generateFromTemplate(
    templateId: string,
    fields: Record<string, string>,
    documentData: {
      title: string;
      type: DocumentType;
      case_number?: string;
      contract_number?: string;
      counterparty?: string;
    }
  ): Promise<APIResponse<Document>> {
    await delay(API_DELAY);
    try {
      const template = await StorageAdapter.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const content = replaceFields(template.content, fields);

      // Create document
      const now = new Date();
      const document: Document = {
        id: generateId(),
        title: documentData.title,
        type: documentData.type,
        case_number: documentData.case_number,
        contract_number: documentData.contract_number,
        counterparty: documentData.counterparty,
        createdAt: now,
        updatedAt: now,
        status: 'active',
        tags: [],
        versions: [
          {
            id: generateId(),
            versionNumber: 1,
            createdAt: now,
            content,
            snapshot: content.substring(0, 500),
            note: 'Initial version from template',
          },
        ],
        comments: [],
        currentContent: content,
      };

      await StorageAdapter.addDocument(document);
      return { success: true, data: document };
    } catch (error) {
      return { success: false, error: 'Failed to generate document' };
    }
  },

  // Settings
  async getSettings(): Promise<APIResponse<Settings>> {
    await delay(API_DELAY);
    try {
      const settings = await StorageAdapter.getSettings();
      if (!settings) {
        return { success: false, error: 'Settings not found' };
      }
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: 'Failed to fetch settings' };
    }
  },

  async updateSettings(settings: Partial<Settings>): Promise<APIResponse<Settings>> {
    await delay(API_DELAY);
    try {
      const current = (await StorageAdapter.getSettings()) || {
        counterparties: [],
        expertiseTypes: [],
        users: [],
        enableOCR: true,
        useTesseract: false,
      };

      const updated = { ...current, ...settings };
      await StorageAdapter.updateSettings(updated);
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: 'Failed to update settings' };
    }
  },

  // OCR (Mock)
  async recognizeText(file: File): Promise<APIResponse<string>> {
    await delay(1000 + Math.random() * 1000); // Simulate OCR processing
    try {
      // Mock OCR result
      const mockOCR = `Распознанный текст из документа "${file.name}".\n\nЭто имитация результата OCR.\nВ реальном приложении здесь будет распознанный текст из PDF/изображения.\n\nСистема готова к подключению Tesseract.js для реального распознавания.`;

      return { success: true, data: mockOCR };
    } catch (error) {
      return { success: false, error: 'Failed to recognize text' };
    }
  },

  // Export/Import
  async exportDatabase() {
    await delay(API_DELAY);
    try {
      const data = await StorageAdapter.exportDatabase();
      return {
        success: true,
        data: {
          documents: data.documents,
          templates: data.templates,
          settings: data.settings,
          exportedAt: new Date(),
          version: '1.0',
        },
      };
    } catch (error) {
      return { success: false, error: 'Failed to export database' };
    }
  },

  async importDatabase(data: unknown): Promise<APIResponse<void>> {
    await delay(API_DELAY);
    try {
      await StorageAdapter.importDatabase(data as any);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to import database' };
    }
  },
};

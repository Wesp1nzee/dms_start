/**
 * IndexedDB storage adapter
 */

import type {
  Document,
  Template,
  Settings,
  FileUpload,
} from '../types';

const DB_NAME = 'DocumentManagementDB';
const DB_VERSION = 1;

const STORES = {
  DOCUMENTS: 'documents',
  TEMPLATES: 'templates',
  SETTINGS: 'settings',
  FILES: 'files',
};

let db: IDBDatabase;

export const StorageAdapter = {
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        if (!database.objectStoreNames.contains(STORES.DOCUMENTS)) {
          database.createObjectStore(STORES.DOCUMENTS, { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains(STORES.TEMPLATES)) {
          database.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
          database.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
        }

        if (!database.objectStoreNames.contains(STORES.FILES)) {
          database.createObjectStore(STORES.FILES, { keyPath: 'id' });
        }
      };
    });
  },

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DOCUMENTS, 'readonly');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllDocuments(): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DOCUMENTS, 'readonly');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async addDocument(document: Document): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.add(document);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async updateDocument(document: Document): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.put(document);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async deleteDocument(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.DOCUMENTS, 'readwrite');
      const store = transaction.objectStore(STORES.DOCUMENTS);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // Templates
  async getTemplate(id: string): Promise<Template | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TEMPLATES, 'readonly');
      const store = transaction.objectStore(STORES.TEMPLATES);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllTemplates(): Promise<Template[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TEMPLATES, 'readonly');
      const store = transaction.objectStore(STORES.TEMPLATES);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async addTemplate(template: Template): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TEMPLATES, 'readwrite');
      const store = transaction.objectStore(STORES.TEMPLATES);
      const request = store.add(template);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async updateTemplate(template: Template): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TEMPLATES, 'readwrite');
      const store = transaction.objectStore(STORES.TEMPLATES);
      const request = store.put(template);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async deleteTemplate(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.TEMPLATES, 'readwrite');
      const store = transaction.objectStore(STORES.TEMPLATES);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // Settings
  async getSettings(): Promise<Settings | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get('settings');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async updateSettings(settings: Settings): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ id: 'settings', ...settings });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // Files
  async saveFile(file: FileUpload): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.FILES, 'readwrite');
      const store = transaction.objectStore(STORES.FILES);
      const request = store.put(file);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getFile(id: string): Promise<FileUpload | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.FILES, 'readonly');
      const store = transaction.objectStore(STORES.FILES);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async deleteFile(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.FILES, 'readwrite');
      const store = transaction.objectStore(STORES.FILES);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  // Export/Import
  async exportDatabase(): Promise<{
    documents: Document[];
    templates: Template[];
    settings: Settings | undefined;
  }> {
    const [documents, templates, settings] = await Promise.all([
      this.getAllDocuments(),
      this.getAllTemplates(),
      this.getSettings(),
    ]);

    return {
      documents: documents.map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        updatedAt: new Date(d.updatedAt),
        versions: d.versions.map((v) => ({
          ...v,
          createdAt: new Date(v.createdAt),
        })),
      })),
      templates: templates.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
      settings,
    };
  },

  async importDatabase(data: {
    documents: Document[];
    templates: Template[];
    settings?: Settings;
  }): Promise<void> {
    // Clear existing data
    const transaction = db.transaction(
      [STORES.DOCUMENTS, STORES.TEMPLATES, STORES.SETTINGS],
      'readwrite'
    );

    const docStore = transaction.objectStore(STORES.DOCUMENTS);
    const tplStore = transaction.objectStore(STORES.TEMPLATES);
    const setStore = transaction.objectStore(STORES.SETTINGS);

    docStore.clear();
    tplStore.clear();
    setStore.clear();

    // Add imported data
    for (const doc of data.documents) {
      docStore.put(doc);
    }

    for (const tpl of data.templates) {
      tplStore.put(tpl);
    }

    if (data.settings) {
      setStore.put({ id: 'settings', ...data.settings });
    }

    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  },
};


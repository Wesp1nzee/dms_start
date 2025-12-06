/**
 * Core domain types for document management system
 */

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  createdAt: Date;
  content: string;
  snapshot?: string;
  note: string;
  author?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  versionId?: string;
}

export type DocumentType = 'contract' | 'case' | 'agreement' | 'claim' | 'resolution' | 'other';
export type DocumentStatus = 'draft' | 'active' | 'archived' | 'completed';
export type ExpertiseType = 'civil' | 'criminal' | 'labor' | 'administrative' | 'corporate' | 'ip';

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  case_number?: string;
  contract_number?: string;
  counterparty?: string;
  amount?: number;
  expertise_type?: ExpertiseType;
  createdAt: Date;
  updatedAt: Date;
  status: DocumentStatus;
  responsible?: string;
  tags: string[];
  versions: DocumentVersion[];
  comments: Comment[];
  ocrText?: string;
  currentContent?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string; // HTML with {{field}} placeholders
  createdAt: Date;
  updatedAt: Date;
  fields: string[]; // Extracted {{field}} names
}

export interface FormField {
  name: string;
  value: string;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  data: ArrayBuffer;
  uploadedAt: Date;
}

export interface Settings {
  counterparties: Counterparty[];
  expertiseTypes: ExpertiseType[];
  users: User[];
  enableOCR: boolean;
  useTesseract: boolean;
}

export interface Counterparty {
  id: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'lawyer' | 'paralegal';
  position?: string;
}

export interface ExportData {
  documents: Document[];
  templates: Template[];
  settings: Settings;
  exportedAt: Date;
  version: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

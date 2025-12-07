/**
 * View document page with versions, comments, OCR, and metadata
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../api/mockApi';
import { RichTextEditor } from '../components/RichTextEditor.tsx';
import type { Document } from '../types';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  MessageCircle,
  History,
  Eye,
  Plus,
  Zap,
  Tag,
  Edit2,
  Save,
  X as XIcon,
} from 'lucide-react';

export const ViewDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'comments' | 'metadata' | 'ocr'>(
    'preview'
  );
  const [newComment, setNewComment] = useState('');
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    try {
      const result = await mockApi.getDocument(id);
      if (result.success && result.data) {
        setDocument(result.data);
        setOcrText(result.data.ocrText || null);
        setEditingContent(result.data.currentContent || '');
      } else {
        toast.error('Документ не найден');
        navigate('/documents');
      }
    } catch (error) {
      toast.error('Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!document || !newComment.trim()) return;

    try {
      const result = await mockApi.addComment(document.id, newComment, 'Текущий пользователь');
      if (result.success) {
        setNewComment('');
        loadDocument();
        toast.success('Комментарий добавлен');
      }
    } catch (error) {
      toast.error('Ошибка добавления комментария');
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    if (!document) return;

    try {
      const result = await mockApi.revertVersion(document.id, versionId);
      if (result.success) {
        loadDocument();
        toast.success('Версия восстановлена');
      }
    } catch (error) {
      toast.error('Ошибка восстановления версии');
    }
  };

  const handleOCR = async () => {
    if (!document) return;

    try {
      setOcrLoading(true);
      // Create a mock file
      const mockFile = new File([document.currentContent || ''], 'document.pdf', { type: 'application/pdf' });
      const result = await mockApi.recognizeText(mockFile);

      if (result.success && result.data) {
        setOcrText(result.data);
        // Update document with OCR text
        await mockApi.updateDocument(document.id, { ocrText: result.data });
        loadDocument();
        toast.success('OCR завершен');
      }
    } catch (error) {
      toast.error('Ошибка OCR');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    if (document) {
      setEditingContent(document.currentContent || '');
    }
  };

  const handleEditSave = async () => {
    if (!document) return;

    try {
      const result = await mockApi.updateDocument(document.id, {
        currentContent: editingContent,
      });

      if (result.success) {
        await loadDocument();
        setIsEditing(false);
        toast.success('Документ обновлен');
      } else {
        toast.error('Ошибка обновления документа');
      }
    } catch (error) {
      toast.error('Ошибка обновления документа');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (!document) {
    return <div className="text-center py-12">Документ не найден</div>;
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/documents')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <StatusBadge status={document.status} />
              <span className="text-sm text-gray-600">{document.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {document.case_number && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Номер дела</p>
            <p className="font-bold text-gray-900">{document.case_number}</p>
          </div>
        )}
        {document.contract_number && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 mb-1">Номер договора</p>
            <p className="font-bold text-gray-900">{document.contract_number}</p>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Версии</p>
          <p className="font-bold text-gray-900">{document.versions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Комментарии</p>
          <p className="font-bold text-gray-900">{document.comments.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'preview', label: 'Содержимое', icon: Eye },
            { id: 'versions', label: 'История', icon: History },
            { id: 'comments', label: 'Комментарии', icon: MessageCircle },
            { id: 'metadata', label: 'Метаданные', icon: Tag },
            { id: 'ocr', label: 'OCR', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {!isEditing && (
                <button
                  onClick={handleEditStart}
                  className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
              )}
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditSave}
                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Сохранить</span>
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    <XIcon className="w-4 h-4" />
                    <span>Отмена</span>
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <RichTextEditor
                value={editingContent}
                onChange={setEditingContent}
                editable={true}
                placeholder="Содержимое документа..."
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                {document.currentContent ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: document.currentContent,
                    }}
                  />
                ) : (
                  <p className="text-gray-600">Содержимое документа отсутствует</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'versions' && (
          <div className="space-y-4">
            {document.versions.length === 0 ? (
              <p className="text-gray-600">Версий нет</p>
            ) : (
              document.versions.map((version, idx) => (
                <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">Версия {version.versionNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(version.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {idx > 0 && (
                      <button
                        onClick={() => handleRevertVersion(version.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Откатить
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{version.note}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>

            <div className="space-y-3">
              {document.comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900">{comment.author}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(comment.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Создан</p>
                <p className="font-bold text-gray-900">
                  {new Date(document.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Обновлен</p>
                <p className="font-bold text-gray-900">
                  {new Date(document.updatedAt).toLocaleString('ru-RU')}
                </p>
              </div>
              {document.counterparty && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Контрагент</p>
                  <p className="font-bold text-gray-900">{document.counterparty}</p>
                </div>
              )}
              {document.responsible && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ответственный</p>
                  <p className="font-bold text-gray-900">{document.responsible}</p>
                </div>
              )}
            </div>
            {document.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Теги</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span key={tag} className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="space-y-4">
            <button
              onClick={handleOCR}
              disabled={ocrLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{ocrLoading ? 'Распознавание...' : 'Распознать текст'}</span>
            </button>
            {ocrText && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Распознанный текст:</p>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">{ocrText}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

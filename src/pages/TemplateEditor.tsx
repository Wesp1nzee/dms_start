/**
 * Template editor page with Tiptap WYSIWYG editor
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../api/mockApi';
import type { Template } from '../types';
import toast from 'react-hot-toast';
import { Save, Plus, ChevronLeft } from 'lucide-react';

export const TemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [fields, setFields] = useState<string[]>([]);
  const [newField, setNewField] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    // Extract fields from content
    const regex = /\{\{([^}]+)\}\}/g;
    const extractedFields: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const field = match[1].trim();
      if (!extractedFields.includes(field)) {
        extractedFields.push(field);
      }
    }
    setFields(extractedFields);
  }, [content]);

  const loadTemplate = async () => {
    if (!id) return;
    try {
      const result = await mockApi.getTemplate(id);
      if (result.success && result.data) {
        setTemplate(result.data);
        setName(result.data.name);
        setDescription(result.data.description);
        setContent(result.data.content);
      } else {
        toast.error('Шаблон не найден');
        navigate('/templates');
      }
    } catch (error) {
      toast.error('Ошибка загрузки шаблона');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!newField.trim()) return;
    const field = newField.trim();
    const placeholder = `{{${field}}}`;
    setContent((prev) => prev + ' ' + placeholder);
    setNewField('');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Введите название шаблона');
      return;
    }

    try {
      setSaving(true);

      if (template) {
        // Update existing
        const result = await mockApi.updateTemplate(template.id, {
          name,
          description,
          content,
        });
        if (result.success) {
          toast.success('Шаблон обновлен');
          navigate('/templates');
        }
      } else {
        // Create new
        const result = await mockApi.createTemplate(name, description, content);
        if (result.success) {
          toast.success('Шаблон создан');
          navigate('/templates');
        }
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/templates')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {template ? 'Редактировать шаблон' : 'Новый шаблон'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="col-span-2 space-y-6">
          {/* Name and Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название шаблона *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Типовой договор поставки"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание шаблона"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Содержимое</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите HTML содержимое с поддержкой merge-полей {{field}}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
              rows={15}
            />
            <div className="text-xs text-gray-600 space-y-1">
              <p>💡 Используйте HTML теги и merge-поля {'{'}{'{'} field_name {'}'}{'}'}</p>
              <p>Примеры: &lt;h1&gt;Заголовок&lt;/h1&gt;, &lt;p&gt;{'{'}{'{'} имя {'}'}{'}'}&lt;/p&gt;</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">Предпросмотр</label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 prose prose-sm max-w-none">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-gray-600">Содержимое не добавлено</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Merge-поля</h3>
            <p className="text-xs text-gray-600">Найдено: {fields.length}</p>

            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs break-words">
                    {'{{'} {field} {'}}'} 
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Добавить поле</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') addField();
                  }}
                  placeholder="field_name"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addField}
                  className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>

          {/* Info */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-xs text-indigo-900">
              💡 Merge-поля автоматически извлекаются из содержимого. Используйте формат {'{'}{'{'} field_name {'}'}{'}'} для обозначения заполняемых полей.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Form fill page - for using templates to create documents
 */

import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
import type { Template } from '../types';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export const FormFillPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await mockApi.listTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      toast.error('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    const values: Record<string, string> = {};
    template.fields.forEach((field) => {
      values[field] = '';
    });
    setFormValues(values);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    try {
      setSubmitting(true);
      const result = await mockApi.generateFromTemplate(
        selectedTemplate.id,
        formValues,
        {
          title: selectedTemplate.name,
          type: 'contract',
        }
      );

      if (result.success) {
        toast.success('Документ создан из шаблона');
        setSelectedTemplate(null);
        setFormValues({});
      }
    } catch (error) {
      toast.error('Ошибка создания документа');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  if (selectedTemplate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedTemplate.name}</h1>
          <p className="text-gray-600 mt-2">{selectedTemplate.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {selectedTemplate.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {field.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={formValues[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={`Введите ${field}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Создание...' : 'Создать документ'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Использовать шаблон</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleTemplateSelect(template)}
          >
            <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <div className="mb-4">
              <p className="text-xs text-gray-500">Поля: {template.fields.length}</p>
              {template.fields.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.fields.slice(0, 3).map((field) => (
                    <span key={field} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleTemplateSelect(template);
              }}
            >
              Использовать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

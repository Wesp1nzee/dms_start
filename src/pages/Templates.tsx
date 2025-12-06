/**
 * Templates list page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../api/mockApi';
import type { Template } from '../types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (confirm('Удалить шаблон?')) {
      const result = await mockApi.deleteTemplate(id);
      if (result.success) {
        toast.success('Шаблон удален');
        loadTemplates();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Шаблоны документов</h1>
        <Link
          to="/templates/create"
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Новый шаблон</span>
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Нет шаблонов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Поля: {template.fields.length}</p>
                {template.fields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {template.fields.slice(0, 3).map((field) => (
                      <span key={field} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {template.fields.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                        +{template.fields.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/templates/${template.id}/edit`}
                  className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 text-sm rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Редактировать</span>
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

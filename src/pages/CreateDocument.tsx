/**
 * Create document page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../api/mockApi';
import { RichTextEditor } from '../components/RichTextEditor.tsx';
import type { DocumentType } from '../types';
import toast from 'react-hot-toast';
import { Save, X } from 'lucide-react';

export const CreateDocumentPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    type: 'contract' as DocumentType,
    case_number: '',
    contract_number: '',
    counterparty: '',
    amount: '',
    expertise_type: '',
    responsible: '',
    tags: '',
    content: '', // Добавляем поле контента
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Заполните название');
      return;
    }

    try {
      setLoading(true);
      const result = await mockApi.createDocument(formData.title, formData.type, {
        case_number: formData.case_number || undefined,
        contract_number: formData.contract_number || undefined,
        counterparty: formData.counterparty || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        expertise_type: formData.expertise_type || undefined,
        responsible: formData.responsible || undefined,
        tags: formData.tags.split(',').filter(t => t.trim()),
      });

      if (result.success && result.data) {
        // Обновляем содержимое документа
        if (formData.content) {
          await mockApi.updateDocument(result.data.id, { currentContent: formData.content });
        }
        toast.success('Документ создан');
        navigate(`/documents/${result.data.id}`);
      } else {
        toast.error('Ошибка создания документа');
      }
    } catch (error) {
      toast.error('Ошибка создания документа');
    } finally {
      setLoading(false);
    }
  };

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'contract', label: 'Договор' },
    { value: 'case', label: 'Дело' },
    { value: 'agreement', label: 'Соглашение' },
    { value: 'claim', label: 'Исковое заявление' },
    { value: 'resolution', label: 'Решение' },
    { value: 'other', label: 'Прочее' },
  ];

  const expertiseTypes = [
    { value: 'civil', label: 'Гражданское' },
    { value: 'criminal', label: 'Уголовное' },
    { value: 'labor', label: 'Трудовое' },
    { value: 'administrative', label: 'Административное' },
    { value: 'corporate', label: 'Корпоративное' },
    { value: 'ip', label: 'Интеллектуальная собственность' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Создать документ</h1>
        <button
          onClick={() => navigate('/documents')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите название документа"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип документа</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Вид экспертизы</label>
            <select
              name="expertise_type"
              value={formData.expertise_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Выберите...</option>
              {expertiseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Номер дела</label>
            <input
              type="text"
              name="case_number"
              value={formData.case_number}
              onChange={handleChange}
              placeholder="А40-123456/2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Номер договора</label>
            <input
              type="text"
              name="contract_number"
              value={formData.contract_number}
              onChange={handleChange}
              placeholder="ДП-2024-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Контрагент</label>
          <input
            type="text"
            name="counterparty"
            value={formData.counterparty}
            onChange={handleChange}
            placeholder="Название организации"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ответственный</label>
            <input
              type="text"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              placeholder="ФИО"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Теги (через запятую)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="тег1, тег2, тег3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Содержимое документа</label>
          <RichTextEditor
            value={formData.content}
            onChange={(content: string) =>
              setFormData((prev) => ({
                ...prev,
                content,
              }))
            }
            placeholder="Начните писать содержимое документа..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Создание...' : 'Создать'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

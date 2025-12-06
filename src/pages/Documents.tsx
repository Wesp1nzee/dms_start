/**
 * Documents list page with search and filters
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../api/mockApi';
import type { Document, DocumentType, DocumentStatus } from '../types';
import toast from 'react-hot-toast';
import { Search, Plus, Eye, Trash2, Filter } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const documentTypes: DocumentType[] = ['contract', 'case', 'agreement', 'claim', 'resolution', 'other'];
  const documentStatuses: DocumentStatus[] = ['draft', 'active', 'archived', 'completed'];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await mockApi.listDocuments();
      if (result.success && result.data) {
        setDocuments(result.data);
      } else {
        toast.error('Ошибка загрузки документов');
      }
    } catch (error) {
      toast.error('Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.contract_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDocs(filtered);
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены?')) {
      const result = await mockApi.deleteDocument(id);
      if (result.success) {
        toast.success('Документ удален');
        loadDocuments();
      } else {
        toast.error('Ошибка удаления');
      }
    }
  };

  const StatusBadge = ({ status }: { status: DocumentStatus }) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  const TypeBadge = ({ type }: { type: DocumentType }) => {
    const typeLabels = {
      contract: 'Договор',
      case: 'Дело',
      agreement: 'Соглашение',
      claim: 'Исковое заявление',
      resolution: 'Решение',
      other: 'Прочее',
    };
    return <span className="text-xs text-gray-600">{typeLabels[type]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Загрузка документов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Документы</h1>
        <div className="flex items-center space-x-3">
          <Link
            to="/documents/create"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Новый документ</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, номеру дела..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип документа</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DocumentType | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Все типы</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Все статусы</option>
                  {documentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setStatusFilter('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Очистить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Документы не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Номер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={doc.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{doc.case_number || doc.contract_number || '—'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

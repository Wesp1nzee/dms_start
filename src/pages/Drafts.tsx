/**
 * Drafts page
 */

import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
import type { Document } from '../types';
import toast from 'react-hot-toast';
import { Archive, Trash2 } from 'lucide-react';

export const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const result = await mockApi.listDocuments({ status: 'draft' });
      if (result.success && result.data) {
        setDrafts(result.data);
      }
    } catch (error) {
      toast.error('Ошибка загрузки черновиков');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    const result = await mockApi.updateDocument(id, { status: 'active' });
    if (result.success) {
      toast.success('Документ опубликован');
      loadDrafts();
    } else {
      toast.error('Ошибка публикации');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить черновик?')) {
      const result = await mockApi.deleteDocument(id);
      if (result.success) {
        toast.success('Черновик удален');
        loadDrafts();
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Черновики</h1>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Нет черновиков</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => (
            <div key={draft.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900 mb-2">{draft.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{draft.case_number || draft.contract_number || '—'}</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePublish(draft.id)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Опубликовать</span>
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
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

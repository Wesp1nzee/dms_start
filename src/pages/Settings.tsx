/**
 * Settings page with import/export and reference books management
 */

import React, { useState, useEffect } from 'react';
import { mockApi } from '../api/mockApi';
import type { Settings as SettingsType } from '../types';
import toast from 'react-hot-toast';
import { Download, Upload, Plus, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCounterparty, setNewCounterparty] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await mockApi.getSettings();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      toast.error('Ошибка загрузки настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await mockApi.exportDatabase();
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `docflow-export-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('База данных экспортирована');
      }
    } catch (error) {
      toast.error('Ошибка экспорта');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const result = await mockApi.importDatabase(data);
        if (result.success) {
          toast.success('База данных импортирована');
          loadSettings();
        }
      } catch (error) {
        toast.error('Ошибка импорта. Проверьте формат файла');
      }
    };
    reader.readAsText(file);
  };

  const addCounterparty = async () => {
    if (!newCounterparty.trim() || !settings) return;
    
    const updated = {
      ...settings,
      counterparties: [
        ...settings.counterparties,
        {
          id: Date.now().toString(),
          name: newCounterparty,
        },
      ],
    };
    
    const result = await mockApi.updateSettings(updated);
    if (result.success) {
      setSettings(updated);
      setNewCounterparty('');
      toast.success('Контрагент добавлен');
    }
  };

  const removeCounterparty = async (id: string) => {
    if (!settings) return;
    
    const updated = {
      ...settings,
      counterparties: settings.counterparties.filter((c) => c.id !== id),
    };
    
    const result = await mockApi.updateSettings(updated);
    if (result.success) {
      setSettings(updated);
      toast.success('Контрагент удален');
    }
  };

  if (loading || !settings) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>

      {/* Export/Import Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Резервная копия</h2>
        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Экспортировать все данные</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Импортировать данные</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Counterparties Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Контрагенты</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Название контрагента"
              value={newCounterparty}
              onChange={(e) => setNewCounterparty(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addCounterparty}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
          <div className="space-y-2">
            {settings.counterparties.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  {c.email && <p className="text-sm text-gray-600">{c.email}</p>}
                </div>
                <button
                  onClick={() => removeCounterparty(c.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Пользователи</h2>
        <div className="space-y-2">
          {settings.users.map((u) => (
            <div key={u.id} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{u.name}</p>
              <p className="text-sm text-gray-600">
                {u.position} • {u.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">OCR</h2>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.enableOCR}
            disabled
            className="w-4 h-4"
          />
          <span className="text-gray-700">Включить OCR</span>
        </label>
        <p className="text-sm text-gray-600 mt-2">
          Статус: {settings.useTesseract ? 'Tesseract.js' : 'Mock mode'}
        </p>
      </div>
    </div>
  );
};

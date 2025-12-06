/**
 * Dashboard page
 */

import React, { useEffect, useState } from 'react';
import { mockApi } from '../api/mockApi';
import type { Document } from '../types';
import toast from 'react-hot-toast';
import { BarChart3, FileText, Archive, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    drafts: 0,
    archived: 0,
  });
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await mockApi.listDocuments();
      if (result.success && result.data) {
        const docs = result.data;
        setStats({
          total: docs.length,
          active: docs.filter((d) => d.status === 'active').length,
          drafts: docs.filter((d) => d.status === 'draft').length,
          archived: docs.filter((d) => d.status === 'archived').length,
        });
        setRecentDocs(docs.slice(0, 5));
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ComponentType<any>;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Добро пожаловать в платформу документооборота</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Всего документов" value={stats.total} color="bg-blue-500" />
        <StatCard
          icon={FileText}
          label="Активных"
          value={stats.active}
          color="bg-green-500"
        />
        <StatCard
          icon={Clock}
          label="Черновиков"
          value={stats.drafts}
          color="bg-yellow-500"
        />
        <StatCard icon={Archive} label="В архиве" value={stats.archived} color="bg-gray-500" />
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Последние документы</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentDocs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Нет документов</p>
            </div>
          ) : (
            recentDocs.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.case_number && `Дело: ${doc.case_number}`}
                      {doc.contract_number && `Договор: ${doc.contract_number}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : doc.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

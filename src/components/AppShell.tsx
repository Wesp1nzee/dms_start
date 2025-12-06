/**
 * Main application shell with navigation
 */

import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FileText, Settings, HelpCircle, Home, Archive, Copy, Plus, LayoutGrid } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/documents', label: 'Документы', icon: FileText },
    { path: '/documents/create', label: 'Создать', icon: Plus },
    { path: '/drafts', label: 'Черновики', icon: Archive },
    { path: '/templates', label: 'Шаблоны', icon: LayoutGrid },
    { path: '/settings', label: 'Настройки', icon: Settings },
    { path: '/help', label: 'Справка', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden sm:flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-gray-900">DocFlow</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Свернуть"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Платформа документооборота</h1>
            <div className="text-sm text-gray-600">
              Версия 1.0 • Frontend-only
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
};

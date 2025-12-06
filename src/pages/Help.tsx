/**
 * Help page
 */

import React from 'react';
import { HelpCircle, FileText, Clock } from 'lucide-react';

export const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Справка и документация</h1>
        <p className="text-gray-600 mt-2">Платформа документооборота для юристов</p>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Начало работы</span>
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Платформа предназначена для управления документами, договорами и делами. Все данные хранятся локально в вашем браузере.
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Перейдите на страницу "Документы" для просмотра всех документов</li>
            <li>Используйте "Создать документ" для добавления нового документа</li>
            <li>Создавайте шаблоны на странице "Шаблоны" для ускорения работы</li>
            <li>Управляйте контрагентами в "Настройках"</li>
          </ol>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Основные возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📄 Управление документами</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Создание и редактирование</li>
              <li>Поиск и фильтрация</li>
              <li>История версий</li>
              <li>Откат к предыдущим версиям</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📋 Шаблоны</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>WYSIWYG редактор</li>
              <li>Merge-поля {'{'}{'{'} field {'}'}{'}'}</li>
              <li>Автозаполнение</li>
              <li>Переиспользование</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">🔍 OCR распознавание</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Распознавание текста из PDF</li>
              <li>Распознавание из изображений</li>
              <li>Полнотекстовый поиск</li>
              <li>Mock и Tesseract.js режимы</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">💾 Данные</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Локальное хранилище</li>
              <li>Экспорт/импорт</li>
              <li>Резервные копии</li>
              <li>Сохранение в IndexedDB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Workflows */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Рабочие процессы</span>
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Создание документа из шаблона</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Перейдите на страницу "Шаблоны"</li>
              <li>Выберите нужный шаблон</li>
              <li>Нажмите "Использовать"</li>
              <li>Заполните поля {'{'}{'{'} field {'}'}{'}'}</li>
              <li>Система создаст документ с версией 1</li>
            </ol>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Откат к предыдущей версии</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Откройте документ</li>
              <li>Перейдите на вкладку "История версий"</li>
              <li>Выберите нужную версию</li>
              <li>Нажмите "Откатить"</li>
              <li>Будет создана новая версия с содержимым старой</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5" />
          <span>Советы и рекомендации</span>
        </h2>
        <ul className="space-y-2 text-indigo-900 text-sm">
          <li>✓ Регулярно экспортируйте данные через настройки</li>
          <li>✓ Используйте теги для категоризации документов</li>
          <li>✓ Добавляйте комментарии для отслеживания изменений</li>
          <li>✓ Создавайте черновики перед финальной публикацией</li>
          <li>✓ Настраивайте справочники контрагентов и пользователей</li>
          <li>✓ Используйте функцию OCR для распознавания скан-копий</li>
        </ul>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Системная информация</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Версия:</strong> 1.0</p>
          <p><strong>Тип:</strong> Frontend-only</p>
          <p><strong>Хранилище:</strong> IndexedDB</p>
          <p><strong>Синхронизация:</strong> Не требуется</p>
          <p><strong>Браузер:</strong> Modern browsers (Chrome, Firefox, Safari, Edge)</p>
        </div>
      </div>
    </div>
  );
};

# Руководство разработчика

## Быстрый старт

```bash
# 1. Установка
npm install

# 2. Запуск dev сервера
npm run dev

# 3. Откройте http://localhost:5173 в браузере
```

## Структура проекта

```
my-app/
├── src/
│   ├── types/                 # TypeScript интерфейсы
│   │   └── index.ts
│   ├── api/                   # API слой
│   │   ├── mockApi.ts         # Mock API с задержками
│   │   └── seed.ts            # Первичные тестовые данные
│   ├── storage/               # Хранилище
│   │   └── StorageAdapter.ts  # IndexedDB абстракция
│   ├── components/            # Переиспользуемые компоненты
│   │   └── AppShell.tsx       # Main layout
│   ├── pages/                 # Страницы приложения
│   │   ├── Dashboard.tsx
│   │   ├── Documents.tsx
│   │   ├── CreateDocument.tsx
│   │   ├── ViewDocument.tsx
│   │   ├── Drafts.tsx
│   │   ├── Templates.tsx
│   │   ├── TemplateEditor.tsx
│   │   ├── FormFill.tsx
│   │   ├── Settings.tsx
│   │   └── Help.tsx
│   ├── App.tsx                # Root компонент с роутингом
│   ├── main.tsx               # Точка входа
│   └── index.css              # Tailwind стили
├── public/                    # Статические файлы
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── README.md                  # Пользовательская документация
├── ARCHITECTURE.md            # Архитектура
└── DEVELOPER.md               # Этот файл
```

## Добавление новой страницы

### 1. Создайте компонент страницы

```typescript
// src/pages/MyPage.tsx
import React, { useEffect, useState } from 'react';
import { mockApi } from '../api/mockApi';
import type { Document } from '../types';
import toast from 'react-hot-toast';

export const MyPage: React.FC = () => {
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await mockApi.listDocuments();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error('Ошибка загрузки');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Моя страница</h1>
      {/* содержимое */}
    </div>
  );
};
```

### 2. Добавьте маршрут в App.tsx

```typescript
import { MyPage } from './pages/MyPage';

// в Routes:
<Route path="/mypage" element={<MyPage />} />
```

### 3. Добавьте пункт в меню AppShell.tsx

```typescript
const menuItems = [
  // ...
  { path: '/mypage', label: 'Моя страница', icon: MyIcon },
];
```

## Добавление нового метода API

### 1. Определите тип в `src/types/index.ts`

```typescript
export interface MyData {
  id: string;
  name: string;
  // ...
}
```

### 2. Добавьте метод в `src/api/mockApi.ts`

```typescript
async getMyData(id: string): Promise<APIResponse<MyData>> {
  await delay(API_DELAY);
  try {
    const data = await StorageAdapter.getMyData(id);
    if (!data) {
      return { success: false, error: 'Not found' };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch' };
  }
}
```

### 3. Добавьте метод в `src/storage/StorageAdapter.ts`

```typescript
async getMyData(id: string): Promise<MyData | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MY_STORE, 'readonly');
    const store = transaction.objectStore(STORES.MY_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
```

## Использование в компонентах

```typescript
// 1. Импортируйте API
import { mockApi } from '../api/mockApi';

// 2. Используйте в useEffect
const [data, setData] = useState<Document | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await mockApi.getDocument(id);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Error');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

// 3. Обновляйте данные
const handleUpdate = async (updates: Partial<Document>) => {
  const result = await mockApi.updateDocument(id, updates);
  if (result.success) {
    toast.success('Updated');
    // Перезагрузите данные
  } else {
    toast.error('Update failed');
  }
};
```

## Стилизация с Tailwind

### Основные классы

```jsx
// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Spacing
<div className="p-6 mb-4 space-y-2">

// Colors
<div className="bg-indigo-600 text-white">

// Typography
<h1 className="text-3xl font-bold">
<p className="text-sm text-gray-600">

// Responsive
<div className="hidden sm:flex">
<div className="flex md:hidden">

// States
<button className="hover:bg-indigo-700 disabled:opacity-50 transition-colors">
```

### Компонентные паттерны

```jsx
// Card
<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">

// Button
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">

// Badge
<span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />

// Select
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
```

## Обработка ошибок

```typescript
// Toast уведомления
import toast from 'react-hot-toast';

toast.success('Успешно!');
toast.error('Ошибка!');
toast.loading('Загружаем...');
```

## Типизация

### Функции

```typescript
// Компонент
export const MyComponent: React.FC<{ id: string }> = ({ id }) => {
  // ...
};

// Функция обработчик
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};

// Async функция
const fetchData = async (): Promise<void> => {
  // ...
};
```

### API Response

```typescript
// Всегда используйте типизированный результат
const result = await mockApi.listDocuments();

if (result.success && result.data) {
  // result.data гарантированно Document[]
  setDocuments(result.data);
} else {
  // result.error содержит сообщение об ошибке
  toast.error(result.error);
}
```

## Тестирование

### Ручное тестирование в Console

```javascript
// Импортируйте в console (если нужно, добавьте export в файлы)
const { mockApi } = await import('/src/api/mockApi.ts');

// Тестируйте методы
mockApi.listDocuments().then(console.log);
mockApi.createDocument('Test', 'contract').then(console.log);

// Проверьте IndexedDB
const db = await new Promise((resolve) => {
  const req = indexedDB.open('DocumentManagementDB');
  req.onsuccess = () => resolve(req.result);
});
```

## Build и Deploy

```bash
# Production build
npm run build

# Previw build локально
npm run preview

# Результаты в dist/ - готовы к загрузке на хостинг
```

## ESLint и TypeScript

```bash
# Проверка ошибок
npm run lint  # если есть в package.json

# Type checking
npx tsc --noEmit
```

## Миграция на реальный API

### 1. Создайте файл `src/api/realApi.ts`

```typescript
export const realApi = {
  async listDocuments(filters?: any) {
    const response = await fetch('/api/documents', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { success: response.ok, data, error: data.error };
  },
  // ... остальные методы
};
```

### 2. Используйте условно

```typescript
// src/api/index.ts
export const api = import.meta.env.DEV ? mockApi : realApi;
```

### 3. Обновите импорты

```typescript
// было
import { mockApi } from '../api/mockApi';
// стало
import { api } from '../api';
const result = await api.listDocuments();
```

## Продвинутые техники

### Loading states

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // действие
  } finally {
    setLoading(false);
  }
};

// в UI
<button disabled={loading}>
  {loading ? 'Обработка...' : 'Сохранить'}
</button>
```

### Условная рендеризация

```typescript
{loading ? (
  <div className="text-center py-12">Загрузка...</div>
) : data.length === 0 ? (
  <div className="text-center">Данные не найдены</div>
) : (
  <div>{/* содержимое */}</div>
)}
```

### Фильтрация на клиенте

```typescript
const filtered = data.filter((item) =>
  item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (!statusFilter || item.status === statusFilter)
);
```

### Сортировка

```typescript
const sorted = [...data].sort((a, b) => {
  // по дате (новые первые)
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  
  // по названию (алфавитно)
  // return a.title.localeCompare(b.title);
});
```

## Отладка

### DevTools

1. Chrome DevTools (F12)
   - Application → IndexedDB - просмотр данных
   - Console - запуск JavaScript
   - Network - смотрите mock задержки

2. React DevTools
   - Компоненты, состояние, props
   - Performance профайлинг

### Логирование

```typescript
console.log('Debug:', { data, loading, error });

// Условное логирование
const isDev = import.meta.env.DEV;
if (isDev) console.log('Dev mode');
```

## Производительность

### Оптимизация рендеринга

```typescript
// Используйте useCallback для мемоизации функций
const handleFilter = useCallback((term: string) => {
  const filtered = items.filter(i => i.name.includes(term));
  setFiltered(filtered);
}, [items]);

// Используйте useMemo для дорогих вычислений
const sorted = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### Ленивая загрузка

```typescript
// Загружайте данные только когда нужно
useEffect(() => {
  if (isVisible) {
    loadData();
  }
}, [isVisible]);
```

## Полезные ссылки

- [React документация](https://react.dev)
- [TypeScript handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [Vite документация](https://vite.dev)
- [React Hot Toast](https://react-hot-toast.com)
- [Lucide React icons](https://lucide.dev)

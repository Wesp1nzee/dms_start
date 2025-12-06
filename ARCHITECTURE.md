# Архитектура платформы документооборота

## Обзор

Это полнофункциональное frontend-only решение для управления документами, договорами и делами юристов. Все данные хранятся локально в IndexedDB браузера. Приложение использует mock API с имитацией задержек для подготовки к переходу на реальный backend.

## Основные компоненты

### 1. **Storage Layer** (`src/storage/StorageAdapter.ts`)

Абстракция над IndexedDB с методами CRUD для:
- Документов (documents)
- Шаблонов (templates)
- Настроек (settings)
- Файлов (files)

Методы:
- `init()` - инициализация БД при первом запуске
- `addDocument()`, `getDocument()`, `updateDocument()`, `deleteDocument()`
- `getAllDocuments()` - получение всех документов с поддержкой фильтрации
- `exportDatabase()` - экспорт всех данных для резервной копии
- `importDatabase()` - импорт из резервной копии

### 2. **Mock API** (`src/api/mockApi.ts`)

API интерфейс с имитацией сетевых задержек (~400ms). Все методы:
- Асинхронны (async/await)
- Возвращают `APIResponse<T>` с полями: `success`, `data`, `error`
- Готовы к замене на реальный backend

**Методы:**
- `listDocuments(filters)` - с поддержкой фильтрации по статусу, типу, дате, поиску
- `createDocument()`, `getDocument()`, `updateDocument()`, `deleteDocument()`
- `createVersion()`, `getVersions()`, `revertVersion()` - версионирование
- `addComment()`, `getComments()` - комментарии
- `listTemplates()`, `createTemplate()`, `updateTemplate()`, `deleteTemplate()`
- `generateFromTemplate()` - создание документа из шаблона
- `recognizeText()` - mock OCR (возвращает примерный текст)
- `exportDatabase()`, `importDatabase()` - резервные копии
- `getSettings()`, `updateSettings()` - управление настройками

### 3. **Types** (`src/types/index.ts`)

Полное определение типов TypeScript:

```typescript
// Документ содержит:
- id, title, type, status
- case_number, contract_number, counterparty
- amount, expertise_type, responsible
- tags, versions, comments
- ocrText, currentContent
- createdAt, updatedAt

// Версия:
- id, versionNumber, createdAt
- content, snapshot, note, author

// Комментарий:
- id, text, author, createdAt, versionId

// Шаблон:
- id, name, description, content
- fields (автоматически извлекаются)
- createdAt, updatedAt

// Настройки:
- counterparties, expertiseTypes, users
- enableOCR, useTesseract
```

## Архитектура страниц

### Layout (`src/components/AppShell.tsx`)

Основной layout с:
- Боковой навигацией (sidebar) с коллапсированием
- Верхней панелью (header)
- Областью содержимого (main)
- Toast уведомлениями (react-hot-toast)

### Страницы (`src/pages/`)

1. **Dashboard.tsx** - главная страница со статистикой
2. **Documents.tsx** - список документов с поиском и фильтрацией
3. **CreateDocument.tsx** - форма создания документа
4. **ViewDocument.tsx** - просмотр с табами:
   - Preview (содержимое)
   - История версий (VersionHistory)
   - Комментарии (Comments)
   - Метаданные (Metadata)
   - OCR распознавание (OCRPanel)
5. **Drafts.tsx** - черновики (статус draft)
6. **Templates.tsx** - список шаблонов
7. **TemplateEditor.tsx** - WYSIWYG редактор шаблонов
8. **FormFill.tsx** - использование шаблонов для создания документов
9. **Settings.tsx** - экспорт/импорт БД, справочники
10. **Help.tsx** - справка и документация

## Жизненный цикл приложения

```
1. App.tsx загружается
2. useEffect инициализирует:
   - StorageAdapter.init() - открывает IndexedDB
   - seedDatabase() - создает тестовые данные при первом запуске
3. Router маршрутизирует страницы
4. AppShell отображает layout
5. Каждая страница:
   - Загружает данные через mockApi
   - Отображает UI
   - Обрабатывает пользовательские действия
   - Сохраняет изменения в IndexedDB через StorageAdapter
```

## Данные и хранилище

### IndexedDB базы

```
db: DocumentManagementDB (v1)

Object stores:
- documents: {keyPath: 'id'}
- templates: {keyPath: 'id'}
- settings: {keyPath: 'id'}
- files: {keyPath: 'id'}
```

### Примечания о данных

- Все даты хранятся как ISO строки, преобразуются в Date при использовании
- OCR текст сохраняется в поле `ocrText` документа
- Версии хранятся в массиве `versions` документа
- Комментарии хранятся в массиве `comments` документа

## Фильтрация и поиск

### На клиенте (mockApi)

```javascript
// Поиск по нескольким полям одновременно
searchTerm → title, case_number, contract_number, counterparty, ocrText, tags

// Фильтры
type → contract, case, agreement, claim, resolution, other
status → draft, active, archived, completed
date → from, to
```

Полнотекстовый поиск включает распознанный OCR текст.

## Версионирование

```
Пользователь редактирует документ
→ Система сохраняет текущее содержимое как новую версию
→ Каждая версия содержит:
  - Полное содержимое
  - Снимок (первые 500 символов)
  - Заметку об изменении
  - Автора
  - Дату создания

При откате:
→ Система создает новую версию с содержимым старой версии
→ Это не удаляет старые версии, а создает "откат"
```

## OCR интеграция

### Mock режим (по умолчанию)

```typescript
mockApi.recognizeText(file) 
→ Возвращает примерный текст
→ Задержка 1-2 секунды (имитация обработки)
```

### Tesseract.js режим (флаг enableOCR)

```typescript
// В src/api/mockApi.ts можно добавить:
if (settings.useTesseract) {
  const { Tesseract } = await import('tesseract.js');
  // Реальное распознавание
}
```

## Merge-поля в шаблонах

### Синтаксис

```html
<h2>{{field_name}}</h2>
<p>Контрагент: {{counterparty}}</p>
<p>Сумма: {{amount}}</p>
```

### Обработка

1. При сохранении шаблона извлекаются все `{{field_name}}`
2. При использовании шаблона система показывает форму с полями
3. При генерации документа поля заменяются на значения
4. Результат сохраняется как новый документ с версией 1

## Стилизация

### Tailwind CSS

- Утилиты для быстрого дизайна
- Адаптивная сетка (mobile-first)
- Кастомные цвета (indigo для основных акцентов)
- Темная и светлая поддержка

### Компоненты

- Таблицы с hover эффектами
- Карточки с тенями
- Модальные окна (react-modal)
- Иконки (lucide-react)

## Готовность к backend

### Для подключения реального API:

1. Создать новый файл `src/api/realApi.ts`
2. Реализовать те же методы что в mockApi
3. Заменить импорт в компонентах:
   ```typescript
   // было
   import { mockApi } from '../api/mockApi';
   
   // стало
   import { mockApi as api } from '../api/realApi';
   ```

4. Или создать фасад:
   ```typescript
   const api = isDevelopment ? mockApi : realApi;
   ```

## Производительность

- IndexedDB асинхронна - не блокирует UI
- Mock задержка (~400ms) имитирует сетевые условия
- Ленивая загрузка данных при переходе на страницы
- Компоненты переиспользуют состояние между страницами

## Безопасность

- Нет backend авторизации (frontend-only)
- Нет шифрования (LocalFirst модель)
- Браузер IndexedDB изолирован от других сайтов
- При необходимости можно добавить:
  - Шифрование перед сохранением в IndexedDB
  - Опцию синхронизации с backend

## Расширяемость

### Новые типы документов

Добавьте в `src/types/index.ts`:
```typescript
export type DocumentType = 'contract' | 'case' | 'agreement' | 'claim' | 'resolution' | 'my_new_type' | 'other';
```

### Новые поля документа

Расширьте интерфейс Document:
```typescript
export interface Document {
  // существующие поля...
  customField?: string;
}
```

### Новые статусы

```typescript
export type DocumentStatus = 'draft' | 'active' | 'archived' | 'completed' | 'on_review';
```

## Отладка

### localStorage

- `db_seeded_v1` - флаг что БД инициализирована

### Console

```javascript
// Просмотр IndexedDB
const db = window.indexedDB.open('DocumentManagementDB');

// Ручной вызов API
import { mockApi } from './src/api/mockApi.ts';
mockApi.listDocuments().then(r => console.log(r));
```

## Развертывание

```bash
# Build
npm run build

# Результат в dist/
# Можно развернуть на:
# - GitHub Pages
# - Vercel
# - Netlify
# - Любой static hosting
```

## Дальнейшее развитие

1. **Синхронизация с backend**
   - Реальная авторизация
   - Облачное хранилище
   - Многопользовательское редактирование

2. **Расширенный OCR**
   - Tesseract.js для локального распознавания
   - Интеграция с облачными OCR API (Google Vision, AWS)

3. **Расширенная редакция**
   - Tiptap WYSIWYG для редактирования документов
   - Поддержка вставки изображений
   - История редактирования

4. **Экспорт форматов**
   - Экспорт в PDF (pdfkit)
   - Экспорт в DOCX (docx)
   - Печать документов

5. **Коллаборация**
   - Комментарии с упоминаниями (@mentions)
   - Упоминания в версиях
   - История действий

6. **Расширенная аналитика**
   - Статистика по типам документов
   - Отчеты по делам
   - Отслеживание сроков

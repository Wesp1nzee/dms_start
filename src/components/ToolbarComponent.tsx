/**
 * Toolbar component for RichTextEditor
 * Provides formatting buttons like MS Word
 */

import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  Table as TableIcon,
  Code,
  Trash2,
  Type,
  Palette,
  Highlighter,
  Copy,
  Redo2,
  Undo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
} from 'lucide-react';
import './ToolbarStyles.css';

interface ToolbarProps {
  editor: Editor;
  onAddImage: () => void;
}

export const ToolbarComponent: React.FC<ToolbarProps> = ({ editor, onAddImage }) => {
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const addLink = () => {
    const url = window.prompt('Введите URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const Button: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    active?: boolean;
    disabled?: boolean;
  }> = ({ onClick, icon, title, active = false, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="toolbar">
      {/* Undo/Redo */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          icon={<Undo2 size={18} />}
          title="Отменить"
          disabled={!editor.can().undo()}
        />
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          icon={<Redo2 size={18} />}
          title="Повторить"
          disabled={!editor.can().redo()}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Text Formatting */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          icon={<Bold size={18} />}
          title="Жирный (Ctrl+B)"
          active={editor.isActive('bold')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          icon={<Italic size={18} />}
          title="Курсив (Ctrl+I)"
          active={editor.isActive('italic')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          icon={<UnderlineIcon size={18} />}
          title="Подчеркивание (Ctrl+U)"
          active={editor.isActive('underline')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          icon={<Trash2 size={18} />}
          title="Зачеркивание"
          active={editor.isActive('strike')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          icon={<Code size={18} />}
          title="Код"
          active={editor.isActive('code')}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Text Color & Highlight */}
      <div className="toolbar-group">
        <div className="toolbar-color-group">
          <label title="Цвет текста" className="toolbar-color-label">
            <Palette size={18} />
            <input
              type="color"
              onChange={(e) => setTextColor(e.target.value)}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="toolbar-color-input"
            />
          </label>
        </div>
        <div className="toolbar-color-group">
          <label title="Цвет подсветки" className="toolbar-color-label">
            <Highlighter size={18} />
            <input
              type="color"
              onChange={(e) => setHighlight(e.target.value)}
              value={editor.getAttributes('highlight').color || '#ffffff'}
              className="toolbar-color-input"
            />
          </label>
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Headings */}
      <div className="toolbar-group">
        <select
          onChange={(e) => {
            if (e.target.value === 'p') {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(e.target.value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          value={
            editor.isActive('heading', { level: 1 })
              ? 'h1'
              : editor.isActive('heading', { level: 2 })
                ? 'h2'
                : editor.isActive('heading', { level: 3 })
                  ? 'h3'
                  : 'p'
          }
          className="toolbar-select"
          title="Стиль заголовка"
        >
          <option value="p">Параграф</option>
          <option value="h1">Заголовок 1</option>
          <option value="h2">Заголовок 2</option>
          <option value="h3">Заголовок 3</option>
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          icon={<AlignLeft size={18} />}
          title="Выровнять влево"
          active={editor.isActive({ textAlign: 'left' })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          icon={<AlignCenter size={18} />}
          title="Выровнять по центру"
          active={editor.isActive({ textAlign: 'center' })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          icon={<AlignRight size={18} />}
          title="Выровнять вправо"
          active={editor.isActive({ textAlign: 'right' })}
        />
        <Button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          icon={<AlignJustify size={18} />}
          title="Выровнять по ширине"
          active={editor.isActive({ textAlign: 'justify' })}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Lists & Structure */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          icon={<List size={18} />}
          title="Маркированный список"
          active={editor.isActive('bulletList')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          icon={<ListOrdered size={18} />}
          title="Нумерованный список"
          active={editor.isActive('orderedList')}
        />
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          icon={<Quote size={18} />}
          title="Цитата"
          active={editor.isActive('blockquote')}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Insert Elements */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          icon={<Code size={18} />}
          title="Блок кода"
          active={editor.isActive('codeBlock')}
        />
        <Button
          onClick={insertTable}
          icon={<TableIcon size={18} />}
          title="Вставить таблицу"
        />
        <Button
          onClick={addLink}
          icon={<Link size={18} />}
          title="Вставить ссылку"
        />
        <Button
          onClick={onAddImage}
          icon={<ImageIcon size={18} />}
          title="Вставить изображение"
        />
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={<Copy size={18} />}
          title="Горизонтальная линия"
        />
      </div>

      <div className="toolbar-divider" />

      {/* Clear Formatting */}
      <div className="toolbar-group">
        <Button
          onClick={() => editor.chain().focus().clearNodes().run()}
          icon={<Type size={18} />}
          title="Очистить форматирование"
        />
      </div>
    </div>
  );
};

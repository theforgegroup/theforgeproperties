
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Undo, Redo, Code, Link as LinkIcon, Quote
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const [currentBlock, setCurrentBlock] = useState('P');

  // Sync initial value or external updates to editor content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current && !isCodeView && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '<p><br></p>';
    }
  }, [value, isCodeView]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => isInternalChange.current = false, 0);
    }
  };

  const execCommand = (command: string, ui: boolean = false, val: string | undefined = undefined) => {
    if (isCodeView) return;
    
    // Ensure editor is focused before executing command
    editorRef.current?.focus();
    
    // For lists, some browsers require specific handling if current selection is empty
    // But standard execCommand should work fine for basic usage
    document.execCommand(command, ui, val);
    handleInput();
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentBlock(val);
    // Use the standard formatBlock command with the tag name
    execCommand('formatBlock', false, val);
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      execCommand('createLink', false, url);
    }
  };

  const toggleCodeView = () => {
    setIsCodeView(!isCodeView);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    onClick,
    title,
    disabled = false,
    active = false
  }: { 
    icon: any, 
    onClick: () => void, 
    title: string,
    disabled?: boolean,
    active?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        active ? 'bg-forge-gold text-forge-navy' : 
        disabled ? 'text-slate-300 cursor-not-allowed' : 
        'text-slate-600 hover:text-forge-navy hover:bg-slate-100'
      }`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white flex flex-col h-[600px] shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        
        {/* 1. Headings Dropdown (P, H1-H6) - No 'T' icon */}
        <div className="flex items-center border-r border-slate-200 pr-2 mr-1">
          <select 
            value={currentBlock}
            onChange={handleBlockChange}
            disabled={isCodeView}
            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer py-1 max-w-[140px] ml-1"
          >
            <option value="P">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
            <option value="H4">Heading 4</option>
            <option value="H5">Heading 5</option>
            <option value="H6">Heading 6</option>
            <option value="PRE">Preformatted</option>
          </select>
        </div>

        {/* 2. Standard Formatting */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="Bold" disabled={isCodeView} />
          <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="Italic" disabled={isCodeView} />
          <ToolbarButton icon={LinkIcon} onClick={insertLink} title="Insert Link" disabled={isCodeView} />
        </div>

        {/* 3. Alignment */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" disabled={isCodeView} />
          <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" disabled={isCodeView} />
          <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Align Right" disabled={isCodeView} />
        </div>

        {/* 4. Lists & Quote Group (Bullet, Numbered, Quote) */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
           <ToolbarButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" disabled={isCodeView} />
           <ToolbarButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" disabled={isCodeView} />
           <ToolbarButton icon={Quote} onClick={() => execCommand('formatBlock', false, 'BLOCKQUOTE')} title="Blockquote" disabled={isCodeView} />
        </div>

        {/* 5. Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Undo} onClick={() => execCommand('undo')} title="Undo" disabled={isCodeView} />
          <ToolbarButton icon={Redo} onClick={() => execCommand('redo')} title="Redo" disabled={isCodeView} />
        </div>

        {/* 6. Code View Toggle */}
        <div className="ml-auto flex items-center border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={toggleCodeView}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                isCodeView 
                  ? 'bg-forge-navy text-white' 
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Code size={14} />
              {isCodeView ? 'Visual' : 'Code'}
            </button>
        </div>
      </div>

      {/* Editor Area */}
      {isCodeView ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow p-6 w-full h-full bg-slate-900 text-green-400 font-mono text-sm leading-relaxed focus:outline-none resize-none"
          spellCheck={false}
        />
      ) : (
        <div 
          ref={editorRef}
          className="flex-grow p-8 overflow-y-auto focus:outline-none prose max-w-none font-serif text-lg leading-relaxed text-slate-700 article-content"
          contentEditable
          onInput={handleInput}
          spellCheck={true}
          style={{ minHeight: '400px' }}
        />
      )}
      
      <div className="bg-slate-50 border-t border-slate-100 p-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right px-4 flex justify-between items-center">
        <span>{isCodeView ? 'HTML SOURCE MODE' : 'VISUAL EDITOR MODE'}</span>
        <span>{value.length} Characters</span>
      </div>
    </div>
  );
};

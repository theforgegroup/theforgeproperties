
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Quote, Undo, Redo, Code, Type
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
      editorRef.current.innerHTML = value;
    }
  }, [value, isCodeView]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
      // Reset flag after a short delay to allow external updates again if needed
      setTimeout(() => isInternalChange.current = false, 0);
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    // Ensure the editor keeps focus
    if (!isCodeView) {
      editorRef.current?.focus();
      handleInput();
    }
  };

  const handleBlockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentBlock(val);
    execCommand('formatBlock', val);
  };

  const toggleCodeView = () => {
    setIsCodeView(!isCodeView);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg = undefined, 
    title,
    disabled = false
  }: { 
    icon: any, 
    command: string, 
    arg?: string, 
    title: string,
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command, arg)}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        disabled 
          ? 'text-slate-300 cursor-not-allowed' 
          : 'text-slate-600 hover:text-forge-navy hover:bg-slate-100'
      }`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white flex flex-col h-[600px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        
        {/* 1. Format Block Dropdown (First Item) */}
        <div className="flex items-center border-r border-slate-200 pr-2 mr-1">
          <Type size={18} className="text-slate-400 mr-2 ml-1" />
          <select 
            value={currentBlock}
            onChange={handleBlockChange}
            disabled={isCodeView}
            className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer py-1"
          >
            <option value="P">Normal Text</option>
            <option value="H2">Heading 1 (H2)</option>
            <option value="H3">Heading 2 (H3)</option>
            <option value="H4">Heading 3 (H4)</option>
            <option value="BLOCKQUOTE">Quote</option>
            <option value="PRE">Code Block</option>
          </select>
        </div>

        {/* 2. Standard Formatting */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={Bold} command="bold" title="Bold" disabled={isCodeView} />
          <ToolbarButton icon={Italic} command="italic" title="Italic" disabled={isCodeView} />
        </div>

        {/* 3. Alignment */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" disabled={isCodeView} />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" disabled={isCodeView} />
          <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" disabled={isCodeView} />
        </div>

        {/* 4. Lists & Quotes */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
           <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" disabled={isCodeView} />
           <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" disabled={isCodeView} />
           <ToolbarButton icon={Quote} command="formatBlock" arg="BLOCKQUOTE" title="Quote" disabled={isCodeView} />
        </div>

        {/* 5. Undo/Redo (Moved here) */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={Undo} command="undo" title="Undo" disabled={isCodeView} />
          <ToolbarButton icon={Redo} command="redo" title="Redo" disabled={isCodeView} />
        </div>

        {/* 6. Code View Toggle (Far Right) */}
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
          className="flex-grow p-6 overflow-y-auto focus:outline-none prose max-w-none font-serif text-lg leading-relaxed text-slate-700"
          contentEditable
          onInput={handleInput}
          spellCheck={true}
        />
      )}
      
      <div className="bg-slate-50 border-t border-slate-100 p-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right px-4 flex justify-between items-center">
        <span>{isCodeView ? 'HTML SOURCE MODE' : 'VISUAL EDITOR MODE'}</span>
        <span>{value.length} Characters</span>
      </div>
    </div>
  );
};

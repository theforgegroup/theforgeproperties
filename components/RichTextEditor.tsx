
import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Quote, Link as LinkIcon, Undo, Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync initial value or external updates to editor content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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
    editorRef.current?.focus();
    handleInput();
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg = undefined, 
    title 
  }: { 
    icon: any, 
    command: string, 
    arg?: string, 
    title: string 
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command, arg)}
      className="p-2 text-slate-600 hover:text-forge-navy hover:bg-slate-100 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-sm overflow-hidden bg-white flex flex-col h-[500px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={Undo} command="undo" title="Undo" />
          <ToolbarButton icon={Redo} command="redo" title="Redo" />
        </div>
        
        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={Bold} command="bold" title="Bold" />
          <ToolbarButton icon={Italic} command="italic" title="Italic" />
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={Heading1} command="formatBlock" arg="H2" title="Heading 1" />
          <ToolbarButton icon={Heading2} command="formatBlock" arg="H3" title="Heading 2" />
          <ToolbarButton icon={Quote} command="formatBlock" arg="BLOCKQUOTE" title="Quote" />
        </div>

        <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
          <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        </div>

        <div className="flex items-center gap-1">
           <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
           <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        className="flex-grow p-6 overflow-y-auto focus:outline-none prose max-w-none font-serif text-lg leading-relaxed text-slate-700"
        contentEditable
        onInput={handleInput}
        spellCheck={true}
      />
      
      <div className="bg-slate-50 border-t border-slate-100 p-2 text-[10px] text-slate-400 uppercase tracking-wider font-bold text-right px-4">
        Classic Editor Mode
      </div>
    </div>
  );
};

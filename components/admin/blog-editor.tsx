'use client';

import { useState, useEffect, useMemo } from 'react';
import { Editor } from '@/components/blocks/editor-x/editor';
import { SerializedEditorState } from 'lexical';

interface BlogEditorProps {
  value?: string; // HTML content or Lexical JSON string
  onChange?: (serializedState: SerializedEditorState) => void;
  placeholder?: string;
}

export function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  const [serializedState, setSerializedState] = useState<SerializedEditorState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse the value to determine if it's Lexical state or HTML
  const parsedState = useMemo(() => {
    if (!value) return null;
    
    try {
      const parsed = JSON.parse(value);
      if (parsed && parsed.root) {
        return parsed as SerializedEditorState;
      }
    } catch {
      // Not JSON, treat as HTML
      return null;
    }
    return null;
  }, [value]);

  useEffect(() => {
    // Update serialized state when parsed state changes
    if (parsedState) {
      setSerializedState(parsedState);
    } else {
      setSerializedState(null);
    }
    setIsInitialized(true);
  }, [parsedState]);

  const handleSerializedChange = (state: SerializedEditorState) => {
    setSerializedState(state);
    onChange?.(state);
  };

  if (!isInitialized) {
    return (
      <div className='flex items-center justify-center h-64 border rounded-lg'>
        <p className='text-muted-foreground'>Loading editor...</p>
      </div>
    );
  }

  // Use a key based on the value to force remount when content changes
  // This ensures the editor loads the new content properly since LexicalComposer
  // only reads initialConfig on mount
  const editorKey = value 
    ? `editor-${value.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '')}-${value.length}` 
    : 'editor-empty';

  return (
    <div className='space-y-2'>
      <Editor
        key={editorKey}
        editorSerializedState={serializedState || undefined}
        onSerializedChange={handleSerializedChange}
      />
    </div>
  );
}

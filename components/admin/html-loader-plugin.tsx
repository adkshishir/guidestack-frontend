'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

interface HTMLLoaderPluginProps {
  html: string;
  onLoadComplete?: () => void;
}

export function HTMLLoaderPlugin({ html, onLoadComplete }: HTMLLoaderPluginProps) {
  const [editor] = useLexicalComposerContext();
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!html || loadedRef.current) {
      onLoadComplete?.();
      return;
    }

    editor.update(() => {
      try {
        // Try to parse as JSON first (Lexical serialized state)
        const parsed = JSON.parse(html);
        if (parsed && parsed.root) {
          // It's already Lexical state, set it directly
          const editorState = editor.parseEditorState(parsed);
          editor.setEditorState(editorState);
          loadedRef.current = true;
          onLoadComplete?.();
          return;
        }
      } catch {
        // Not JSON, treat as HTML
      }

      // Convert HTML to Lexical nodes
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
      
      loadedRef.current = true;
      onLoadComplete?.();
    });
  }, [html, editor, onLoadComplete]);

  return null;
}


'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateNodesFromDOM, $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

interface HtmlBridgePluginProps {
  /** Existing post HTML to load into the editor once, on mount. */
  initialHtml?: string;
  /** Called with serialized HTML whenever the document content changes. */
  onHtmlChange?: (html: string) => void;
}

/**
 * Keeps the editor HTML-in / HTML-out.
 *
 * The public site renders `blogContent.htmlContent` as raw HTML (see
 * `processContent` in lib/blog-utils.ts), and the AI generation pipeline writes
 * HTML too — so the editor has to both read and write that format. Storing
 * Lexical's serialized JSON in the same column would render as visible JSON on
 * the live page.
 */
export function HtmlBridgePlugin({
  initialHtml,
  onHtmlChange,
}: HtmlBridgePluginProps) {
  const [editor] = useLexicalComposerContext();
  const loadedRef = useRef(false);
  // Held in a ref so a new inline callback each render doesn't re-register the
  // update listener (and so the listener never closes over a stale one).
  const onHtmlChangeRef = useRef(onHtmlChange);
  onHtmlChangeRef.current = onHtmlChange;

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    if (!initialHtml) return;

    editor.update(() => {
      const dom = new DOMParser().parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      // $insertNodes inserts at the current selection, so the cleared root needs
      // to be selected first or the nodes are silently dropped.
      root.select();
      $insertNodes(nodes);
    });
  }, [editor, initialHtml]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        // Ignore selection-only updates — they would mark the form dirty on a
        // simple click without the content having changed.
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        editorState.read(() => {
          onHtmlChangeRef.current?.($generateHtmlFromNodes(editor, null));
        });
      },
    );
  }, [editor]);

  return null;
}

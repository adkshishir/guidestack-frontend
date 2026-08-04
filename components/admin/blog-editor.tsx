'use client';

import { Editor } from '@/components/blocks/editor-x/editor';
import { HtmlBridgePlugin } from './html-bridge-plugin';

interface BlogEditorProps {
  /** Post HTML to edit. Only the value present on first mount is loaded. */
  value?: string;
  /** Receives the edited content as HTML, ready to send straight to the API. */
  onChange?: (html: string) => void;
  placeholder?: string;
}

/**
 * Rich text editor for blog content. HTML in, HTML out — matching what the API
 * stores in `blogContent.htmlContent` and what the public site renders.
 */
export function BlogEditor({ value, onChange }: BlogEditorProps) {
  return (
    <div className='space-y-2'>
      <Editor>
        <HtmlBridgePlugin initialHtml={value} onHtmlChange={onChange} />
      </Editor>
    </div>
  );
}

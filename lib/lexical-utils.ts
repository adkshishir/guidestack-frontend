import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from 'lexical';
import { SerializedEditorState } from 'lexical';

/**
 * Convert Lexical editor state to HTML string
 */
export async function lexicalToHTML(
  editor: LexicalEditor,
  editorState?: EditorState
): Promise<string> {
  return new Promise((resolve) => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const htmlString = root.getTextContent();
      // For now, return text content. In production, you'd want to use
      // $generateNodesFromDOM or a proper HTML serializer
      resolve(htmlString);
    });
  });
}

/**
 * Convert HTML string to Lexical serialized state
 */
export async function htmlToLexical(
  editor: LexicalEditor,
  html: string
): Promise<SerializedEditorState | null> {
  return new Promise((resolve) => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().clear();
      $insertNodes(nodes);
      const editorState = editor.getEditorState();
      resolve(editorState.toJSON());
    });
  });
}

/**
 * Convert serialized Lexical state to HTML
 * This is a simplified version - you may want to use a proper serializer
 */
export function serializedStateToHTML(
  serializedState: SerializedEditorState
): string {
  // Extract text content from serialized state
  // This is a basic implementation - you'd want a proper HTML serializer
  if (!serializedState?.root?.children) {
    return '';
  }

  const extractText = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }
    if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  };

  return serializedState.root.children.map(extractText).join('\n');
}

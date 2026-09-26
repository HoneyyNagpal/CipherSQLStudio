import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import './SqlEditor.scss';

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  lineHeight: 22,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  cursorBlinking: 'smooth',
  renderLineHighlight: 'all',
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  padding: { top: 12, bottom: 12 },
  suggest: {
    showKeywords: true,
    showSnippets: true,
  },
};

const SqlEditor = ({ value, onChange, onExecute, onExplain, isExecuting, isExplaining }) => {
  const editorRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register Ctrl+Enter / Cmd+Enter to execute query
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => {
        if (!isExecuting) onExecute();
      }
    );

    // Basic SQL keyword completions
    monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: (model, position) => {
        const keywords = [
          'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
          'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'AS',
          'AND', 'OR', 'NOT', 'IN', 'NOT IN', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL',
          'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
          'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
          'WITH', 'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
          'OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
          'CURRENT_DATE', 'CURRENT_TIMESTAMP',
        ];

        const suggestions = keywords.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - 1,
            endColumn: position.column,
          },
        }));

        return { suggestions };
      },
    });
  };

  return (
    <div className="sql-editor">
      <div className="sql-editor__header panel-header">
        <span className="panel-header__title">SQL Query</span>
        <div className="sql-editor__actions">
          <span className="sql-editor__shortcut">Ctrl+Enter to run</span>
          <button
            className={`btn btn--secondary btn--sm${isExplaining ? ' btn--loading' : ''}`}
            onClick={onExplain}
            disabled={isExplaining || isExecuting}
            title="Show query plan (EXPLAIN ANALYZE)"
          >
            {!isExplaining && '📊'}
            {isExplaining ? '' : ' Show Query Plan'}
          </button>
          <button
            className={`btn btn--success btn--sm${isExecuting ? ' btn--loading' : ''}`}
            onClick={onExecute}
            disabled={isExecuting}
            title="Execute query (Ctrl+Enter)"
          >
            {!isExecuting && '▶'}
            {isExecuting ? '' : ' Run Query'}
          </button>
        </div>
      </div>

      <div className="sql-editor__monaco-wrapper">
        <Editor
          height="100%"
          language="sql"
          value={value}
          onChange={onChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={MONACO_OPTIONS}
          loading={
            <div className="sql-editor__loading">
              <span>Loading editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SqlEditor;
import './ResultsPanel.scss';

const ResultsPanel = ({ result, isExecuting }) => {
  if (isExecuting) {
    return (
      <div className="results-panel">
        <div className="results-panel__header panel-header">
          <span className="panel-header__title">Results</span>
        </div>
        <div className="results-panel__executing">
          <div className="results-panel__spinner" />
          <span>Executing query...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="results-panel__header panel-header">
          <span className="panel-header__title">Results</span>
        </div>
        <div className="results-panel__empty">
          <div className="results-panel__empty-icon">⬡</div>
          <p>Write a SQL query and click <strong>Run Query</strong> to see results</p>
          <span className="results-panel__shortcut">Ctrl+Enter</span>
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="results-panel">
        <div className="results-panel__header panel-header">
          <span className="panel-header__title">Results</span>
          <span className="results-panel__status results-panel__status--error">Error</span>
        </div>
        <div className="results-panel__error">
          <div className="results-panel__error-icon">✕</div>
          <div className="results-panel__error-content">
            <strong>Query Error</strong>
            <pre>{result.error}</pre>
            {result.executionTime && (
              <span className="results-panel__meta">
                Failed in {result.executionTime}ms
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { columns, rows, rowCount, executionTime } = result;

  return (
    <div className="results-panel">
      <div className="results-panel__header panel-header">
        <span className="panel-header__title">Results</span>
        <div className="results-panel__header-right">
          <span className="results-panel__status results-panel__status--success">
            {rowCount} row{rowCount !== 1 ? 's' : ''}
          </span>
          {executionTime && (
            <span className="results-panel__time">{executionTime}ms</span>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="results-panel__empty">
          <p>Query executed successfully. No rows returned.</p>
        </div>
      ) : (
        <div className="results-panel__table-wrapper">
          <table className="results-panel__table">
            <thead>
              <tr>
                <th className="results-panel__row-num">#</th>
                {columns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="results-panel__row-num">{rowIndex + 1}</td>
                  {columns.map(col => (
                    <td key={col}>
                      {row[col] === null ? (
                        <span className="results-panel__null">NULL</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;

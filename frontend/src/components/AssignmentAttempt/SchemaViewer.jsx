import { useState } from 'react';
import './SchemaViewer.scss';

const SchemaViewer = ({ schemas, sampleData, loading }) => {
  const [activeTable, setActiveTable] = useState(null);
  const [view, setView] = useState('schema'); // 'schema' | 'data'

  const tables = schemas ? Object.keys(schemas) : [];

  // Auto-select first table
  if (tables.length > 0 && activeTable === null) {
    setActiveTable(tables[0]);
  }

  if (loading) {
    return (
      <div className="schema-viewer">
        <div className="schema-viewer__header panel-header">
          <span className="panel-header__title">Schema</span>
        </div>
        <div className="schema-viewer__loading">
          <span>Loading schema...</span>
        </div>
      </div>
    );
  }

  if (!schemas || tables.length === 0) {
    return (
      <div className="schema-viewer">
        <div className="schema-viewer__header panel-header">
          <span className="panel-header__title">Schema</span>
        </div>
        <div className="schema-viewer__empty">
          <span>No schema available</span>
        </div>
      </div>
    );
  }

  const activeColumns = activeTable ? schemas[activeTable] : [];
  const activeData = activeTable && sampleData ? sampleData[activeTable] : null;

  return (
    <div className="schema-viewer">
      <div className="schema-viewer__header panel-header">
        <span className="panel-header__title">Schema</span>
        <div className="schema-viewer__toggle">
          <button
            className={`schema-viewer__toggle-btn${view === 'schema' ? ' schema-viewer__toggle-btn--active' : ''}`}
            onClick={() => setView('schema')}
          >
            Columns
          </button>
          <button
            className={`schema-viewer__toggle-btn${view === 'data' ? ' schema-viewer__toggle-btn--active' : ''}`}
            onClick={() => setView('data')}
          >
            Sample Data
          </button>
        </div>
      </div>

      <div className="schema-viewer__tables">
        {tables.map(tableName => (
          <button
            key={tableName}
            className={`schema-viewer__table-btn${activeTable === tableName ? ' schema-viewer__table-btn--active' : ''}`}
            onClick={() => setActiveTable(tableName)}
          >
            <span className="schema-viewer__table-icon">⬡</span>
            <span>{tableName}</span>
          </button>
        ))}
      </div>

      <div className="schema-viewer__content">
        {view === 'schema' && (
          <div className="schema-viewer__columns">
            {activeColumns.map(col => (
              <div key={col.column_name} className="schema-viewer__col-row">
                <div className="schema-viewer__col-name">{col.column_name}</div>
                <div className="schema-viewer__col-type">
                  <span className={`schema-viewer__type-badge schema-viewer__type-badge--${getTypeClass(col.data_type)}`}>
                    {formatType(col.data_type, col.character_maximum_length)}
                  </span>
                  {col.is_nullable === 'NO' && (
                    <span className="schema-viewer__constraint">NOT NULL</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'data' && activeData && (
          <div className="schema-viewer__sample-wrapper">
            <table className="schema-viewer__sample-table">
              <thead>
                <tr>
                  {activeData.columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeData.rows.map((row, i) => (
                  <tr key={i}>
                    {activeData.columns.map(col => (
                      <td key={col}>
                        {row[col] === null
                          ? <span className="schema-viewer__null">NULL</span>
                          : String(row[col])
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="schema-viewer__sample-note">
              Showing 5 sample rows
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getTypeClass = (dataType) => {
  if (dataType.includes('int') || dataType.includes('numeric') || dataType.includes('real')) return 'num';
  if (dataType.includes('char') || dataType.includes('text')) return 'str';
  if (dataType.includes('date') || dataType.includes('time')) return 'date';
  if (dataType === 'boolean') return 'bool';
  return 'other';
};

const formatType = (dataType, maxLen) => {
  const base = dataType.replace('character varying', 'varchar').replace('integer', 'int');
  return maxLen ? `${base}(${maxLen})` : base;
};

export default SchemaViewer;

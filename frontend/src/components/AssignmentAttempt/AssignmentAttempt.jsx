import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchAssignment,
  fetchSchema,
  fetchSampleData,
  executeQuery,
  fetchAttempts,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SqlEditor from '../Editor/SqlEditor';
import ResultsPanel from '../Results/ResultsPanel';
import SchemaViewer from './SchemaViewer';
import HintsPanel from '../Hints/HintsPanel';
import './AssignmentAttempt.scss';

const DEFAULT_QUERY = '-- Write your SQL query here\n-- Press Ctrl+Enter to run\n\nSELECT\n\n';

const AssignmentAttempt = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Data loading state
  const [assignment, setAssignment]   = useState(null);
  const [schemas, setSchemas]         = useState(null);
  const [sampleData, setSampleData]   = useState(null);
  const [loadError, setLoadError]     = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Query state
  const [sql, setSql]                 = useState(DEFAULT_QUERY);
  const [result, setResult]           = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastError, setLastError]     = useState('');

  // Attempt history panel
  const [showHistory, setShowHistory] = useState(false);
  const [attempts, setAttempts]       = useState([]);

  // Load assignment data
  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        const [asgn, sch, sd] = await Promise.all([
          fetchAssignment(id),
          fetchSchema(id),
          fetchSampleData(id),
        ]);
        setAssignment(asgn);
        setSchemas(sch);
        setSampleData(sd);
      } catch (err) {
        setLoadError(err.response?.data?.error || 'Failed to load assignment.');
      } finally {
        setDataLoading(false);
      }
    };
    load();
  }, [id]);

  // Load past attempts if user is logged in
  useEffect(() => {
    if (!user || !id) return;
    fetchAttempts(id)
      .then(setAttempts)
      .catch(() => {}); // Silently fail - attempts are optional
  }, [user, id]);

  const handleExecute = useCallback(async () => {
    if (isExecuting || !sql.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      const res = await executeQuery(id, sql);
      setResult(res);
      if (!res.success) {
        setLastError(res.error || '');
      } else {
        setLastError('');
      }

      // Refresh attempts list if user is logged in
      if (user) {
        fetchAttempts(id).then(setAttempts).catch(() => {});
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to connect to server.';
      setResult({ success: false, error: errMsg });
      setLastError(errMsg);
    } finally {
      setIsExecuting(false);
    }
  }, [id, sql, isExecuting, user]);

  const loadAttemptQuery = (attemptQuery) => {
    setSql(attemptQuery);
    setShowHistory(false);
  };

  if (dataLoading) {
    return (
      <div className="attempt-page">
        <div className="attempt-loading">
          <div style={{ width: 28, height: 28, border: '2px solid #30363d', borderTopColor: '#58a6ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span>Loading assignment...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="attempt-page">
        <div className="attempt-error">
          <strong>Failed to load</strong>
          <p>{loadError}</p>
          <Link to="/">← Back to assignments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="attempt-page">
      {/* Top bar */}
      <div className="attempt-topbar">
        <div className="attempt-topbar__left">
          <Link to="/" className="attempt-topbar__back" title="Back to assignments">
            ← Back
          </Link>
          <div className="attempt-topbar__title-group">
            <div className="attempt-topbar__title">{assignment?.title}</div>
            <div className="attempt-topbar__meta">
              <span className={`badge badge--${assignment?.difficulty}`}>
                {assignment?.difficulty}
              </span>
              {assignment?.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="badge badge--tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="attempt-topbar__right">
          {user && (
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => setShowHistory(prev => !prev)}
              title="View past attempts"
            >
              History {attempts.length > 0 && `(${attempts.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="attempt-workspace">
        {/* Left - Question + Schema */}
        <div className="attempt-left">
          <div className="question-panel">
            <div className="question-panel__header panel-header">
              <span className="panel-header__title">Question</span>
            </div>
            <div className="question-panel__body">
              <div className="question-panel__text">
                {assignment?.question}
              </div>
            </div>

            <div className="question-panel__schema-divider">
              <SchemaViewer
                schemas={schemas}
                sampleData={sampleData}
                loading={false}
              />
            </div>
          </div>
        </div>

        {/* Right - Editor + Results + Hints */}
        <div className="attempt-right">
          {/* Editor + Results column */}
          <div className="attempt-editor-col">
            <div className="attempt-editor-wrap">
              <SqlEditor
                value={sql}
                onChange={setSql}
                onExecute={handleExecute}
                isExecuting={isExecuting}
              />
            </div>
            <div className="attempt-results-wrap">
              <ResultsPanel result={result} isExecuting={isExecuting} />
            </div>
          </div>

          {/* Hints column */}
          <div className="attempt-hints-col">
            <HintsPanel
              assignmentId={id}
              currentQuery={sql}
              lastError={lastError}
            />
          </div>
        </div>
      </div>

      {/* Attempt history drawer */}
      {user && (
        <div className={`attempt-history${showHistory ? ' attempt-history--open' : ''}`}>
          <div className="attempt-history__header panel-header">
            <span className="panel-header__title">Past Attempts</span>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className="attempt-history__list">
            {attempts.length === 0 ? (
              <div className="attempt-history__empty">No attempts yet</div>
            ) : (
              attempts.map(attempt => (
                <div
                  key={attempt._id}
                  className={`attempt-history__item${attempt.wasSuccessful ? ' attempt-history__item--success' : ' attempt-history__item--failed'}`}
                  onClick={() => loadAttemptQuery(attempt.query)}
                  title="Click to load this query"
                >
                  <div className="attempt-history__item-query">{attempt.query}</div>
                  <div className="attempt-history__item-meta">
                    <span>{attempt.wasSuccessful ? `✓ ${attempt.rowCount} rows` : '✕ error'}</span>
                    <span>{new Date(attempt.executedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentAttempt;

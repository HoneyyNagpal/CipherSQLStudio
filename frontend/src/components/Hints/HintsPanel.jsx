import { useState } from 'react';
import { fetchHint } from '../../services/api';
import './HintsPanel.scss';

const HintsPanel = ({ assignmentId, currentQuery, lastError }) => {
  const [hints, setHints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionPart, setQuestionPart] = useState('');
  const [error, setError] = useState(null);

  const requestHint = async () => {
    if (!assignmentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const hint = await fetchHint({
        assignmentId,
        currentQuery: currentQuery || '',
        errorMessage: lastError || '',
        questionPart: questionPart.trim(),
      });

      setHints(prev => [
        { text: hint, timestamp: new Date().toLocaleTimeString(), id: Date.now() },
        ...prev,
      ]);
      setQuestionPart('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to get hint. Check your API key.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hints-panel">
      <div className="hints-panel__header panel-header">
        <div className="hints-panel__header-left">
          <span className="panel-header__title">Hints</span>
          <span className="hints-panel__badge">AI-Powered</span>
        </div>
        {hints.length > 0 && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setHints([])}
          >
            Clear
          </button>
        )}
      </div>

      <div className="hints-panel__input-area">
        <textarea
          className="hints-panel__question-input"
          placeholder="Stuck on something specific? Describe it (optional)..."
          value={questionPart}
          onChange={e => setQuestionPart(e.target.value)}
          rows={2}
          maxLength={200}
          disabled={isLoading}
        />
        <button
          className={`btn btn--primary hints-panel__get-btn${isLoading ? ' btn--loading' : ''}`}
          onClick={requestHint}
          disabled={isLoading}
        >
          {isLoading ? '' : '💡 Get Hint'}
        </button>
      </div>

      {lastError && (
        <div className="hints-panel__context-note">
          <span>💬 Your last error will be included in the hint context</span>
        </div>
      )}

      {error && (
        <div className="hints-panel__error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <div className="hints-panel__hints-list">
        {hints.length === 0 && !isLoading && (
          <div className="hints-panel__empty">
            <div className="hints-panel__empty-icon">💡</div>
            <p>Click <strong>Get Hint</strong> for AI guidance</p>
            <span>You'll get hints, not solutions — to help you learn</span>
          </div>
        )}

        {hints.map(hint => (
          <div key={hint.id} className="hints-panel__hint-card fade-in">
            <div className="hints-panel__hint-header">
              <span className="hints-panel__hint-label">Hint</span>
              <span className="hints-panel__hint-time">{hint.timestamp}</span>
            </div>
            <p className="hints-panel__hint-text">{hint.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className="hints-panel__generating">
            <div className="hints-panel__dots">
              <span /><span /><span />
            </div>
            <span>Generating hint...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HintsPanel;

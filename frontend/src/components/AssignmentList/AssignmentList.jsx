import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAssignments } from '../../services/api';
import './AssignmentList.scss';

const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-card__line skeleton-card__line--short" />
    <div className="skeleton-card__line skeleton-card__line--medium" />
    <div className="skeleton-card__line skeleton-card__line--long" />
    <div className="skeleton-card__line skeleton-card__line--full" />
    <div className="skeleton-card__line skeleton-card__line--medium" />
  </div>
);

const AssignmentCard = ({ assignment, index }) => {
  const diffClass = `badge badge--${assignment.difficulty}`;

  return (
    <Link
      to={`/assignment/${assignment.id}`}
      className="assignment-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="assignment-card__header">
        <span className="assignment-card__number">#{String(index + 1).padStart(2, '0')}</span>
        <span className={diffClass}>{assignment.difficulty}</span>
      </div>

      <div className="assignment-card__body">
        <h2 className="assignment-card__title">{assignment.title}</h2>
        <p className="assignment-card__description">{assignment.description}</p>
      </div>

      <div className="assignment-card__footer">
        <div className="assignment-card__tags">
          {assignment.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge--tag">{tag}</span>
          ))}
          {assignment.tags.length > 3 && (
            <span className="badge badge--tag">+{assignment.tags.length - 3}</span>
          )}
        </div>
        <div className="assignment-card__meta">
          <span>{assignment.tableCount} tables</span>
          <span className="assignment-card__arrow">→</span>
        </div>
      </div>
    </Link>
  );
};

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAssignments();
        // Sort by difficulty
        data.sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
        setAssignments(data);
      } catch {
        setError('Failed to load assignments. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all'
    ? assignments
    : assignments.filter(a => a.difficulty === filter);

  return (
    <div className="assignment-list-page">
      <div className="assignment-list__header">
        <h1><span>{"<"}</span>SQL Assignments<span>{" />"}</span></h1>
        <p>Select an assignment to practice your SQL skills. Execute queries against real data.</p>
      </div>

      <div className="assignment-list__filters">
        {['all', 'easy', 'medium', 'hard'].map(level => (
          <button
            key={level}
            className={`assignment-list__filter-btn${filter === level ? ' assignment-list__filter-btn--active' : ''}`}
            onClick={() => setFilter(level)}
          >
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="assignment-list__loading">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && (
        <div className="assignment-list__empty">
          <p>⚠️ Error</p>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="assignment-list__grid">
          {filtered.length === 0 ? (
            <div className="assignment-list__empty" style={{ gridColumn: '1/-1' }}>
              <p>No assignments found</p>
              <span>Try a different filter</span>
            </div>
          ) : (
            filtered.map((a, i) => (
              <AssignmentCard key={a.id} assignment={a} index={i} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

const ActivityCard = () => {
  const navigate = useNavigate();
  const notes = useAppStore((s) => s.notes);
  const [query, setQuery] = useState('');

  const results = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.body.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="grid-card card-activity">
      <h2 className="card-title">Activity</h2>
      <hr className="card-divider" />
      <div className="activity-search-bar">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="activity-search-input"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <img src="/assets/mic.svg" className="mic-icon" alt="mic" />
      </div>
      {results.length > 0 && (
        <div className="activity-results">
          {results.map((note) => (
            <div
              key={note.id}
              className="activity-result-item"
              onClick={() => navigate(`/editor/${note.id}`)}
            >
              📄 {note.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;

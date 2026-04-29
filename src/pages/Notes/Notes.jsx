import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import NoteCard from './NoteCard';
import './Notes.css';

const Notes = () => {
  const navigate = useNavigate();
  const notes = useAppStore((s) => s.notes);

  return (
    <div className="notes-wrapper">
      <div className="notes-grid">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onClick={() => navigate(`/editor/${note.id}`)}
          />
        ))}
      </div>

      {/* Floating add button */}
      <button
        className="add-note-fab"
        onClick={() => navigate('/editor/new')}
        title="Create new note"
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
};

export default Notes;

import useAppStore from '../../store/useAppStore';

const NoteCard = ({ note, onClick }) => {
  const deleteNote = useAppStore((s) => s.deleteNote);

  const lastWatered = new Date(note.lastWatered).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const snippet = note.body.length > 60 ? note.body.slice(0, 60) + '...' : note.body;

  const handleDelete = (e) => {
    e.stopPropagation(); // Don't navigate to editor
    if (window.confirm(`Delete "${note.title}"?`)) {
      deleteNote(note.id);
    }
  };

  return (
    <div className="note-card" onClick={onClick}>
      {/* Delete button */}
      <button
        className="note-card-delete"
        onClick={handleDelete}
        title="Delete this note"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>

      <h2 className="note-card-title">{note.category}</h2>
      <hr className="note-card-divider" />
      <p className="note-card-label">
        <strong>Title:</strong> {note.title}
      </p>
      <p className="note-card-label">
        <strong>Last Watered:</strong> {lastWatered}
      </p>
      <p className="note-card-preview">{snippet}</p>
    </div>
  );
};

export default NoteCard;

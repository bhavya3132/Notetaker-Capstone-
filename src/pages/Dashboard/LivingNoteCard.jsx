import { useNavigate } from 'react-router-dom';

const LivingNoteCard = ({ note }) => {
  const navigate = useNavigate();

  if (!note) return null;

  const snippet = note.body.length > 80 ? note.body.slice(0, 80) + '...' : note.body;
  const lastWatered = new Date(note.lastWatered).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className="grid-card card-living-note"
      onClick={() => navigate(`/editor/${note.id}`)}
    >
      <h2 className="card-title">Living Note</h2>
      <hr className="card-divider" />
      <p className="card-label">
        <strong>Title:</strong> {note.title}
      </p>
      <p className="card-label">
        <strong>Last Watered:</strong> {lastWatered}
      </p>
      <p className="card-preview">{snippet}</p>
    </div>
  );
};

export default LivingNoteCard;

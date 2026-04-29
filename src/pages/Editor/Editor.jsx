import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAppStore from '../../store/useAppStore';
import './Editor.css';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notes = useAppStore((s) => s.notes);
  const addNote = useAppStore((s) => s.addNote);
  const updateNote = useAppStore((s) => s.updateNote);

  const isNew = id === 'new';
  const existingNote = !isNew ? notes.find((n) => n.id === id) : null;

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing note data
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setTags(existingNote.tags.join(', '));
      setBody(existingNote.body);
      setCategory(existingNote.category);
    }
  }, [existingNote]);

  const handleSave = () => {
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (isNew) {
      const newId = addNote({
        title: title || 'Untitled',
        body,
        tags: tagArray,
        category: category || 'Uncategorized',
      });
      setSaved(true);
      setTimeout(() => {
        navigate(`/editor/${newId}`, { replace: true });
      }, 500);
    } else {
      updateNote(id, {
        title,
        body,
        tags: tagArray,
        category,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="editor-page">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button className="editor-back-btn" onClick={() => navigate('/notes')}>
          ← Back
        </button>
        <div className="editor-toolbar-actions">
          <button
            className={`editor-preview-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
          <button className="editor-save-btn" onClick={handleSave}>
            {saved ? '✓ Saved' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        className="editor-title"
        placeholder="Untitled"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Category + Tags row */}
      <div className="editor-meta-row">
        <input
          type="text"
          className="editor-category"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          className="editor-tags"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      {/* Tag chips */}
      {tags && (
        <div className="editor-tag-chips">
          {tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag, i) => (
              <span key={i} className="editor-tag-chip">
                {tag}
              </span>
            ))}
        </div>
      )}

      {/* Body */}
      <div className="editor-body-area">
        {showPreview ? (
          <div className="editor-preview-pane">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {body || '*Start writing...*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="editor-textarea"
            placeholder="Start writing your note... (Markdown supported: # H1, ## H2, **bold**, *italic*, - lists)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default Editor;

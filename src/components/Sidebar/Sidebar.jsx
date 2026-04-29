import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const {
    notes,
    recentNotes,
    settings,
    toggleSidebar,
  } = useAppStore();

  const collapsed = settings.sidebarCollapsed;
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get recent note objects from IDs
  const recentNoteObjects = recentNotes
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean);

  // Filter notes by search query
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredResults = searchQuery.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo-name" onClick={() => navigate('/dashboard')}>
        <img src="/assets/Logo.svg" className="sidebar-logo" alt="TerraNote" />
        <span className="sidebar-name">TerraNote</span>
      </div>

      {/* Hamburger + Search icon */}
      <div className="sidebar-menu">
        <img
          className="sidebar-ham"
          src="/assets/hamburger.svg"
          alt="menu"
          onClick={toggleSidebar}
        />
        <img
          className="sidebar-search-icon"
          src="/assets/search.svg"
          alt="search"
        />
      </div>

      {/* Search bar */}
      <div className="sidebar-search-bar">
        <img src="/assets/search.svg" className="sidebar-search-input-icon" alt="" />
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Search results dropdown */}
      {filteredResults.length > 0 && !collapsed && (
        <div className="sidebar-recents-list open">
          {filteredResults.slice(0, 5).map((note) => (
            <div
              key={note.id}
              className="sidebar-recent-item"
              onClick={() => {
                navigate(`/editor/${note.id}`);
                setSearchQuery('');
              }}
            >
              <span className="sidebar-recent-dot" />
              {note.title}
            </div>
          ))}
        </div>
      )}

      {/* Navigation items */}
      <div className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-items ${isActive ? 'active' : ''}`
          }
        >
          <img src="/assets/Dashboard.svg" className="sidebar-items-img" alt="" />
          <span className="sidebar-items-text">DashBoard</span>
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) =>
            `sidebar-items ${isActive ? 'active' : ''}`
          }
        >
          <img src="/assets/Notes.svg" className="sidebar-items-img" alt="" />
          <span className="sidebar-items-text">Your Notes</span>
        </NavLink>

        <NavLink
          to="/graph"
          className={({ isActive }) =>
            `sidebar-items ${isActive ? 'active' : ''}`
          }
        >
          <img src="/assets/graph.svg" className="sidebar-items-img" alt="" />
          <span className="sidebar-items-text">Graphs</span>
        </NavLink>
      </div>

      {/* Recents accordion */}
      <div
        className="sidebar-recents"
        onClick={() => !collapsed && setRecentsOpen(!recentsOpen)}
      >
        <img className="sidebar-recents-img" src="/assets/recents.svg" alt="" />
        <span className="sidebar-recents-text">Recents</span>
        <img
          className={`sidebar-recents-arrow ${recentsOpen ? 'open' : ''}`}
          src="/assets/up arrow.svg"
          alt=""
        />
      </div>

      {/* Recents list */}
      {!collapsed && (
        <div className={`sidebar-recents-list ${recentsOpen ? 'open' : ''}`}>
          {recentNoteObjects.map((note) => (
            <div
              key={note.id}
              className="sidebar-recent-item"
              onClick={() => navigate(`/editor/${note.id}`)}
            >
              <span className="sidebar-recent-dot" />
              {note.title}
            </div>
          ))}
        </div>
      )}

      {/* Bottom buttons */}
      <div className="sidebar-bottom">
        <div className="sidebar-bottom-btn">
          <img className="sidebar-bottom-btn-img" src="/assets/settings.svg" alt="" />
          <span className="sidebar-bottom-btn-text">Settings</span>
        </div>
        <div className="sidebar-bottom-btn">
          <img className="sidebar-bottom-btn-img" src="/assets/user.svg" alt="" />
          <span className="sidebar-bottom-btn-text">User</span>
        </div>
        <div className="sidebar-bottom-btn sidebar-logout-btn" onClick={() => navigate('/login')}>
          <svg className="sidebar-bottom-btn-img" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="sidebar-bottom-btn-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

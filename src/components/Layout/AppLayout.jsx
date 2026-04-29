import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Greeting from '../Greeting/Greeting';
import useAppStore from '../../store/useAppStore';
import './AppLayout.css';

const AppLayout = () => {
  const collapsed = useAppStore((state) => state.settings.sidebarCollapsed);

  return (
    <div className="app-layout">
      <Sidebar />
      <main
        className="app-main"
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        }}
      >
        <Greeting />
        <hr
          className="break-top"
        />
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

import useAppStore from '../../store/useAppStore';
import './Greeting.css';

const Greeting = () => {
  const user = useAppStore((state) => state.user);
  const collapsed = useAppStore((state) => state.settings.sidebarCollapsed);

  // Compute time-of-day from system clock
  const hour = new Date().getHours();
  let timeOfDay = 'Morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
  else if (hour >= 17) timeOfDay = 'Evening';

  return (
    <div
      className="user-greetings"
      style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      <span className="greetings">
        Good {timeOfDay}, {user.name}
      </span>
    </div>
  );
};

export default Greeting;

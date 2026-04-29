import useAppStore from '../../store/useAppStore';
import LivingNoteCard from './LivingNoteCard';
import SoilCard from './SoilCard';
import ActivityCard from './ActivityCard';
import PlantCard from './PlantCard';
import QuoteCard from './QuoteCard';
import './Dashboard.css';

const Dashboard = () => {
  const notes = useAppStore((s) => s.notes);
  const connections = useAppStore((s) => s.connections);
  const user = useAppStore((s) => s.user);

  const pinnedNote = notes.find((n) => n.isPinned) || notes[0];

  return (
    <div className="dashboard-grid">
      <LivingNoteCard note={pinnedNote} />
      <SoilCard
        totalSeeds={notes.length}
        density={connections.length}
        streak={user.streak}
      />
      <ActivityCard />
      <PlantCard noteCount={notes.length} />
      <QuoteCard userName={user.name} />
    </div>
  );
};

export default Dashboard;

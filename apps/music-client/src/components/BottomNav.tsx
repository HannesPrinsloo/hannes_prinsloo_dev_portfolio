import { Users, Calendar, CheckSquare, Presentation } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    role: 'manager' | 'teacher' | 'admin';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, role }) => {

    // Define tabs based on role
    const getTabs = () => {
        if (role === 'manager') {
            return [
                { id: 'students', label: 'Students', icon: Users },
                { id: 'schedule', label: 'Classes', icon: Calendar },
                { id: 'attendance', label: 'Attend', icon: CheckSquare },
                { id: 'events', label: 'Events', icon: Presentation }, // Or Music icon
            ];
        }
        if (role === 'teacher') {
            return [
                { id: 'roster', label: 'Roster', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'attendance', label: 'Attend', icon: CheckSquare },
                { id: 'events', label: 'Events', icon: Presentation },
            ];
        }
        // Admin fallback (can expand later)
        return [];
    };

    const tabs = getTabs();

    if (tabs.length === 0) return null;

    return (
        <div className="bottom-nav" style={{ display: 'flex' }}> {/* Inline style to force display during dev if CSS fails, but class controls it */}
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'var(--primary-red)' : '#888',
                            padding: '8px',
                            flex: 1,
                            cursor: 'pointer'
                        }}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: isActive ? '600' : '400' }}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;

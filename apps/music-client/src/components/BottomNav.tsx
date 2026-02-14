import { useState } from 'react';
import { Users, Calendar, CheckSquare, Presentation, MoreHorizontal, UserCog, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    role: 'manager' | 'teacher' | 'admin';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, role }) => {
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Define tabs based on role
    const getTabs = () => {
        if (role === 'manager') {
            return [
                { id: 'students', label: 'Students', icon: Users },
                { id: 'schedule', label: 'Classes', icon: Calendar },
                { id: 'attendance', label: 'Attend', icon: CheckSquare },
                { id: 'events', label: 'Events', icon: Presentation },
            ];
        }
        if (role === 'teacher') {
            return [
                { id: 'roster', label: 'Roster', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'events', label: 'Events', icon: Presentation },
                { id: 'attendance', label: 'Attend', icon: CheckSquare },
            ];
        }
        if (role === 'admin') {
            return [
                { id: 'Students', label: 'Students', icon: Users },
                { id: 'Teachers', label: 'Teachers', icon: UserCog },
                { id: 'Events', label: 'Events', icon: Presentation },
                { id: 'more', label: 'More', icon: MoreHorizontal },
            ];
        }
        return [];
    };

    const tabs = getTabs();

    // Admin extra tabs that live in the "More" menu
    const adminMoreTabs = [
        { id: 'Managers', label: 'Managers', icon: Users },
        { id: 'Admins', label: 'Admins', icon: ShieldAlert },
    ];

    if (tabs.length === 0) return null;

    const handleTabClick = (tabId: string) => {
        if (tabId === 'more') {
            setShowMoreMenu(!showMoreMenu);
        } else {
            setActiveTab(tabId);
            setShowMoreMenu(false);
        }
    };

    const isMoreTabActive = role === 'admin' && adminMoreTabs.map(t => t.id).includes(activeTab);

    return (
        <>
            {/* More Menu Overlay */}
            {showMoreMenu && (
                <div className="more-menu-overlay" onClick={() => setShowMoreMenu(false)}>
                    <div className="more-menu-content" onClick={(e) => e.stopPropagation()}>
                        {adminMoreTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`more-menu-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setShowMoreMenu(false);
                                }}
                            >
                                <tab.icon size={20} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="bottom-nav">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    // Highlight "More" if the active tab is one of the hidden ones
                    const isActive = activeTab === tab.id || (tab.id === 'more' && isMoreTabActive);

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
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
        </>
    );
};

export default BottomNav;

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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:hidden" onClick={() => setShowMoreMenu(false)}>
                    <div className="bg-white w-full rounded-t-2xl p-5 pb-24 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
                        {adminMoreTabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-3.5 p-3.5 w-full border-none text-left text-[1.05rem] rounded-[10px] active:bg-[#f0f0f0] ${activeTab === tab.id ? 'bg-[#fff0f0] text-primary-red' : 'bg-[#f9f9f9] text-[#444]'}`}
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

            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#eee] flex justify-around p-2.5 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    // Highlight "More" if the active tab is one of the hidden ones
                    const isActive = activeTab === tab.id || (tab.id === 'more' && isMoreTabActive);

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex flex-col items-center justify-center p-2 flex-1 cursor-pointer outline-none transition-colors border-none ${isActive ? 'text-primary-red' : 'text-[#888]'}`}
                            style={{ background: 'transparent', WebkitTapHighlightColor: 'transparent' }}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[0.75rem] mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
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

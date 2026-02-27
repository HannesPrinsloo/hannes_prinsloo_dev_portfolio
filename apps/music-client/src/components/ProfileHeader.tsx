import React from 'react';
import '../App.css';
import logo from '../assets/swallow-15-logo.png';

interface ProfileHeaderProps {
    profile: any;
    role: string;
    onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, role, onLogout }) => {
    return (
        /* CHANGELOG: Refactored ProfileHeader to use Tailwind CSS utility classes, replacing custom App.css classes like .profile-header, .desktop-only, and .mobile-only to handle responsive views and styling. Made sure header stays sticky as requested! */
        <div className="sticky top-0 z-[100] flex justify-between items-center px-2.5 md:px-5 py-2.5 bg-header-grey backdrop-blur-[5px] shadow-sm mb-5 text-white rounded-md">
            <div className="flex-shrink-0">
                <img src={logo} alt="S15 Logo" className="h-[40px] md:h-[60px] w-auto" />
            </div>

            {/* Desktop View: Name, Role, ID, Logout */}
            <div className="hidden md:flex items-center gap-5">
                <div className="flex flex-col text-right leading-tight">
                    <span className="font-semibold text-white">{profile.first_name} {profile.last_name}</span>
                    <span className="text-xs text-[#333] bg-white/90 px-2 py-0.5 rounded-xl self-end mt-0.5">{role}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-transparent text-white border border-white/50 px-3.5 py-1.5 rounded-md text-sm hover:bg-white/10 hover:border-white transition-colors"
                >
                    Log Out
                </button>
            </div>

            {/* Mobile View: 3 Pills (Name, Role, ID) */}
            <div className="flex md:hidden flex-1 justify-end">
                <div className="flex gap-2 items-center">
                    <div className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border border-white/10">
                        {profile.first_name} {profile.last_name}
                    </div>
                    <div className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border border-white/10">
                        {role}
                    </div>
                    <div className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm border border-white/10">
                        ID#{profile.user_id}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;

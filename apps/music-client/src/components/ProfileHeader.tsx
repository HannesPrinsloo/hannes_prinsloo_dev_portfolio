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
        <div className="profile-header">
            <div className="header-left">
                <img src={logo} alt="S15 Logo" className="header-logo" />
            </div>

            {/* Desktop View: Name, Role, ID, Logout */}
            <div className="header-right desktop-only">
                <div className="header-info">
                    <span className="header-name">{profile.first_name} {profile.last_name}</span>
                    <span className="header-role-badge">{role}</span>
                </div>
                <button onClick={onLogout} className="header-logout-btn">Log Out</button>
            </div>

            {/* Mobile View: 3 Pills (Name, Role, ID) */}
            <div className="header-right mobile-only">
                <div className="header-pills-row">
                    <div className="header-pill name-pill">
                        {profile.first_name} {profile.last_name}
                    </div>
                    <div className="header-pill role-pill">
                        {role}
                    </div>
                    <div className="header-pill id-pill">
                        ID#{profile.user_id}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
